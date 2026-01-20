"""
Test script for the sentiment analysis API at localhost:8000

Run the server first: python main.py
Then run this test: python test_sentiment.py
"""

import requests

BASE_URL = "http://localhost:8000"


def test_sentiment(round_num: int, text: str):
    """Call the /sentiment endpoint and print results."""
    response = requests.post(
        f"{BASE_URL}/sentiment",
        json={"round": round_num, "text": text},
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Round {result['round']}:")
        print(f"  Text: \"{text[:50]}{'...' if len(text) > 50 else ''}\"")
        print(f"  Score: {result['sentiment_score']}")
        print(f"  Label: {result['sentiment_label']}")
        print()
        return result
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None


def main():
    print("=" * 60)
    print("Sentiment Analysis API Test")
    print("=" * 60)
    print()

    # Test cases with different sentiments
    test_cases = [
        (1, "I love this! It's absolutely amazing and wonderful."),
        (2, "This is terrible. I'm so disappointed and frustrated."),
        (3, "The meeting is scheduled for 3pm tomorrow."),
        (4, "I appreciate your help, but I'm a bit concerned about the timeline."),
        (5, "Thank you so much for your kindness and support!"),
        (6, "I hate waiting. This is the worst experience ever."),
        (7, "The weather today is cloudy with a chance of rain."),
    ]

    print("Testing various sentiment samples:\n")
    
    results = []
    for round_num, text in test_cases:
        result = test_sentiment(round_num, text)
        if result:
            results.append(result)

    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    positive = sum(1 for r in results if r["sentiment_label"] == "positive")
    negative = sum(1 for r in results if r["sentiment_label"] == "negative")
    neutral = sum(1 for r in results if r["sentiment_label"] == "neutral")
    
    print(f"Total tests: {len(results)}")
    print(f"  Positive: {positive}")
    print(f"  Negative: {negative}")
    print(f"  Neutral: {neutral}")


if __name__ == "__main__":
    main()
