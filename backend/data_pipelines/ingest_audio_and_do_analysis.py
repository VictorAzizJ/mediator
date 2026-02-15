import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, List, Union

from backend.clients import transcribe_audio, openrouter_request
from backend.prompts import (
    SENTIMENT_EVALUATION_PROMPT,
    DEAR_MAN_EVALUATION_PROMPT,
    FAST_EVALUATION_PROMPT,
    SENTIMENT_TRANSCRIPT_PROMPT,
    DEAR_MAN_TRANSCRIPT_PROMPT,
    FAST_TRANSCRIPT_PROMPT,
)
from dotenv import load_dotenv
import re

load_dotenv()


def transform_to_utterance_list(transcript: Union[List[Dict[str, str]], Any]) -> List[Dict[str, str]]:
    """
    Transform transcript into a list of dictionaries with 'speaker' and 'message' keys.
    
    Args:
        transcript: Either a list of dicts (cached) or an AssemblyAI transcript object
        
    Returns:
        List of dictionaries with 'speaker' and 'message' keys
    """
    # If it's already a list of dicts (cached), return it
    if isinstance(transcript, list) and all(
        isinstance(item, dict) and 'speaker' in item and 'message' in item
        for item in transcript
    ):
        return transcript
    
    # Otherwise, it's an AssemblyAI transcript object - extract utterances
    utterance_list = []
    # Check if speaker diarization is available
    if hasattr(transcript, 'utterances') and transcript.utterances:
        # Use utterances with speaker labels
        for utterance in transcript.utterances:
            speaker = utterance.speaker if hasattr(utterance, 'speaker') else "Unknown"
            text = utterance.text if hasattr(utterance, 'text') else ""
            utterance_list.append({
                "speaker": f"Speaker {speaker}" if not speaker.startswith("Speaker") else speaker,
                "message": text
            })
    else:
        # Fallback: use the full text without speaker labels
        text = transcript.text if hasattr(transcript, 'text') else str(transcript)
        utterance_list.append({
            "speaker": "Speaker",
            "message": text
        })
    
    return utterance_list


def format_transcript_for_analysis(utterance_list: List[Dict[str, str]]) -> str:
    """
    Format a list of utterance dictionaries into a string for analysis.
    
    Args:
        utterance_list: List of dictionaries with 'speaker' and 'message' keys
        
    Returns:
        Formatted transcript string with speaker labels
    """
    formatted_lines = []
    
    for utterance in utterance_list:
        speaker = utterance.get('speaker', 'Unknown')
        message = utterance.get('message', '')
        formatted_lines.append(f"{speaker}: {message}")
    return "\n\n".join(formatted_lines)


def analyze_transcript(
    transcript: str,
    category: str,
    model_name: str = "openai/gpt-4o-mini"
) -> Dict[str, Any]:
    """
    Analyze an entire transcript for a single category using transcript-level prompts.
    Returns the API response containing a "messages" array with per-message results for that category.
    """
    if category == 'sentiment':
        prompt_template = SENTIMENT_TRANSCRIPT_PROMPT
    elif category == 'dear_man':
        prompt_template = DEAR_MAN_TRANSCRIPT_PROMPT
    elif category == 'fast':
        prompt_template = FAST_TRANSCRIPT_PROMPT
    else:
        raise ValueError(f"Unknown category: {category}. Must be 'sentiment', 'dear_man', or 'fast'")

    prompt = prompt_template.format(transcript=transcript)
    messages = [
        {"role": "system", "content": "You are a helpful assistant that categorizes transcript messages based on guidelines. Always respond with valid JSON."},
        {"role": "user", "content": prompt}
    ]
    response = openrouter_request(model_name=model_name, messages=messages)

    if response.status_code != 200:
        raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")

    response_data = response.json()
    analysis_text = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")

    try:
        json_match = re.search(r'\{[\s\S]*\}', analysis_text)
        if json_match:
            analysis = json.loads(json_match.group(0))
            return analysis
    except json.JSONDecodeError as e:
        print(f"Warning: Could not parse JSON response for {category}: {e}")
        return {"raw_response": analysis_text, "error": str(e)}

    return {"raw_response": analysis_text}


