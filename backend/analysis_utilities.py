"""
Analysis utilities for Mediator session analytics.
Provides standalone functions for sentiment analysis and assertiveness scoring.
"""

import re
from typing import Tuple, Dict
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download VADER lexicon (only needed once)
nltk.download('vader_lexicon', quiet=True)

# Initialize VADER analyzer
sia = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> Tuple[str, float]:
    """
    Analyze the sentiment of the given text using VADER.
    
    Args:
        text: The text to analyze
        
    Returns:
        A tuple of (sentiment_label, sentiment_score) where:
        - sentiment_label is one of "positive", "neutral", "negative"
        - sentiment_score is the compound score from -1 to 1
    """
    # Get VADER scores
    scores = sia.polarity_scores(text)
    
    # Find which sentiment (neg, neu, pos) has the highest score
    sentiment_scores = {
        "negative": scores["neg"],
        "neutral": scores["neu"],
        "positive": scores["pos"],
    }
    
    # Get the label with the highest score
    sentiment_label = max(sentiment_scores, key=sentiment_scores.get)
    
    # Use compound score as the sentiment_score (-1 to 1)
    sentiment_score = round(scores["compound"], 2)
    
    return sentiment_label, sentiment_score


def calculate_assertiveness(text: str) -> Dict:
    """
    Calculate an assertiveness score for DEAR MAN + FAST skill practice.
    
    Measures how directly the user communicated by:
    - Counting first-person pronouns ("I", "my", "me")
    - Counting declarative statements (sentences without question marks)
    - Weighting by total word count
    
    Formula: assertiveness = (first_person_count / word_count * 0.5) + (declarative_ratio * 0.5)
    
    Args:
        text: The text to analyze
        
    Returns:
        A dict containing:
        - assertiveness_score: float 0-1
        - first_person_count: int
        - declarative_count: int
        - total_sentences: int
    """
    if not text or not text.strip():
        return {
            "assertiveness_score": 0.0,
            "first_person_count": 0,
            "declarative_count": 0,
            "total_sentences": 0,
        }
    
    # Count first-person pronouns (case-insensitive)
    # Match "I", "my", "me" as whole words
    first_person_pattern = r'\b(I|my|me)\b'
    first_person_matches = re.findall(first_person_pattern, text, re.IGNORECASE)
    first_person_count = len(first_person_matches)
    
    # Count words
    words = text.split()
    word_count = len(words)
    
    # Split into sentences using basic punctuation
    # This handles ., !, and ? as sentence terminators
    sentences = re.split(r'[.!?]+', text)
    # Filter out empty sentences
    sentences = [s.strip() for s in sentences if s.strip()]
    total_sentences = len(sentences)
    
    # Count declarative statements (sentences that don't end with ?)
    # We need to check the original text for question marks
    # Find all sentence-ending punctuation and check if they're questions
    sentence_endings = re.findall(r'[.!?]+', text)
    
    declarative_count = 0
    for ending in sentence_endings:
        if '?' not in ending:
            declarative_count += 1
    
    # Handle case where text doesn't end with punctuation
    if total_sentences > len(sentence_endings):
        # The last sentence has no punctuation, assume declarative
        declarative_count += (total_sentences - len(sentence_endings))
    
    # Calculate declarative ratio
    declarative_ratio = declarative_count / total_sentences if total_sentences > 0 else 0
    
    # Calculate first-person ratio (normalized)
    # Cap at 1.0 to prevent scores > 1 when there are many first-person pronouns
    first_person_ratio = min(first_person_count / word_count, 1.0) if word_count > 0 else 0
    
    # Calculate assertiveness score using the formula from the brief
    # assertiveness = (first_person_count / word_count * 0.5) + (declarative_ratio * 0.5)
    assertiveness_score = (first_person_ratio * 0.5) + (declarative_ratio * 0.5)
    
    # Ensure score is between 0 and 1
    assertiveness_score = max(0.0, min(1.0, assertiveness_score))
    
    return {
        "assertiveness_score": round(assertiveness_score, 2),
        "first_person_count": first_person_count,
        "declarative_count": declarative_count,
        "total_sentences": total_sentences,
    }
