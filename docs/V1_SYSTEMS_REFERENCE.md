# Mediator V1 Systems Reference

> Technical documentation for the V1 platform systems implemented for the remote demo and pilot onboarding.

**Last Updated:** January 2025
**Version:** 1.0.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Voice Activity Detection (VAD)](#voice-activity-detection-vad)
3. [Real-time Transcription](#real-time-transcription)
4. [Authentication System](#authentication-system)
5. [Access Code Management](#access-code-management)
6. [Skill Element Tracking](#skill-element-tracking)
7. [Admin Dashboard & Analytics](#admin-dashboard--analytics)
8. [Export Functionality](#export-functionality)
9. [Demo Mode](#demo-mode)
10. [Database Schema](#database-schema)
11. [Environment Variables](#environment-variables)
12. [API Reference](#api-reference)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                             │
├─────────────────────────────────────────────────────────────────────┤
│  React Hooks                                                         │
│  ├── useSileroVAD          - ML-based voice detection               │
│  ├── useDeepgramTranscription - Real-time speech-to-text           │
│  ├── useAuth               - Magic link authentication              │
│  ├── useSkillElementDetector - DBT skill coverage tracking         │
│  ├── useAdminDashboard     - Dashboard data fetching               │
│  └── useExport             - CSV/PDF export utilities              │
├─────────────────────────────────────────────────────────────────────┤
│  Zustand Stores                                                      │
│  ├── sessionStore          - Session state management               │
│  └── analyticsStore        - Analytics tracking                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API ROUTES (Next.js)                         │
├─────────────────────────────────────────────────────────────────────┤
│  /api/auth/magic-link      - Send magic link email                  │
│  /api/auth/verify          - Verify token & create session          │
│  /api/access-codes         - Manage access codes                    │
│  /api/access-codes/validate - Validate access code                  │
│  /api/transcription/token  - Get Deepgram credentials               │
│  /api/admin/analytics      - Dashboard analytics                    │
│  /api/admin/sessions       - Session list with pagination          │
│  /api/demo                 - Demo mode data                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase       - PostgreSQL database                               │
│  Deepgram       - Real-time transcription (Nova-2)                  │
│  Resend         - Transactional email                               │
│  Silero VAD     - ML voice activity detection (WASM)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Voice Activity Detection (VAD)

### Overview

Two VAD implementations are available:

1. **Silero VAD** (Recommended) - ML-based, 96%+ accuracy
2. **Web Audio API** (Fallback) - Threshold-based, simpler

### Silero VAD Hook

**File:** `src/hooks/useSileroVAD.ts`

```typescript
import { useSileroVAD } from '@/hooks';

const {
  isSpeaking,        // Currently speaking
  isListening,       // VAD active
  isLoading,         // Loading WASM model
  speakingDurationMs,// How long user has been speaking
  startListening,    // Start VAD
  stopListening,     // Stop VAD
  resetTurn,         // Reset turn tracking
  error,             // Error message
} = useSileroVAD({
  settings: {
    silenceThresholdMs: 2000,    // Silence before turn ends
    minSpeakingDurationMs: 3000, // Min speaking time
    maxTurnDurationMs: 180000,   // Max turn (3 min)
  },
  onSpeechStart: () => console.log('Speech started'),
  onSpeechEnd: (audioData) => console.log('Speech ended', audioData),
  onTurnShouldEnd: () => console.log('Turn should end'),
});
```

### Audio to WAV Conversion

```typescript
import { audioToWav } from '@/hooks';

// Convert Float32Array audio to WAV blob
const wavBlob = audioToWav(audioData, 16000);
```

### Configuration

Silero VAD uses these tuned parameters:

| Parameter | Value | Description |
|-----------|-------|-------------|
| `positiveSpeechThreshold` | 0.8 | Confidence needed to detect speech |
| `negativeSpeechThreshold` | 0.35 | Threshold to detect speech end |
| `minSpeechFrames` | 4 | Min frames to count as speech |
| `preSpeechPadFrames` | 3 | Frames to include before speech |
| `redemptionFrames` | 8 | Silence frames allowed within speech |

---

## Real-time Transcription

### Overview

Uses Deepgram Nova-2 for real-time speech-to-text with speaker diarization.

**File:** `src/hooks/useDeepgramTranscription.ts`

### Usage

```typescript
import { useDeepgramTranscription } from '@/hooks';

const {
  isConnected,        // WebSocket connected
  isConnecting,       // Connection in progress
  startTranscription, // Start transcribing
  stopTranscription,  // Stop transcribing
  sendAudio,          // Send audio chunk
  transcripts,        // Final transcript segments
  currentInterim,     // Current interim text
  error,
} = useDeepgramTranscription({
  onTranscript: (segment) => {
    console.log('Transcript:', segment.text);
    console.log('Speaker:', segment.speaker);
    console.log('Final:', segment.isFinal);
  },
  onFinalTranscript: (segment) => {
    // Only called for final transcripts
  },
  onConnectionChange: (connected) => {
    console.log('Connected:', connected);
  },
  language: 'en',
  model: 'nova-2',
  enableDiarization: true,
  enablePunctuation: true,
});
```

### Transcript Segment Structure

```typescript
interface TranscriptSegment {
  id: string;
  text: string;
  speaker: number;       // Speaker ID (0, 1, etc.)
  isFinal: boolean;
  confidence: number;
  startTime: number;
  endTime: number;
  words: TranscriptWord[];
}
```

### Helper Functions

```typescript
import { combineTranscripts, groupBySpeaker } from '@/hooks';

// Combine all transcripts into single string
const fullText = combineTranscripts(transcripts);

// Group by speaker for display
const grouped = groupBySpeaker(transcripts);
// [{ speaker: 0, text: "...", startTime, endTime }, ...]
```

### API Endpoint

**GET/POST** `/api/transcription/token`

Returns Deepgram credentials and WebSocket URL.

```json
{
  "key": "deepgram_api_key",
  "url": "wss://api.deepgram.com/v1/listen?model=nova-2&...",
  "expiresAt": 1234567890
}
```

---

## Authentication System

### Overview

Passwordless authentication using magic link emails.

### Flow

```
1. User enters email
2. POST /api/auth/magic-link
3. Email sent with token link
4. User clicks link → /auth/verify?token=xxx
5. GET /api/auth/verify validates token
6. Session token returned, stored in localStorage
```

### Auth Hook

**File:** `src/hooks/useAuth.ts`

```typescript
import { useAuth } from '@/hooks';

const {
  user,              // Current user or null
  isAuthenticated,   // Boolean
  isLoading,         // Checking session
  error,
  login,             // Send magic link
  logout,            // Clear session
  refreshSession,    // Verify session is valid
  updateUser,        // Update local user data
} = useAuth();

// Send magic link
const result = await login('user@example.com');
if (result.success) {
  console.log('Check your email!');
}
```

### User Object

```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  orgId?: string;
  accountType: 'individual' | 'team';
}
```

### Helper Functions

```typescript
import { getSessionToken, isUserAuthenticated } from '@/hooks';

// Get current token (for API calls)
const token = getSessionToken();

// Quick auth check (no hook needed)
if (isUserAuthenticated()) {
  // User is logged in
}
```

### Email Templates

**File:** `src/lib/auth/emails.ts`

- `sendMagicLinkEmail(email, token, baseUrl)` - Sign-in email
- `sendWelcomeEmail(email, name)` - Welcome email for new users

---

## Access Code Management

### Overview

Manage pilot and demo access codes for controlled platform access.

### Validation Flow

```
1. User enters code on demo page
2. POST /api/access-codes/validate
3. Code validated, usage incremented
4. Access granted with type (demo/pilot/enterprise)
```

### API Endpoints

**POST** `/api/access-codes/validate`

```json
// Request
{ "code": "PILOT2025" }

// Response
{
  "valid": true,
  "type": "pilot",
  "orgId": "uuid-or-null",
  "message": "Pilot access granted"
}
```

**GET** `/api/access-codes`

List all access codes (admin).

```json
{
  "codes": [
    {
      "id": "uuid",
      "code": "PILOT2025",
      "type": "pilot",
      "uses_count": 12,
      "max_uses": 50,
      "expires_at": "2025-12-31",
      "is_active": true
    }
  ],
  "count": 1
}
```

**POST** `/api/access-codes`

Create new access code.

```json
// Request
{
  "code": "CUSTOM2025",  // Optional, auto-generated if omitted
  "type": "pilot",       // pilot, demo, enterprise
  "maxUses": 100,        // Optional
  "expiresAt": "2025-12-31", // Optional
  "description": "Q1 pilot program"
}
```

**PATCH** `/api/access-codes`

Update access code.

**DELETE** `/api/access-codes`

Delete access code.

### Hardcoded Demo Code

The code `MEDIATOR2025` always works as a fallback, even without Supabase.

---

## Skill Element Tracking

### Overview

Real-time detection of DBT skill elements (DEAR MAN, GIVE, FAST) in user speech.

**File:** `src/hooks/useSkillElementDetector.ts`

### Usage

```typescript
import { useSkillElementDetector } from '@/hooks';

const {
  coverage,      // Current skill coverage
  analyzeText,   // Analyze text for elements
  addToHistory,  // Add to cumulative history
  reset,         // Reset tracking
  elementInfo,   // Element definitions
} = useSkillElementDetector('DEAR MAN');

// Analyze transcript
analyzeText("I noticed that the deadline was moved. I feel concerned because...");

// Coverage result
console.log(coverage);
// {
//   skill: 'DEAR MAN',
//   elements: [
//     { letter: 'D', word: 'Describe', detected: true, confidence: 0.8 },
//     { letter: 'E', word: 'Express', detected: true, confidence: 0.7 },
//     { letter: 'A', word: 'Assert', detected: false, confidence: 0 },
//     ...
//   ],
//   overallCoverage: 28,  // percentage
//   missingElements: ['A', 'R', 'M', 'A', 'N'],
//   coachingTip: 'Make your request clear - what exactly do you need?'
// }
```

### Detection Patterns

Each skill element has keywords and regex patterns:

| Skill | Elements |
|-------|----------|
| DEAR MAN | D-Describe, E-Express, A-Assert, R-Reinforce, M-Mindful, A-Appear confident, N-Negotiate |
| GIVE | G-Gentle, I-Interested, V-Validate, E-Easy manner |
| FAST | F-Fair, A-Apologies, S-Stick to values, T-Truthful |

### Live Summary Panel Integration

The `LiveSummaryPanel` component accepts skill coverage:

```tsx
<LiveSummaryPanel
  skillUsed="DEAR MAN"
  totalRounds={3}
  currentRound={2}
  rounds={roundAnalytics}
  skillCoverage={coverage}
  currentTranscript={interimText}
/>
```

---

## Admin Dashboard & Analytics

### Overview

Fetch real analytics data from Supabase or mock data for demos.

**File:** `src/hooks/useAdminDashboard.ts`

### Usage

```typescript
import { useAdminDashboard } from '@/hooks';

const {
  analytics,     // Full analytics data
  sessions,      // Session list
  isLoading,
  error,
  refetch,       // Refresh data
  fetchSessions, // Fetch with filters
  pagination,    // Page info
} = useAdminDashboard({
  orgId: 'optional-org-id',
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
});

// Fetch filtered sessions
await fetchSessions({
  skill: 'DEAR MAN',
  page: 2,
  limit: 20,
});
```

### Analytics Response

```typescript
interface AdminAnalytics {
  source: 'mock' | 'supabase';
  stats: {
    totalSessions: number;
    totalRounds: number;
    avgSessionTime: number;
    totalParticipants: number;
    volumeFlagsTotal: number;
    redosTotal: number;
  };
  skillBreakdown: Array<{
    skill: string;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    session_count: number;
    avg_duration: number;
  }>;
  recentSessions: SessionSummary[];
}
```

### API Endpoints

**GET** `/api/admin/analytics`

Query params: `org_id`, `date_from`, `date_to`

**GET** `/api/admin/sessions`

Query params: `org_id`, `user_email`, `skill`, `date_from`, `date_to`, `page`, `limit`

**POST** `/api/admin/sessions`

Get single session with rounds: `{ sessionId: "uuid" }`

---

## Export Functionality

### Overview

Export session data to CSV and PDF formats.

**File:** `src/hooks/useExport.ts` and `src/lib/export.ts`

### Usage

```typescript
import { useExport } from '@/hooks';

const {
  isExporting,
  exportSessionsCSV,
  exportAnalyticsCSV,
  exportAnalyticsPDF,
  exportSessionPDF,
} = useExport();

// Export sessions to CSV
exportSessionsCSV(sessions, 'my-sessions');

// Export analytics to PDF
exportAnalyticsPDF(stats, skillBreakdown, recentSessions, 'monthly-report');
```

### Direct Library Usage

```typescript
import {
  sessionsToCSV,
  analyticsToCSV,
  downloadCSV,
  generateAnalyticsPDF,
  generateSessionPDF,
  downloadPDF,
} from '@/lib/export';

// Generate CSV string
const csv = sessionsToCSV(sessions);
downloadCSV(csv, 'sessions.csv');

// Generate PDF
const doc = generateAnalyticsPDF(stats, breakdown, sessions);
downloadPDF(doc, 'report.pdf');
```

---

## Demo Mode

### Overview

Pre-populated sample data for quick platform exploration.

**File:** `src/lib/demoData.ts`

### Enable Demo Mode

```typescript
import { enableDemoMode, disableDemoMode, isDemoMode } from '@/lib/demoData';

// Enable
enableDemoMode();

// Check
if (isDemoMode()) {
  // Show demo data
}

// Disable
disableDemoMode();
```

### Demo Data Available

```typescript
import {
  demoSessions,      // Sample sessions
  demoStats,         // Dashboard stats
  demoSkillBreakdown,// Skill usage
  demoDailyStats,    // Daily trends
  demoRounds,        // Round details per session
  demoTranscripts,   // Sample transcripts
  demoUsers,         // Sample users
  getDemoAnalytics,  // All analytics
  getDemoSession,    // Single session
  getDemoConversationFlow, // Sample conversation
} from '@/lib/demoData';
```

### Demo API Endpoint

**GET** `/api/demo`

Query params:
- `type=analytics` - Dashboard data
- `type=sessions` - Session list
- `type=session&sessionId=xxx` - Single session
- `type=user` - Demo user
- `type=conversation&skill=DEAR%20MAN` - Conversation flow

---

## Database Schema

### Tables

**File:** `supabase/schema.sql`

| Table | Purpose |
|-------|---------|
| `sessions` | Session records with analytics |
| `session_rounds` | Per-round analytics |
| `transcripts` | Temporary transcripts (24h TTL) |
| `organizations` | B2B organizations |
| `user_profiles` | User accounts |
| `auth_tokens` | Magic link and session tokens |
| `access_codes` | Pilot/demo access codes |

### Key Relationships

```
organizations
    │
    ├── user_profiles (org_id)
    │       │
    │       └── sessions (user_email)
    │               │
    │               ├── session_rounds (session_id)
    │               └── transcripts (session_id)
    │
    └── access_codes (org_id)
```

### Views

- `daily_session_stats` - Aggregated daily metrics
- `skill_usage_stats` - Skill breakdown

### Cleanup Jobs

```sql
-- Clean expired tokens (run hourly)
SELECT cleanup_expired_tokens();

-- Clean expired transcripts (run hourly)
SELECT cleanup_expired_transcripts();
```

---

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Deepgram (for transcription)
DEEPGRAM_API_KEY=xxx

# Resend (for email)
RESEND_API_KEY=re_xxx
EMAIL_FROM=Mediator <noreply@yourdomain.com>
```

### Optional

```bash
# App URL (for magic links)
NEXT_PUBLIC_APP_URL=https://app.mediator.com

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001

# Redis (falls back to in-memory)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/magic-link` | Send magic link email |
| GET | `/api/auth/verify?token=xxx` | Verify token, create session |
| POST | `/api/auth/verify` | Verify session token |

### Access Codes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/access-codes` | List access codes |
| POST | `/api/access-codes` | Create access code |
| PATCH | `/api/access-codes` | Update access code |
| DELETE | `/api/access-codes` | Delete access code |
| POST | `/api/access-codes/validate` | Validate code |

### Transcription

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transcription/token` | Check service status |
| POST | `/api/transcription/token` | Get Deepgram credentials |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET | `/api/admin/sessions` | Session list |
| POST | `/api/admin/sessions` | Session details |

### Demo

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demo?type=xxx` | Get demo data |
| POST | `/api/demo` | Enable/disable demo mode |

---

## Quick Start

### 1. Set up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Copy credentials to `.env.local`

### 2. Set up Deepgram

1. Create account at [deepgram.com](https://deepgram.com)
2. Generate API key
3. Add to `DEEPGRAM_API_KEY`

### 3. Set up Resend

1. Create account at [resend.com](https://resend.com)
2. Add and verify domain
3. Add API key to `RESEND_API_KEY`
4. Update `EMAIL_FROM` with verified domain

### 4. Run the app

```bash
npm install
npm run dev
```

### 5. Access demo

Use code `MEDIATOR2025` to access without full setup.

---

## Troubleshooting

### "Transcription service not configured"

Add `DEEPGRAM_API_KEY` to `.env.local`

### "Email service not configured"

Add `RESEND_API_KEY` to `.env.local`

### Magic link not received

1. Check spam folder
2. Verify domain in Resend dashboard
3. Check `EMAIL_FROM` uses verified domain

### VAD not detecting speech

1. Check microphone permissions
2. Try refreshing the page
3. Check browser console for errors

### Dashboard showing mock data

Supabase not configured or credentials invalid. Check:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial V1 release with VAD, transcription, auth, and analytics |
