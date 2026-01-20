import os
import json
import requests
import assemblyai as aai
from pathlib import Path
from typing import List, Dict, Any, Union


def get_assemblyai_client():
    """
    Initialize and return an AssemblyAI client for speech-to-text transcription.
    """
    api_key = os.getenv('ASSEMBLYAI_API_KEY')
    if not api_key:
        raise ValueError("ASSEMBLYAI_API_KEY environment variable is not set")
    
    aai.settings.api_key = api_key
    return aai.Transcriber()


def transcribe_audio(audio_file_path: str) -> Union[List[Dict[str, str]], Any]:
    """
    Transcribe an audio file using AssemblyAI, or load from cache if available.
    
    Args:
        audio_file_path: Path to the audio file to transcribe
        
    Returns:
        If cached: List of dictionaries with 'speaker' and 'message' keys
        If not cached: AssemblyAI transcript object
    """
    # Extract just the filename (without path and extension)
    audio_filename = Path(audio_file_path).stem
    
    # Check for cached transcript in audio_transcripts directory
    backend_dir = Path(__file__).parent
    transcript_dir = backend_dir / 'audio_transcripts'
    cached_file = transcript_dir / f"{audio_filename}.json"

    if cached_file.exists():
        print(f"Loading cached transcript from: {cached_file}")
        with open(cached_file, 'r', encoding='utf-8') as f:
            cached_data = json.load(f).get("transcript")
        # Return as list of dicts if it's already in the right format
        if isinstance(cached_data, list) and all(
            isinstance(item, dict) and 'speaker' in item and 'message' in item
            for item in cached_data
        ):
            return cached_data
    
    # If no cache, transcribe using AssemblyAI
    print(f"Transcribing audio file with AssemblyAI: {audio_file_path}")
    transcriber = get_assemblyai_client()
    transcript = transcriber.transcribe(audio_file_path)
    
    if transcript.error:
        raise Exception(f"Transcription error: {transcript.error}")
    
    return transcript


def openrouter_request(model_name="qwen/qwen3-235b-a22b-2507", messages=[]):
    """
    Make a request to OpenRouter API for LLM completions.
    
    Args:
        model_name: The model to use (default: google/gemini-2.5-flash-lite)
        messages: List of message dictionaries with 'role' and 'content' keys
        
    Returns:
        Response object from requests
    """
    openrouter_key = os.getenv('OPENROUTER_API_KEY')
    if not openrouter_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set")
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {openrouter_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": model_name,
            "messages": messages,
        })
    )
    return response
