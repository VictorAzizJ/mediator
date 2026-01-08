# Mediator

A structured conversation platform for emotionally difficult dialogues. Originally designed for families, now production-ready for enterprise teams — HR departments, managers, and workplace conflict resolution.

## Vision

**B2C (Free):** A safe space for family conversations — structured turn-taking, trigger detection, and trauma-informed design.

**B2B (Enterprise):** Professional tools for HR teams, 1-on-1 check-ins, and conflict resolution — observer modes, compliance logging, and team health analytics.

> **v0 Release (Jan 2025):** Production-ready for organizations with full analytics, transcription, and enterprise landing page.

---

## Current Status

### What's Built & Working

| Feature | Status | Last Updated |
|---------|--------|--------------|
| **Core Conversation** | | |
| Turn-taking with configurable duration (60/90/120s) | ✅ Working | Jan 2025 |
| Session creation/joining (6-char codes) | ✅ Working | Dec 2024 |
| Real-time sync via Socket.io | ✅ Working | Dec 2024 |
| Volume monitoring with auto-pause | ✅ Working | Dec 2024 |
| Breathing exercise (synced, skippable) | ✅ Working | Jan 2025 |
| Round control (unlimited/3/5) | ✅ Working | Jan 2025 |
| End conversation button | ✅ Working | Jan 2025 |
| **Security & Reliability** | | |
| Redis session persistence | ✅ Working | Dec 2024 |
| Session reconnection | ✅ Working | Dec 2024 |
| Zod input validation | ✅ Working | Dec 2024 |
| Rate limiting (join: 10/min, create: 5/min) | ✅ Working | Dec 2024 |
| Secure session codes (crypto) | ✅ Working | Dec 2024 |
| Privacy consent flow | ✅ Working | Jan 2025 |
| Microphone permission flow | ✅ Working | Jan 2025 |
| Error boundaries | ✅ Working | Jan 2025 |
| **B2B Features** | | |
| Observer mode | ✅ Working | Jan 2025 |
| Admin dashboard | ✅ Working | Jan 2025 |
| Check-in templates (10 workplace scenarios) | ✅ Working | Jan 2025 |
| Speaking time tracking | ✅ Working | Jan 2025 |
| PDF export | ✅ Working | Jan 2025 |
| Audit logging | ✅ Working | Jan 2025 |
| **v0 Features** | | |
| Real-time transcription (Deepgram) | ✅ Ready | Jan 2025 |
| Speaker diarization | ✅ Ready | Jan 2025 |
| Conversation health analytics | ✅ Ready | Jan 2025 |
| User analytics dashboard | ✅ Ready | Jan 2025 |
| Enterprise landing page | ✅ Ready | Jan 2025 |

---

## Architecture

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Socket.io, Redis (optional fallback to in-memory)
- **AI**: Claude API (Anthropic) with local fallbacks
- **Transcription**: Deepgram API (Nova-2 with diarization)
- **State**: Zustand
- **Validation**: Zod schemas
- **Security**: Node.js crypto module, rate limiting

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Next.js App                        Web Audio API          │
│   ┌─────────────────┐               ┌─────────────────┐    │
│   │ React Components│               │ Volume Monitor  │    │
│   │ Zustand Store   │               │ Audio Streaming │    │
│   │ Socket.io Client│               └────────┬────────┘    │
│   └────────┬────────┘                        │             │
│            │                                 │             │
└────────────┼─────────────────────────────────┼─────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Socket.io Server          Next.js API           Deepgram  │
│   ┌─────────────────┐      ┌───────────────┐    ┌────────┐ │
│   │ Session Mgmt    │      │ /ai/trigger   │    │ Nova-2 │ │
│   │ Turn Control    │      │ /ai/summarize │    │ WSS    │ │
│   │ Audit Logging   │      │ /ai/prompt    │    └────────┘ │
│   │ Rate Limiting   │      │ /transcription│               │
│   └────────┬────────┘      └───────────────┘               │
│            │                                               │
└────────────┼───────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Redis (Sessions)         PostgreSQL (Analytics)          │
│   ┌─────────────────┐      ┌─────────────────┐             │
│   │ TTL: 24 hours   │      │ Metrics         │             │
│   │ Session State   │      │ Audit Logs      │             │
│   │ Participant Data│      │ Team Health     │             │
│   └─────────────────┘      └─────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### Core Conversation Tools
- **Structured Turn-Taking**: Configurable timers (60/90/120s) with visual cues
- **Real-Time Volume Monitoring**: Gentle alerts when voices rise
- **Trigger Detection**: AI-powered detection of blame language and escalation
- **Reflection Prompts**: Thoughtful prompts for perspective-taking
- **Breathing Exercises**: 4-7-8 breathing with sync (can be skipped)
- **Conversation Summaries**: Neutral, AI-generated summaries with private notes

### B2B Enterprise Features
- **Observer Mode**: HR/coaches can observe with participant consent
- **Check-in Templates**: 10 pre-built workplace scenarios (1-on-1s, conflict resolution, performance)
- **Speaking Time Analytics**: Visual % split with balance tracking
- **PDF Export**: Compliance-ready documentation
- **Admin Dashboard**: Session management and team oversight
- **Audit Logging**: Complete activity trail for compliance

### v0 Analytics Stack
- **Conversation Health Scoring**: Balance, regulation, engagement, safety metrics
- **Real-Time Transcription**: Deepgram Nova-2 with speaker diarization
- **Trend Analysis**: Track improvement over time
- **Coaching Insights**: AI-generated personalized recommendations
- **Role-Based Access**: Individuals see their data, managers see aggregates

