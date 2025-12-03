# Mediator

A safe space for difficult conversations. Mediator is a web application that guides families through emotionally challenging dialogues with structure, clarity, and accountability.

## Features

- **Structured Turn-Taking**: Clear timers and visual cues for speaking and listening turns
- **Real-Time Volume Monitoring**: Gentle alerts when voices rise
- **Trigger Detection**: AI-powered detection of blame language and communication patterns that escalate conflict
- **Reflection Prompts**: Thoughtful prompts to encourage perspective-taking
- **Breathing Exercises**: 4-7-8 breathing technique for co-regulation
- **Conversation Summaries**: Neutral, AI-generated summaries with private notes
- **Device Sync**: Connect two phones for in-person mediated conversations
- **Trauma-Informed Design**: Soft colors, gentle transitions, and always-visible exit options

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Socket.io for real-time sync
- **AI**: Claude API (with local fallbacks)
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your Anthropic API key to .env.local (optional - local AI fallbacks work without it)
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
```

## Key Design Decisions

### Trauma-Informed UX
- Soft color palette (no harsh reds or stark contrasts)
- Invitational language ("Would you like to..." not "You should...")
- Always-visible exit options
- Reduced motion support
- Non-punitive timer display

### Privacy First
- Audio is processed in real-time and never stored
- Transcripts exist only in memory during sessions
- Summaries are stored locally by default
- Private notes are never synced

### Graceful Degradation
- Works without Claude API (local AI fallbacks)
- Works offline after initial load
- Works with microphone permissions denied (manual input)

## Demo Day Tips

1. **Test on two physical devices** for the most impressive demo
2. **Pre-create a session** so you don't wait during the demo
3. **Use the trigger detection** - say "You always..." to show the pause feature
4. **Show the breathing exercise** - it's a crowd-pleaser
5. **Highlight the summary** - emphasize neutral language and private notes

## License

MIT
