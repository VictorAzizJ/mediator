┌─────────────────────────────────────────────────────────────┐
│                    LIVE SESSION                             │
│  User speaks/types → Round tracked → Volume monitored       │
│                          ↓                                  │
│              useAnalyticsStore (Zustand)                    │
│              - startRound(), endRound()                     │
│              - flagVolumeAlert()                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   SESSION ENDS                              │
│              endSession() → SessionAnalytics                │
│                          ↓                                  │
│              getSessionSummary() → SessionSummaryExport     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    DISPLAY                                  │
│  SessionAnalyticsSummary ← receives SessionSummaryExport    │
│  - Shows stats grid (rounds, time, input type, alerts)      │
│  - Expandable round-by-round breakdown                      │
│  - Export to JSON/CSV/Email                                 │
└─────────────────────────────────────────────────────────────┘


Example Curls:
curl -H "Content-Type: application/json" --data @backend/tests/body.json http://localhost:8000/sentiment