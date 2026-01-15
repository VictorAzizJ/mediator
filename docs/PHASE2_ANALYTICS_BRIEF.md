# Mediator Analytics Engine - Phase 2 (Python)

**Prepared for:** Aziz
**Date:** January 2026
**Status:** Ready for Implementation

---

## Objective

Enhance post-conversation analytics by integrating lightweight natural language processing to support deeper behavioral insights.

This engine will ingest the raw session JSON from Phase 1 and output enriched metrics using Python. Focus on using open-source libraries and keeping the output export-ready for dashboards or CSV reports.

---

## Phase 1 Integration

Phase 1 (frontend) captures and exports session data in this format:

```json
{
  "sessionId": "abc123",
  "sessionCode": "6H7VHQ",
  "createdAt": 1705248000000,
  "completedAt": 1705248312000,
  "skillUsed": "DEAR MAN",
  "templateId": "dear-man-conflict",
  "templateName": "Conflict with a Team Member",
  "roundsCompleted": 3,
  "totalRounds": 3,
  "sessionTime": 312,
  "rounds": [
    {
      "round": 1,
      "phase": "setup",
      "inputType": "voice",
      "text": "I'm having a problem with the timeline being pushed back again.",
      "responseLength": 12,
      "volumeFlag": false,
      "startTime": 1705248010000,
      "endTime": 1705248095000,
      "duration": 85,
      "wasRedone": false
    },
    {
      "round": 2,
      "phase": "practice",
      "inputType": "voice",
      "text": "I feel frustrated when deadlines shift without discussion. I need us to agree on a timeline together so I can plan my work. This would help the whole team stay aligned.",
      "responseLength": 32,
      "volumeFlag": false,
      "startTime": 1705248100000,
      "endTime": 1705248195000,
      "duration": 95,
      "wasRedone": true
    },
    {
      "round": 3,
      "phase": "reflect",
      "inputType": "voice",
      "text": "That felt more confident than usual. I think I could negotiate if they push back.",
      "responseLength": 16,
      "volumeFlag": false,
      "startTime": 1705248200000,
      "endTime": 1705248280000,
      "duration": 80,
      "wasRedone": false
    }
  ],
  "volumeFlags": 0,
  "redos": 1,
  "inputTypeBreakdown": {
    "voice": 3,
    "text": 0
  },
  "averageResponseLength": 20,
  "participantCount": 1
}
```

---

## Phase 2 Features to Implement

### 1. Sentiment Analysis

**Goal:** Understand emotional tone per round

**Implementation:**
- Use `nltk` + `VADER` or `textblob` for each round response
- Process the `text` field from each round

**Output:**
```python
{
  "round": 1,
  "sentiment_score": 0.34,  # float -1 to 1
  "sentiment_label": "neutral"  # "positive", "neutral", "negative"
}
```

**Library recommendation:** `vaderSentiment` for social media-style text, `textblob` for simpler analysis

---

### 2. Assertiveness Score (for DEAR MAN + FAST)

**Goal:** Measure how directly the user communicated

**Implementation:**
- Count first-person pronouns ("I", "my", "me")
- Count declarative statements (sentences without question marks, using `spacy` sentence parsing)
- Weight by total word count

**Output:**
```python
{
  "round": 2,
  "assertiveness_score": 0.78,  # float 0-1
  "first_person_count": 4,
  "declarative_count": 3,
  "total_sentences": 4
}
```

**Calculation:**
```python
assertiveness = (first_person_count / word_count * 0.5) + (declarative_ratio * 0.5)
```

---

### 3. Keyword Detection

**Goal:** Check if user incorporated skill-specific language

**Implementation:**
Search for skill-specific terms based on `skillUsed`:

| Skill | Keywords to Detect |
|-------|-------------------|
| DEAR MAN | "I feel", "I want", "I need", "because", "would you", "can we" |
| GIVE | "I understand", "I see", "that makes sense", "help me understand", "I hear you" |
| FAST | "I believe", "It's important", "I can't", "I won't", "my values" |

**Output:**
```python
{
  "round": 2,
  "keywords_detected": {
    "I feel": true,
    "I need": true,
    "because": false,
    "I want": false
  },
  "keyword_match_rate": 0.5  # 2 of 4 keywords found
}
```

**Implementation note:** Use case-insensitive regex or fuzzy matching

---

### 4. Response Verbosity

**Goal:** Track communication detail level

**Implementation:**
- Word count per round (already available from Phase 1)
- Average sentence length using `spacy` or simple split

**Output:**
```python
{
  "round": 2,
  "word_count": 32,
  "sentence_count": 3,
  "avg_sentence_length": 10.67,
  "verbosity_label": "moderate"  # "brief", "moderate", "detailed"
}
```

**Thresholds:**
- Brief: < 10 words
- Moderate: 10-30 words
- Detailed: > 30 words

---

### 5. Skill Fidelity Score (Optional/Advanced)

**Goal:** Measure how well user followed the skill framework

**Implementation:**
Compare response structure to skill model. For DEAR MAN, check for presence of each step:

| Step | Detection Pattern |
|------|------------------|
| D - Describe | Factual statement, no "I feel" |
| E - Express | "I feel", "I felt", emotional words |
| A - Assert | "I want", "I need", "I'd like" |
| R - Reinforce | "because", "this would", "it helps" |
| M - Mindful | Stayed on topic (no tangents) |
| A - Appear confident | No hedging words ("maybe", "just", "sorry") |
| N - Negotiate | "what if", "would you", "can we" |

