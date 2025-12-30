# Mediator

A safe space for difficult conversations. Mediator is a web application that guides families through emotionally challenging dialogues with structure, clarity, and accountability.

## Current Features

### Core Conversation Tools
- **Structured Turn-Taking**: Clear timers and visual cues for speaking and listening turns
- **Real-Time Volume Monitoring**: Gentle alerts when voices rise
- **Trigger Detection**: AI-powered detection of blame language and communication patterns that escalate conflict
- **Reflection Prompts**: Thoughtful prompts to encourage perspective-taking
- **Breathing Exercises**: 4-7-8 breathing technique for co-regulation
- **Conversation Summaries**: Neutral, AI-generated summaries with private notes
- **Device Sync**: Connect two phones for in-person mediated conversations
- **Trauma-Informed Design**: Soft colors, gentle transitions, and always-visible exit options

### Security & Reliability (Implemented Dec 2024)
- **Persistent Sessions**: Redis-backed storage with 24-hour TTL
- **Session Reconnection**: Resume conversations after page refresh or disconnection
- **Cryptographic Security**: Session codes and participant IDs use `crypto.randomBytes` and `crypto.randomUUID`
- **Input Validation**: All socket events validated with Zod schemas
- **Rate Limiting**: Protection against brute-force attacks on session join (10/min) and creation (5/min)
- **State Injection Protection**: Whitelisted fields prevent malicious session manipulation

## Upcoming Features (Designed)

### Licensed Therapist/Advisor Integration (Priority 5)
Allow clients to invite licensed mental health professionals to observe and support their conversations:
- **NPI Registry Verification**: Automatic license validation
- **Granular Permissions**: All access OFF by default, client controls visibility
- **Real-Time Observation**: Therapists can watch sessions live (with consent)
- **Therapist Prompts**: Send reflection prompts to clients during conversation
- **Multi-Therapist Support**: Each party can have their own therapist observing
- **HIPAA Audit Trail**: Immutable logging of all therapist access
- **Consent Matrix**: Partner identity requires BOTH parties' consent

### Self-Awareness Conversation Analysis (Priority 6)
Private, non-punitive tools for personal communication growth:
- **Private Analytics**: Per-participant insights never shared with partner
- **Self-Defined Triggers**: Choose your own words and thresholds to monitor
- **Non-Punitive Nudges**: "Your voice is getting louder. Take a breath?" (partner never sees)
- **Anonymous Pause Requests**: "Someone requested a pause" (no attribution)
- **Client-Side Encryption**: Sensitive trigger words encrypted locally
- **Post-Session Dashboard**: Speaking time, volume patterns, self-awareness moments
- **Therapist Sharing**: Optionally share insights with your support person

> See [ROADMAP.md](./ROADMAP.md) for full implementation details, database schemas, and socket events.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Socket.io for real-time sync, Redis for session persistence
- **AI**: Claude API (with local fallbacks)
- **State**: Zustand
- **Validation**: Zod schemas for all inputs
- **Security**: crypto module for secure IDs, rate limiting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis (optional - falls back to in-memory storage)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your Anthropic API key to .env.local (optional - local AI fallbacks work without it)
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001

# Optional
ANTHROPIC_API_KEY=your_api_key_here
REDIS_URL=redis://localhost:6379
```

### Running the App

```bash
# Run both Next.js and Socket.io server
npm run dev:all

# Or run separately:
npm run dev        # Next.js on http://localhost:3000
npm run dev:socket # Socket.io on http://localhost:3001
```

### Testing a Conversation

1. Open http://localhost:3000 on two browser windows/devices
2. On the first window, click "Start a new conversation" and enter your name
3. Copy the 6-digit session code
4. On the second window, click "Join an existing conversation" and enter the code
5. Both users set their intentions and begin

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/ai/            # Claude AI endpoints
│   ├── globals.css        # Trauma-informed design system
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main orchestrator
├── components/
│   ├── breathing/         # Breathing exercise component
│   ├── conversation/      # Main conversation screens
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── useSocket.ts       # WebSocket connection
│   ├── useVolumeMonitor.ts # Microphone volume
│   ├── useSpeechRecognition.ts # Speech-to-text
│   └── useAI.ts           # Claude API integration
├── lib/
│   ├── ai.ts              # AI utilities and local fallbacks
│   └── socket.ts          # Socket.io client
├── store/
│   └── session.ts         # Zustand state management
└── types/
    └── index.ts           # TypeScript types

server.js                  # Socket.io server with Redis, rate limiting, validation
ROADMAP.md                 # Detailed feature roadmap and implementation log
ROADMAP-IOS.md             # iOS native app roadmap
```

## Key Design Decisions

### Trauma-Informed UX
- Soft color palette (no harsh reds or stark contrasts)
- Invitational language ("Would you like to..." not "You should...")
- Always-visible exit options
- Reduced motion support
- Non-punitive timer display
- Growth-oriented framing ("Communication Coach" not surveillance)

### Privacy First
- Audio is processed in real-time and never stored
- Transcripts exist only in memory during sessions
- Summaries are stored locally by default
- Private notes are never synced
- Self-awareness nudges are private to each participant
- Client-side encryption planned for sensitive trigger words

### Security
- Cryptographically secure session codes (not guessable)
- UUID v4 participant IDs (not forgeable)
- Zod schema validation on all inputs
- Rate limiting prevents brute-force attacks
- Field whitelisting prevents state injection
- TLS 1.3 required for production (HIPAA compliance)

### Graceful Degradation
- Works without Claude API (local AI fallbacks)
- Works without Redis (falls back to in-memory)
- Works offline after initial load
- Works with microphone permissions denied (manual input)

## Roadmap

| Priority | Status | Description |
|----------|--------|-------------|
| Priority 1 | Mostly Complete | Critical blockers (security, persistence) |
| Priority 2 | Planned | Beta launch features (trust indicators, error handling) |
| Priority 3 | Planned | Public launch (accessibility, localization) |
| Priority 4 | Planned | Post-launch enhancements (advanced AI, scalability) |
| Priority 5 | Designed | Licensed therapist/advisor integration |
| Priority 6 | Designed | Self-awareness conversation analysis |

See [ROADMAP.md](./ROADMAP.md) for the complete roadmap with:
- Detailed task breakdowns with owners and file references
- Database schemas (5 new tables designed)
- Socket event specifications (16 new events)
- UI component inventory (9 new components)
- Implementation phases and dependencies
- HIPAA compliance requirements

## Demo Day Tips

1. **Test on two physical devices** for the most impressive demo
2. **Pre-create a session** so you don't wait during the demo
3. **Use the trigger detection** - say "You always..." to show the pause feature
4. **Show the breathing exercise** - it's a crowd-pleaser
5. **Highlight the summary** - emphasize neutral language and private notes

## Contributing

See [ROADMAP.md](./ROADMAP.md) for current priorities and task assignments.

## License

MIT