def merge_category_results_into_messages(
    utterance_list: List[Dict[str, str]],
    sentiment_result: Dict[str, Any],
    dear_man_result: Dict[str, Any],
    fast_result: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Merge per-category LLM results so each message has sentiment, dear_man, and fast fields.
    Matches by index (same order as transcript); fills from utterance_list when category missing.
    """
    categories = ["sentiment", "dear_man", "fast"]
    results = [sentiment_result, dear_man_result, fast_result]

    def get_messages(data: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not data or "messages" not in data:
            return []
        return data.get("messages", [])

    # Start with one row per utterance
    merged: List[Dict[str, Any]] = []
    for u in utterance_list:
        merged.append({
            "speaker": u.get("speaker", "Unknown"),
            "text": u.get("message", ""),
        })

    for cat, data in zip(categories, results):
        messages = get_messages(data)
        if not messages and ("error" in data or "raw_response" in data):
            for row in merged:
                row[cat] = data
            continue
        for i, msg in enumerate(messages):
            if i >= len(merged):
                break
            if cat in msg:
                merged[i][cat] = msg[cat]
            elif "error" in msg or "raw_response" in msg:
                merged[i][cat] = msg
            else:
                merged[i][cat] = msg

    return merged

def analyze_single_message(
    speaker: str,
    message: str,
    category: str,
    model_name: str = "openai/gpt-4o-mini"
) -> Dict[str, Any]:
    """
    Analyze a single message for a specific category (sentiment, dear_man, or fast).
    
    Args:
        speaker: The speaker identifier
        message: The message text to analyze
        category: The category to analyze ('sentiment', 'dear_man', or 'fast')
        model_name: OpenRouter model name to use
        
    Returns:
        Dictionary containing the analysis result for the category
    """
    # Select the appropriate prompt based on category
    if category == 'sentiment':
        prompt_template = SENTIMENT_EVALUATION_PROMPT
    elif category == 'dear_man':
        prompt_template = DEAR_MAN_EVALUATION_PROMPT
    elif category == 'fast':
        prompt_template = FAST_EVALUATION_PROMPT
    else:
        raise ValueError(f"Unknown category: {category}. Must be 'sentiment', 'dear_man', or 'fast'")
    
    # Format the prompt with the message
    prompt = prompt_template.format(speaker=speaker, message=message)
    
    # Call OpenRouter API
    messages = [
        {"role": "system", "content": "You are a helpful assistant that categorizes transcript messages based on guidelines. Always respond with valid JSON."},
        {
            "role": "user",
            "content": prompt
        }
    ]
    
    response = openrouter_request(model_name=model_name, messages=messages)

    # Check for errors
    if response.status_code != 200:
        raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
    
    response_data = response.json()
    
    # Extract the analysis from the response
    analysis_text = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
    
    # Parse JSON response
    try:
        json_match = re.search(r'\{[\s\S]*\}', analysis_text)
        if json_match:
            analysis = json.loads(json_match.group(0))
            return analysis
    except json.JSONDecodeError as e:
        # If JSON parsing fails, return the raw text
        print(f"Warning: Could not parse JSON response for {category}: {e}")
        analysis = {"raw_response": analysis_text, "error": str(e)}
    
    return analysis


def analyze_audio_conversation(audio_file_path: str, model_name: str = "mistralai/ministral-8b-2512") -> Dict[str, Any]:
    """
    Analyze an audio file by transcribing it and evaluating sentiment and DEAR MAN + FAST adherence.
    Analyzes each message separately for each category.
    
    Args:
        audio_file_path: Path to the audio file to analyze
        model_name: OpenRouter model name to use for analysis (default: google/gemini-2.5-flash-lite)
        
    Returns:
        Dictionary containing:
        - transcript: The full transcript text
        - analysis: The LLM analysis with messages array, each containing sentiment, dear_man, and fast
        - raw_transcript: The raw transcript info (id, status, confidence) or None if cached
    """
    # Step 1: Transcribe audio (may return cached list or AssemblyAI transcript)
    print(f"Processing audio file: {audio_file_path}")
    transcript_result = transcribe_audio(audio_file_path)
    
    # Step 2: Transform to utterance list format
    utterance_list = transform_to_utterance_list(transcript_result)
    
    # Step 3: Format transcript for display
    transcript_text = format_transcript_for_analysis(utterance_list)
    
    # Get full transcript text (for backward compatibility)
    full_transcript_text = "\n".join([f"{u['speaker']}: {u['message']}" for u in utterance_list])
    
    # Step 4: Analyze entire transcript per category, then merge so each message has sentiment, dear_man, fast
    print(f"Analyzing transcript across 3 categories (sentiment, dear_man, fast)...")
    categories = ["sentiment", "dear_man", "fast"]
    raw_category_results: Dict[str, Dict[str, Any]] = {}

    for category in categories:
        try:
            print(f"  Running {category}...")
            category_result = analyze_transcript(transcript_text, category, model_name)
            raw_category_results[category] = category_result
        except Exception as e:
            print(f"Error analyzing {category} for transcript: {e}")
            raw_category_results[category] = {"error": str(e)}

    analyzed_messages = merge_category_results_into_messages(
        utterance_list,
        raw_category_results.get("sentiment", {}),
        raw_category_results.get("dear_man", {}),
        raw_category_results.get("fast", {}),
    )

    # Step 5: Write LLM outputs to JSON for later use
    backend_dir = Path(__file__).resolve().parent.parent
    transcript_dir = backend_dir / "audio_transcripts"
    transcript_dir.mkdir(parents=True, exist_ok=True)
    stem = Path(audio_file_path).stem
    analysis_path = transcript_dir / f"{stem}_analysis.json"
    output_payload = {
        "transcript": full_transcript_text,
        "transcript_with_speakers": transcript_text,
        "raw_category_results": raw_category_results,
        "messages": analyzed_messages,
    }
    with open(analysis_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2, ensure_ascii=False)
    print(f"Wrote analysis to {analysis_path}")

    # Determine raw_transcript info
    raw_transcript_info = None
    if not isinstance(transcript_result, list):
        # It was an AssemblyAI transcript object
        raw_transcript_info = {
            "id": transcript_result.id if hasattr(transcript_result, 'id') else None,
            "status": transcript_result.status if hasattr(transcript_result, 'status') else None,
            "confidence": transcript_result.confidence if hasattr(transcript_result, 'confidence') else None,
        }
    return {
        "transcript": full_transcript_text,
        "transcript_with_speakers": transcript_text,
        "analysis": {
            "messages": analyzed_messages
        },
        "raw_transcript": raw_transcript_info,
    }
