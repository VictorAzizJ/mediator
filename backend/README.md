# Mediator Backend

FastAPI backend for the Mediator app: sentiment analysis, transcript reports API, and SQLite-backed metrics.

## Running the server

From the `backend` directory, start the API server with:

```bash
uv run main.py
```

This uses [uv](https://docs.astral.sh/uv/) to run the project’s Python environment and starts the app with **uvicorn** on **http://0.0.0.0:8000**.

- **Root:** http://localhost:8000/
- **API docs (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Prerequisites

- **Python 3.12+**
- **uv** (install: `curl -LsSf https://astral.sh/uv/install.sh | sh`)

Install dependencies (if needed):

```bash
uv sync
```

## Environment

Optional `.env` in `backend/` for:

- `ASSEMBLYAI_API_KEY` – used by the audio transcription pipeline
- `OPENROUTER_API_KEY` – used by the analysis pipeline

The reports API reads from a local SQLite DB (`transcripts.db`). Populate it by running the audio processing script (see repo root or `scripts/process_audio.py`).

## Main endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `POST /sentiment` | VADER sentiment for a single text |
| `GET /api/reports/speakers` | List speakers |
| `GET /api/reports/transcripts` | List meeting transcripts |
| `GET /api/reports/categories` | List categories (sentiment, dear_man, fast) |
| `GET /api/reports/metrics` | Aggregated metrics (optional filters) |
| `GET /api/reports/pie-chart-data` | Data for pie charts |

CORS is set for `http://localhost:3000` and `http://127.0.0.1:3000` so the Next.js frontend can call the API.