### Security & Privacy
- **Redis Session Persistence**: 24-hour TTL with secure fallback
- **Cryptographic Security**: `crypto.randomBytes` for all tokens
- **Input Validation**: Zod schemas on all socket events
- **Rate Limiting**: Brute-force protection
- **Privacy Consent Flow**: GDPR-aligned opt-in
- **Audit Trail**: Immutable logging for compliance

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis (optional)

### Installation

```bash
git clone <repo>
cd mediator
npm install
cp .env.local.example .env.local
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001

# AI Features (optional but recommended)
ANTHROPIC_API_KEY=your_anthropic_key

# Transcription (optional)
DEEPGRAM_API_KEY=your_deepgram_key

# Session Storage (optional, falls back to in-memory)
REDIS_URL=redis://localhost:6379

# Production
NEXT_PUBLIC_APP_URL=https://mediator.app
NODE_ENV=production
```

### Running the App

```bash
# Run both servers (recommended)
npm run dev:all

# Or separately:
npm run dev        # Next.js on :3000
npm run dev:socket # Socket.io on :3001
```

### URLs

| Route | Purpose |
|-------|---------|
| `/` | Enterprise marketing landing page |
| `/demo` | Full conversation app (code-protected: `MEDIATOR2025`) |
| `/admin` | Admin dashboard |
| `/observer` | Observer join page |

---

## Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── api/
│   │   ├── ai/              # Claude AI endpoints
│   │   └── transcription/   # Deepgram token endpoint
│   ├── admin/               # Admin dashboard page
│   ├── demo/                # Code-protected conversation app
│   ├── observer/            # Observer join page
│   └── page.tsx             # Enterprise landing page
├── components/
│   ├── admin/               # Admin dashboard components
│   ├── analytics/           # Health scores, trends, insights
│   ├── breathing/           # Breathing exercise
│   ├── conversation/        # Main screens
│   ├── observer/            # Observer mode components
│   ├── onboarding/          # Privacy, mic permissions
│   ├── templates/           # Check-in template selector
│   ├── transcription/       # Real-time transcript UI
│   └── ui/                  # Reusable components
├── hooks/
│   ├── useSocket.ts         # Socket.io management
│   ├── useVolumeMonitor.ts  # Microphone volume
│   └── useTranscription.ts  # Deepgram transcription
├── lib/
│   ├── ai.ts                # AI helpers with fallbacks
│   ├── analytics.ts         # Metrics calculations
│   ├── deepgram.ts          # Transcription client
│   ├── checkInTemplates.ts  # B2B templates
│   └── pdfExport.ts         # PDF generation
├── store/
│   └── session.ts           # Zustand state
└── types/
    └── index.ts             # TypeScript definitions

server.js                    # Socket.io server
V0-IMPLEMENTATION-PLAN.md    # Detailed v0 specs
ROADMAP.md                   # Feature roadmap
```

---

## B2B Use Cases

| Use Case | Template | Target Buyer |
|----------|----------|--------------|
| **Weekly 1-on-1s** | `weekly-1on1` | Managers, HR |
| **Conflict Resolution** | `conflict-resolution` | HR, Employee Relations |
| **Performance Check-ins** | `performance-review` | Managers, HR |
| **Stay Interviews** | `stay-interview` | HR, Retention Teams |
| **Project Retrospectives** | `project-retro` | Engineering Managers |
| **Feedback Exchange** | `feedback-exchange` | Teams, Peers |
| **Career Development** | `career-development` | Managers, L&D |
| **Onboarding Check-ins** | `onboarding-checkin` | Managers, HR |
| **Return from Leave** | `return-from-leave` | HR, Managers |
| **Difficult Conversations** | `difficult-conversation` | HR, Managers |

---

## Analytics Metrics

### Conversation Health Score (0-100)

| Metric | Weight | Description |
|--------|--------|-------------|
| Communication Balance | 25% | Equal speaking time distribution |
| Emotional Regulation | 30% | Pause usage, trigger response |
| Engagement Depth | 20% | Turn duration, reflection engagement |
| Safety Indicator | 25% | Completion rate, trigger patterns |

### Role-Based Access

| Role | Can See |
|------|---------|
| **Individual** | Own metrics, own transcripts, personal trends |
| **Manager** | Team aggregates, anonymized patterns |
| **HR Admin** | Org-wide health, department comparisons |

---

## Design Principles

### Trauma-Informed UX
- Soft colors, no harsh reds
- Invitational language ("Would you like to...")
- Always-visible exit options
- Reduced motion support
- Non-punitive framing

### Privacy First
- Audio processed in real-time, never stored (unless transcription enabled)
- Private notes never synced to partner
- Individual metrics private by default
- Aggregation before sharing up the chain

### B2B Professional Tone
- Workplace-appropriate language
- Consent-based observation
- Compliance-ready logging
- Growth-oriented analytics (not surveillance)

---

## Deployment Checklist

### Pre-Production
- [ ] SSL/TLS certificates configured
- [ ] CORS restricted to production domains
- [ ] Rate limiting tuned
- [ ] Redis instance configured
- [ ] Environment variables set
- [ ] Error tracking (Sentry) configured

### Production
- [ ] Load testing completed
- [ ] Accessibility audit passed
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented

---

## Contributing

See [ROADMAP.md](./ROADMAP.md) for detailed task breakdowns and [V0-IMPLEMENTATION-PLAN.md](./V0-IMPLEMENTATION-PLAN.md) for v0 specifications.

## License

MIT
