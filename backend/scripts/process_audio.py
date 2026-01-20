#!/usr/bin/env python3
"""
Script to process audio files and store analysis results in the database.

Usage:
    python -m backend.scripts.process_audio <audio_file_path> [--meeting-name NAME] [--meeting-date DATE]
"""

import sys
import os
import argparse
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import backend modules
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir.parent))

from backend.data_pipelines.ingest_audio_and_do_analysis import analyze_audio_conversation
from backend.database import (
    get_or_create_speaker,
    create_meeting_transcript,
    create_transcript_message,
    create_transcript_message_tag,
    init_database
)


def process_audio_file(
    audio_file_path: str,
    meeting_name: str = None,
    meeting_date: str = None
):
    """
    Process an audio file: transcribe, analyze, and store results in database.
    
    Args:
        audio_file_path: Path to the audio file
        meeting_name: Optional name for the meeting transcript (defaults to filename)
        meeting_date: Optional date for the meeting (defaults to current date)
    """
    # Validate audio file exists
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
    
    # Analyze audio
    print(f"Processing audio file: {audio_file_path}")
    result = analyze_audio_conversation(audio_file_path)
    
    analysis = result.get('analysis', {})
    messages = analysis.get('messages', [])
    
    if not messages:
        print("Warning: No messages found in analysis. Analysis structure:")
        print(analysis)
        return
    
    # Create meeting transcript
    if meeting_name is None:
        meeting_name = os.path.basename(audio_file_path)
    
    transcript_id = create_meeting_transcript(meeting_name, meeting_date)
    print(f"Created meeting transcript: {meeting_name} (ID: {transcript_id})")
    
    # Process each message
    for msg_idx, message in enumerate(messages):
        speaker_name = message.get('speaker', 'Unknown')
        text = message.get('text', '')
        
        # Get or create speaker
        speaker_id = get_or_create_speaker(speaker_name)
        
        # Create transcript message
        message_id = create_transcript_message(transcript_id, speaker_id, text)
        
        # Process sentiment
        sentiment = message.get('sentiment', {})
        if sentiment:
            sentiment_label = sentiment.get('label')
            if sentiment_label:
                create_transcript_message_tag(
                    message_id,
                    category='sentiment',
                    sub_category=None,
                    label=sentiment_label,
                    score=None
                )
        
        # Process DEAR MAN
        dear_man = message.get('dear_man', {})
        if dear_man:
            # Store overall score
            dear_man_score = dear_man.get('score')
            if dear_man_score is not None:
                create_transcript_message_tag(
                    message_id,
                    category='dear_man',
                    sub_category='overall',
                    label=None,
                    score=float(dear_man_score)
                )
            
            # Store breakdown for each skill
            breakdown = dear_man.get('breakdown', {})
            dear_man_skills = [
                'describe', 'express', 'assert', 'reinforce',
                'mindful', 'appear_confident', 'negotiate'
            ]
            
            for skill in dear_man_skills:
                skill_data = breakdown.get(skill, {})
                if skill_data:
                    adhered = skill_data.get('adhered', False)
                    # Store as label: 'adhered' or 'did_not_adhere'
                    label = 'adhered' if adhered else 'did_not_adhere'
                    score = 1.0 if adhered else 0.0
                    
                    create_transcript_message_tag(
                        message_id,
                        category='dear_man',
                        sub_category=skill,
                        label=label,
                        score=score
                    )
        
        # Process FAST
        fast = message.get('fast', {})
        if fast:
            # Store overall score
            fast_score = fast.get('score')
            if fast_score is not None:
                create_transcript_message_tag(
                    message_id,
                    category='fast',
                    sub_category='overall',
                    label=None,
                    score=float(fast_score)
                )
            
            # Store breakdown for each skill
            breakdown = fast.get('breakdown', {})
            fast_skills = ['fair', 'apologies', 'stick_to_values', 'truthful']
            
            for skill in fast_skills:
                skill_data = breakdown.get(skill, {})
                if skill_data:
                    adhered = skill_data.get('adhered', False)
                    # Store as label: 'adhered' or 'did_not_adhere'
                    label = 'adhered' if adhered else 'did_not_adhere'
                    score = 1.0 if adhered else 0.0
                    
                    create_transcript_message_tag(
                        message_id,
                        category='fast',
                        sub_category=skill,
                        label=label,
                        score=score
                    )
        
        print(f"Processed message {msg_idx + 1}/{len(messages)} from {speaker_name}")
    
    print(f"Successfully processed {len(messages)} messages and stored in database.")


def main():
    parser = argparse.ArgumentParser(
        description='Process audio file and store analysis in database'
    )
    parser.add_argument(
        '--audio_file',
        type=str,
        help='Path to the audio file to process'
    )
    parser.add_argument(
        '--meeting-name',
        type=str,
        default=None,
        help='Name for the meeting transcript (defaults to filename)'
    )
    parser.add_argument(
        '--meeting-date',
        type=str,
        default=None,
        help='Date for the meeting in ISO format (defaults to current date)'
    )
    
    args = parser.parse_args()
    
    try:
        process_audio_file(
            args.audio_file,
            meeting_name=args.meeting_name,
            meeting_date=args.meeting_date
        )
    except Exception as e:
        print(f"Error processing audio file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