**Output:**
```python
{
  "skill_fidelity": {
    "score": 0.71,  # 5 of 7 steps detected
    "steps_detected": ["D", "E", "A", "R", "N"],
    "steps_missing": ["M", "A2"],
    "feedback": "Consider maintaining focus and reducing hedging language"
  }
}
```

---

## Recommended Tools & Libraries

| Purpose | Library | Notes |
|---------|---------|-------|
| Sentiment Analysis | `nltk` + `vaderSentiment` | Best for conversational text |
| Alternative Sentiment | `textblob` | Simpler API, good for quick implementation |
| Token Analysis | `spacy` | For sentence parsing, POS tagging |
| Keyword Matching | `regex` or `fuzzywuzzy` | Fuzzy matching for natural language variations |
| Data Processing | `pandas` | For export and reporting |
| Export | `json`, `csv` modules | Standard library |

### Installation

```bash
pip install nltk textblob spacy pandas vaderSentiment fuzzywuzzy python-Levenshtein
python -m spacy download en_core_web_sm
```

---

## Sample Python Structure

```python
# analytics_engine.py

import json
from dataclasses import dataclass
from typing import List, Dict, Optional

import spacy
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd

nlp = spacy.load("en_core_web_sm")
sentiment_analyzer = SentimentIntensityAnalyzer()

@dataclass
class RoundAnalysis:
    round: int
    phase: str
    sentiment_score: float
    sentiment_label: str
    assertiveness_score: float
    keywords_detected: Dict[str, bool]
    keyword_match_rate: float
    word_count: int
    avg_sentence_length: float
    verbosity_label: str

@dataclass
class SessionAnalysis:
    session_id: str
    skill_used: str
    rounds: List[RoundAnalysis]
    overall_sentiment: float
    overall_assertiveness: float
    skill_fidelity_score: Optional[float]

def analyze_session(session_json: dict) -> SessionAnalysis:
    """Main entry point for Phase 2 analysis"""
    rounds = []

    for round_data in session_json["rounds"]:
        analysis = analyze_round(
            round_data,
            skill=session_json["skillUsed"]
        )
        rounds.append(analysis)

    return SessionAnalysis(
        session_id=session_json["sessionId"],
        skill_used=session_json["skillUsed"],
        rounds=rounds,
        overall_sentiment=calculate_overall_sentiment(rounds),
        overall_assertiveness=calculate_overall_assertiveness(rounds),
        skill_fidelity_score=calculate_skill_fidelity(session_json)
    )

def analyze_round(round_data: dict, skill: str) -> RoundAnalysis:
    text = round_data["text"]

    # Sentiment
    sentiment = sentiment_analyzer.polarity_scores(text)
    sentiment_score = sentiment["compound"]
    sentiment_label = get_sentiment_label(sentiment_score)

    # Assertiveness
    assertiveness = calculate_assertiveness(text)

    # Keywords
    keywords = detect_keywords(text, skill)

    # Verbosity
    word_count = len(text.split())
    doc = nlp(text)
    sentences = list(doc.sents)
    avg_sentence_length = word_count / len(sentences) if sentences else 0

    return RoundAnalysis(
        round=round_data["round"],
        phase=round_data["phase"],
        sentiment_score=sentiment_score,
        sentiment_label=sentiment_label,
        assertiveness_score=assertiveness,
        keywords_detected=keywords["detected"],
        keyword_match_rate=keywords["match_rate"],
        word_count=word_count,
        avg_sentence_length=avg_sentence_length,
        verbosity_label=get_verbosity_label(word_count)
    )

# ... additional helper functions
```

---

## Output Format

The Phase 2 engine should output an enriched JSON that extends Phase 1:

```json
{
  "phase1_data": { /* original session JSON */ },
  "phase2_analysis": {
    "analyzed_at": 1705250000000,
    "rounds": [
      {
        "round": 1,
        "sentiment": { "score": -0.12, "label": "neutral" },
        "assertiveness": { "score": 0.45 },
        "keywords": { "detected": {}, "match_rate": 0.0 },
        "verbosity": { "word_count": 12, "label": "moderate" }
      }
      // ... more rounds
    ],
    "overall": {
      "sentiment_trend": "improving",
      "avg_assertiveness": 0.68,
      "skill_fidelity": 0.71,
      "keywords_used": 4
    }
  }
}
```

---

## Integration Points

1. **Input:** Accept Phase 1 JSON export via API endpoint or file upload
2. **Processing:** Run analysis pipeline
3. **Output:** Return enriched JSON or generate PDF report
4. **Storage:** Optionally store in database for longitudinal tracking

---

## Future Considerations (Phase 3+)

- **AI Coaching:** Use analysis to generate personalized feedback
- **Progress Tracking:** Compare sessions over time
- **Team Analytics:** Aggregate across organization
- **Real-time Analysis:** Process during conversation (requires streaming)

---

## Questions for Clarification

1. Should sentiment analysis weight later rounds more heavily (reflecting skill application)?
2. Do you want separate fidelity scoring for GIVE (validation-focused) vs FAST (boundary-focused)?
3. Should we flag specific improvement suggestions based on missing keywords?
4. What's the preferred deployment method (API endpoint, batch processing, or both)?

---

**Ready for implementation. Let me know if you need clarification on any section.**
