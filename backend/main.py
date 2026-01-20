from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from database import (
    get_all_speakers,
    get_all_transcripts,
    get_average_scores,
    get_pie_chart_data,
    get_subcategory_adherence_counts,
)

# Download VADER lexicon (only needed once)
nltk.download('vader_lexicon', quiet=True)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize VADER analyzer
sia = SentimentIntensityAnalyzer()


class SentimentRequest(BaseModel):
    round: int
    text: str


class SentimentResponse(BaseModel):
    round: int
    sentiment_score: float
    sentiment_label: str


@app.get("/")
def hello_world():
    return {"message": "Hello World"}


@app.post("/sentiment", response_model=SentimentResponse)
def analyze_sentiment(request: SentimentRequest):
    # Get VADER scores
    scores = sia.polarity_scores(request.text)
    
    # Find which sentiment (neg, neu, pos) has the highest score
    sentiment_scores = {
        "negative": scores["neg"],
        "neutral": scores["neu"],
        "positive": scores["pos"],
    }
    
    # Get the label with the highest score
    sentiment_label = max(sentiment_scores, key=sentiment_scores.get)
    
    # Use compound score as the sentiment_score (-1 to 1)
    sentiment_score = scores["compound"]
    
    return SentimentResponse(
        round=request.round,
        sentiment_score=round(sentiment_score, 2),
        sentiment_label=sentiment_label,
    )


# Reports API endpoints
@app.get("/api/reports/speakers")
def get_speakers():
    """Get all speakers."""
    return get_all_speakers()


@app.get("/api/reports/transcripts")
def get_transcripts():
    """Get all meeting transcripts."""
    return get_all_transcripts()


@app.get("/api/reports/categories")
def get_categories():
    """Get available categories."""
    return ["sentiment", "dear_man", "fast"]


@app.get("/api/reports/metrics")
def get_metrics(
    category: str = Query(default="dear_man", description="Category to get metrics for"),
    speaker_id: Optional[int] = Query(default=None, description="Filter by speaker ID"),
    meeting_transcript_id: Optional[int] = Query(default=None, description="Filter by transcript ID"),
):
    """Get aggregated metrics for a category."""
    averages = get_average_scores(category, speaker_id, meeting_transcript_id)
    
    # Get label counts for subcategories
    label_counts = {}
    
    if category == "sentiment":
        # For sentiment, get label counts (positive, negative, neutral)
        counts = get_pie_chart_data(category, None, speaker_id, meeting_transcript_id)
        label_counts["sentiment"] = {item["label"]: item["count"] for item in counts}
    elif category == "dear_man":
        # For DEAR MAN, get adherence counts for each subcategory
        subcategories = ["describe", "express", "assert", "reinforce", "mindful", "appear_confident", "negotiate"]
        for subcat in subcategories:
            counts = get_subcategory_adherence_counts(category, subcat, speaker_id, meeting_transcript_id)
            label_counts[subcat] = counts
    elif category == "fast":
        # For FAST, get adherence counts for each subcategory
        subcategories = ["fair", "apologies", "stick_to_values", "truthful"]
        for subcat in subcategories:
            counts = get_subcategory_adherence_counts(category, subcat, speaker_id, meeting_transcript_id)
            label_counts[subcat] = counts
    
    return {
        "averages": {category: averages},
        "label_counts": {category: label_counts}
    }


@app.get("/api/reports/pie-chart-data")
def get_pie_chart_data_endpoint(
    category: str = Query(description="Category to get data for"),
    sub_category: Optional[str] = Query(default=None, description="Sub-category filter"),
    speaker_id: Optional[int] = Query(default=None, description="Filter by speaker ID"),
    meeting_transcript_id: Optional[int] = Query(default=None, description="Filter by transcript ID"),
):
    """Get data formatted for pie charts."""
    data = get_pie_chart_data(category, sub_category, speaker_id, meeting_transcript_id)
    return {"data": data}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)