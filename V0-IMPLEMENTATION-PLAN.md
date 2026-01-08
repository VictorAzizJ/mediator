# Mediator v0 Implementation Plan

## Executive Summary

This document outlines the path from current MVP to production-ready v0, covering:
- Part 1: Core App Polish (B2C + B2B consolidation)
- Part 2: Analytics for Conversation Health
- Part 3: Enterprise Landing Page

---

## Part 1: Finalize & Polish Core App

### 1.1 What's Left to Polish Before Deployment

#### Critical (Must-Have for v0)

| Area | Issue | Solution | Priority |
|------|-------|----------|----------|
| **Security** | No WSS (WebSocket over SSL) | Configure TLS in production deployment | P0 |
| **Admin Dashboard** | Mock data only | Wire to real audit logs + session data | P0 |
| **Template Integration** | Templates exist but not selectable | Integrate into SetupScreen flow | P0 |
| **Error Handling** | Limited retry mechanisms | Add exponential backoff for API calls | P1 |
| **Mobile Polish** | Untested on mobile devices | Test and fix responsive issues | P1 |

#### Nice-to-Have (Post-v0)

| Area | Issue | Solution | Priority |
|------|-------|----------|----------|
| Accessibility | Missing ARIA labels | Add comprehensive a11y | P2 |
| i18n | Spanish toggle exists, no translations | Implement next-intl | P2 |
| Offline Support | No offline-first | Add service worker + local queue | P3 |

### 1.2 B2C → B2B Feature Translation

| B2C Feature | B2B Application | Modifications Needed |
|-------------|-----------------|---------------------|
| **Turn-taking timer** | Manager 1-on-1s, conflict resolution | ✅ Works as-is |
| **Volume monitoring** | Escalation prevention in HR meetings | Add aggregate reporting |
| **Trigger detection** | Early warning for HR/coaches | Add trend tracking |
| **Breathing exercise** | De-escalation tool | Add skip option for time-pressed meetings |
| **Summary generation** | Documentation for HR records | Add export to HR systems |
| **Session recovery** | Enterprise reliability | Extend to 7-day recovery |
| **Private notes** | Personal reflection | Add manager-visible notes option |
| **PDF export** | Compliance documentation | Add org branding, metadata |

### 1.3 Current Bottlenecks

#### Speaker Clarity
- **Issue**: No speaker diarization - transcript entries attributed manually by turn
- **Impact**: Can't distinguish overlapping speech or interruptions
- **Solution**: Integrate Deepgram real-time transcription with speaker labels

#### Volume Monitoring
- **Issue**: Single threshold (75) doesn't account for:
  - Microphone sensitivity variations
  - Background noise levels
  - Individual speaking volumes
- **Impact**: False positives/negatives on escalation detection
- **Solution**:
  - Add calibration step at conversation start
  - Use rolling baseline with adaptive thresholds
  - Add noise floor detection

#### Trigger Accuracy
- **Issue**: Local regex patterns catch obvious cases but miss:
  - Passive-aggressive language
  - Cultural variations in communication
  - Sarcasm and tone
- **Impact**: Under-detection of subtle conflict patterns
- **Solution**:
  - Always use Claude API for trigger detection (local as fallback only)
  - Add confidence scoring
  - Track false positive feedback for model improvement

### 1.4 Speaker Diarization Recommendation

#### Recommended: Deepgram

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO PIPELINE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Browser                    Server                Deepgram  │
│  ┌───────┐                 ┌───────┐             ┌───────┐  │
│  │ Mic   │ ──WebSocket──▶  │Socket │ ──WSS──▶   │  API  │  │
│  │ Audio │                 │  .io  │             │       │  │
│  └───────┘                 └───────┘             └───────┘  │
│      │                         │                     │      │
│      │                         │◀── Transcript ──────┘      │
│      │                         │    + Speaker Labels        │
│      │                         │                            │
│      │◀──── Broadcast ─────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why Deepgram:**
- Real-time streaming (low latency)
- Built-in speaker diarization
- Punctuation and formatting
- Multiple language support
- Reasonable pricing ($0.0043/min for Nova-2)

**Implementation:**

```typescript
// lib/deepgram.ts
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export function createTranscriptionStream(sessionId: string) {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  const connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
    diarize: true,           // Enable speaker separation
    diarize_version: '3',
    punctuate: true,
    interim_results: true,   // Show words as they're spoken
    utterance_end_ms: 1000,
    vad_events: true,        // Voice activity detection
  });

  return connection;
}
```

**Alternative Options:**

| Provider | Real-time | Diarization | Price/min | Notes |
|----------|-----------|-------------|-----------|-------|
| **Deepgram** | ✅ Yes | ✅ Built-in | $0.0043 | Recommended |
| AssemblyAI | ✅ Yes | ✅ Built-in | $0.0050 | Good accuracy |
| Whisper API | ❌ Batch | ❌ No | $0.0060 | High accuracy, not real-time |
| Whisper + Pyannote | ❌ Batch | ✅ Separate | Self-hosted | Privacy-first option |

### 1.5 Real-Time Transcription UX Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              TRANSCRIPTION UI COMPONENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Current Speaker: Alex                         🔴 REC │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  [Alex - 2:34]                                      │   │
│  │  "I feel like we haven't really talked about..."   │   │
│  │  ████████████░░░░ (typing indicator)               │   │
│  │                                                     │   │
│  │  [Jordan - 2:12]                                    │   │
│  │  "That's a fair point. I think what I was trying   │   │
│  │   to say was..."                                    │   │
│  │                                                     │   │
│  │  [Alex - 1:45]                                      │   │
│  │  "I understand, but I need you to hear that..."    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Speaking Balance    [Alex ████████░░ Jordan]  62%   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Patterns:**

1. **Color-coded speakers**
   - Current user: Blue/Calm-700
   - Other participant: Gray/Calm-400
   - Observer notes: Amber (if enabled)

2. **Interim results styling**
   - Lower opacity for in-progress text
   - Subtle animation/pulse
   - Finalized text appears solid

3. **Trigger highlighting**
   - Detected triggers: Soft red background
   - Click to see suggested reframe

4. **Accessibility**
   - High contrast mode option
   - Font size controls
   - Screen reader announcements for speaker changes

---

## Part 2: Analytics for Conversation Health

### 2.1 Metrics Specification

#### Real-Time Metrics (During Conversation)

| Metric | Calculation | Update Frequency |
|--------|-------------|------------------|
| Speaking balance | % time each participant | Every 5 seconds |
| Current speaker duration | Seconds since last switch | Continuous |
| Volume level | Normalized 0-100 | 100ms |
| Trigger count | Cumulative this session | On detection |
| Pause count | Total pauses taken | On pause |

#### Post-Session Metrics

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Listening ratio** | (Partner speaking time) / (Total time) | Balance indicator |
| **Interruption rate** | Speaker switches before turn end / Total switches | Respect indicator |
| **Tone stability** | Variance in volume levels | Emotional regulation |
| **Pause utilization** | Pauses taken vs. triggers detected | Self-regulation |
| **Reflection depth** | Avg words per turn / prompt engagement | Engagement quality |
| **Resolution rate** | % of sessions ending with agreements | Outcome tracking |

### 2.2 Role-Based Metrics Access

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INDIVIDUAL USER                                            │
│  ├── Own speaking time & balance                            │
│  ├── Personal trigger patterns                              │
│  ├── Own pause/breathing usage                              │
│  ├── Personal growth trends (anonymized)                    │
│  └── Full transcript (own sessions only)                    │
│                                                             │
│  TEAM COACH / MANAGER                                       │
│  ├── Team aggregate speaking balance                        │
│  ├── Session frequency & completion rates                   │
│  ├── Anonymized trigger frequency trends                    │
│  ├── Team health score (composite)                          │
│  └── NO individual transcripts without consent              │
│                                                             │
│  HR ADMINISTRATOR                                           │
│  ├── Organization-wide health scores                        │
│  ├── Department comparison (anonymized)                     │
│  ├── Usage statistics (adoption, frequency)                 │
│  ├── Compliance exports (metadata only)                     │
│  └── NO individual data unless legal requirement            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Data Model

```typescript
// types/analytics.ts

interface ConversationMetrics {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  duration: number;

  // Participant metrics
  participants: ParticipantMetrics[];

  // Aggregate metrics
  speakingBalance: number;        // 0-1, where 0.5 is perfectly balanced
  interruptionCount: number;
  averageTurnDuration: number;
  pauseCount: number;
  triggerCount: number;

  // Outcome
  endReason: 'completed' | 'ended_early' | 'disconnected';
  agreementsMade: number;
  reflectionPromptsShown: number;
  reflectionPromptsEngaged: number;
}

interface ParticipantMetrics {
  participantId: string;
  role: 'host' | 'guest';

  // Speaking
  totalSpeakingTime: number;
  turnCount: number;
  averageTurnDuration: number;
  longestTurn: number;

  // Behavior
  interruptionsMade: number;
  interruptionsReceived: number;
  pausesRequested: number;
  breathingExercisesCompleted: number;

  // Triggers
  triggersDetected: number;
  triggerTypes: Record<string, number>;

  // Volume
  averageVolume: number;
  volumeSpikes: number;       // Count of >threshold moments
  volumeVariance: number;
}

interface TeamHealthScore {
  teamId: string;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: number;

  // Composite scores (0-100)
  overallHealth: number;
  communicationBalance: number;
  emotionalRegulation: number;
  engagementDepth: number;

  // Trends
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;

  // Anonymized breakdown
  sessionCount: number;
  averageDuration: number;
  completionRate: number;
}
```

### 2.4 Privacy Layer

```typescript
// lib/analyticsPrivacy.ts

interface PrivacyConfig {
  // Individual level
  individualCanSee: {
    ownMetrics: true;
    ownTranscripts: true;
    ownTrends: true;
    partnerMetrics: false;      // Only aggregate
  };

  // Manager level
  managerCanSee: {
    teamAggregates: true;
    anonymizedTrends: true;
    individualMetrics: false;   // Requires explicit consent
    transcripts: false;         // Never without legal requirement
  };

  // HR level
  hrCanSee: {
    orgAggregates: true;
    departmentComparisons: true;  // Anonymized
    individualData: false;        // Requires legal/compliance flag
    auditLogs: true;              // Metadata only
  };
}

// Anonymization functions
function anonymizeForTeam(metrics: ParticipantMetrics[]): AnonymizedMetrics {
  return {
    averageSpeakingBalance: calculateAverage(metrics.map(m => m.totalSpeakingTime)),
    totalSessions: metrics.length,
    // No individual IDs or names
  };
}

function aggregateForOrg(teamMetrics: TeamHealthScore[]): OrgHealthScore {
  return {
    departmentScores: teamMetrics.map(t => ({
      departmentId: t.teamId,  // Pseudonymized
      score: t.overallHealth,
    })),
    // Minimum 5 participants per bucket to prevent identification
  };
}
```

### 2.5 Storage Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  REAL-TIME (Hot)                                            │
│  ┌─────────┐                                                │
│  │  Redis  │  TTL: 24 hours                                 │
│  │         │  • Active session state                        │
│  │         │  • Real-time metrics                           │
│  │         │  • WebSocket pub/sub                           │
│  └────┬────┘                                                │
│       │                                                     │
│       ▼ (on session end)                                    │
│  OPERATIONAL (Warm)                                         │
│  ┌─────────┐                                                │
│  │Postgres │  Retention: 90 days                            │
│  │         │  • Session metadata                            │
│  │         │  • Participant metrics                         │
│  │         │  • Audit logs                                  │
│  │         │  • User preferences                            │
│  └────┬────┘                                                │
│       │                                                     │
│       ▼ (nightly aggregation)                               │
│  ANALYTICS (Cold)                                           │
│  ┌─────────┐                                                │
│  │  Data   │  Retention: 2 years                            │
│  │Warehouse│  • Aggregated metrics                          │
│  │(BigQuery│  • Trend analysis                              │
│  │/Redshift│  • Anonymized patterns                         │
│  └─────────┘                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Postgres Schema:**

```sql
-- Core tables
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  code VARCHAR(6) UNIQUE,
  created_at TIMESTAMP,
  ended_at TIMESTAMP,
  end_reason VARCHAR(20),
  template_id VARCHAR(50),
  org_id UUID REFERENCES organizations(id)
);

CREATE TABLE session_participants (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(10),
  joined_at TIMESTAMP,
  speaking_time_seconds INTEGER,
  turn_count INTEGER,
  interruptions_made INTEGER,
  pauses_requested INTEGER,
  triggers_detected INTEGER
);

CREATE TABLE conversation_metrics (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  speaking_balance DECIMAL(3,2),
  average_turn_duration INTEGER,
  total_pauses INTEGER,
  total_triggers INTEGER,
  completion_rate DECIMAL(3,2),
  health_score INTEGER
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP,
  action VARCHAR(50),
  session_id UUID,
  actor_id UUID,
  actor_role VARCHAR(20),
  metadata JSONB,
  ip_address INET
);

-- Indexes for common queries
CREATE INDEX idx_sessions_org ON sessions(org_id, created_at);
CREATE INDEX idx_metrics_session ON conversation_metrics(session_id);
CREATE INDEX idx_audit_session ON audit_logs(session_id, timestamp);
```

### 2.6 Coachable vs. Punitive Indicators

| Metric | Coachable? | Why | How to Present |
|--------|------------|-----|----------------|
| Speaking balance | ✅ Yes | Awareness leads to change | "You spoke 70% of the time - try asking more questions" |
| Interruption rate | ✅ Yes | Behavioral, trainable | "3 interruptions detected - consider using the 'I need a moment' button" |
| Pause usage | ✅ Yes | Positive self-regulation | "Great job using 2 pauses to regulate" |
| Volume spikes | ⚠️ Careful | Could feel shaming | Show as "moments of intensity" not "angry outbursts" |
| Trigger count | ⚠️ Careful | Context matters | Pair with "what helped de-escalate" |
| Session duration | ❌ No | Not inherently good/bad | Don't compare |
| Words per minute | ❌ No | Personality-based | Don't track |

### 2.7 Visualization Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│              ANALYTICS DASHBOARD LAYOUT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CONVERSATION HEALTH SCORE                    85/100 │   │
│  │ ████████████████████████████████████░░░░░░░░       │   │
│  │ ↑ +5 from last session                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ SPEAKING BALANCE     │  │ EMOTIONAL REGULATION      │   │
│  │                      │  │                          │   │
│  │    You    Partner    │  │  Volume Over Time        │   │
│  │    ▓▓▓▓▓▓░░░░░░░    │  │  ┌────────────────┐      │   │
│  │     62%    38%       │  │  │    ╭─╮   ╭╮   │      │   │
│  │                      │  │  │╭──╯  ╰──╯ ╰──│      │   │
│  │ Tip: Try asking more │  │  └────────────────┘      │   │
│  │ open-ended questions │  │  2 pauses taken ✓        │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SAFETY TREND (Last 30 Days)                         │   │
│  │                                                     │   │
│  │  Score                                              │   │
│  │  100│                              ●                │   │
│  │   80│        ●    ●       ●   ●                    │   │
│  │   60│   ●                                          │   │
│  │   40│●                                             │   │
│  │     └────────────────────────────────────────────  │   │
│  │      Week 1   Week 2   Week 3   Week 4             │   │
│  │                                                     │   │
│  │  "Your conversations are getting healthier!"       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.8 Claude Agents for Transcript Analysis (Optional)

```typescript
// lib/claudeAgents.ts

interface CommunicationCoach {
  analyzeTranscript(transcript: TranscriptEntry[]): Promise<CoachingInsights>;
  suggestImprovements(patterns: CommunicationPattern[]): Promise<Suggestions>;
  generatePersonalizedTips(userHistory: UserMetrics[]): Promise<Tips>;
}

const COACHING_SYSTEM_PROMPT = `
You are a compassionate communication coach analyzing conversation transcripts.
Your role is to:
1. Identify positive communication patterns to reinforce
2. Gently suggest areas for growth (never criticize)
3. Provide specific, actionable tips
4. Frame everything as opportunities, not failures

Never:
- Assign blame
- Use shaming language
- Compare participants negatively
- Suggest one person is "wrong"

Always:
- Acknowledge effort
- Celebrate small wins
- Suggest collaborative improvements
- Respect emotional context
`;

async function generateCoachingInsights(
  transcript: TranscriptEntry[],
  participantId: string
): Promise<CoachingInsights> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: COACHING_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analyze this transcript for participant ${participantId}:

${transcript.map(t => `[${t.speakerId}]: ${t.text}`).join('\n')}

Provide:
1. One thing they did well
2. One growth opportunity
3. One specific tip for next time`
    }]
  });

  return parseCoachingResponse(response);
}
```

---

## Part 3: V0 Landing Page Design

### 3.1 Section Breakdown

#### Hero Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         MEDIATOR                            │
│                                                             │
│         Better Conversations. Stronger Teams.               │
│                                                             │
│    The structured conversation platform that helps          │
│    teams communicate with clarity, safety, and purpose.     │
│                                                             │
│         [Start Free Session]    [Book a Demo]               │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │  ▶ Watch 60-second Demo                          │     │
│    │  (Animated product preview)                      │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    Trusted by teams at: [Logo] [Logo] [Logo] [Logo]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Copy options:**
- "Where difficult conversations become productive ones"
- "Turn workplace tension into team alignment"
- "Communication infrastructure for modern teams"

#### For Teams Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    FOR TEAMS                                │
│       Conversation Safety for High-Performance Orgs        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Structured │  │  Real-Time  │  │   AI-Powered │        │
│  │  Turn-Taking│  │  Monitoring │  │   Insights   │        │
│  │             │  │             │  │              │        │
│  │ Equal voice │  │ Escalation  │  │ Summaries &  │        │
│  │ for every-  │  │ prevention  │  │ action items │        │
│  │ one         │  │ built-in    │  │ automatically│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  "80% of workplace conflict is preventable with            │
│   structured communication." - Workplace Research, 2024    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### For HR Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     FOR HR LEADERS                          │
│        Tools for Insight, Fairness, and Documentation      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  "Mediator reduced our conflict escalation by 40%   │   │
│  │   and gave us the documentation we needed."         │   │
│  │                                                     │   │
│  │   — Sarah Chen, VP People, TechCorp                 │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✓ Aggregate team health dashboards                        │
│  ✓ Compliance-ready conversation records                   │
│  ✓ Early warning indicators                                │
│  ✓ Privacy-first architecture                              │
│                                                             │
│                    [Download HR Toolkit]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### For Leaders Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   FOR MANAGERS & EXECS                      │
│        Conflict Doesn't Have to Mean Disconnection         │
│                                                             │
│  Most managers avoid difficult conversations.              │
│  Mediator gives you the structure to have them well.       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  USE CASES:                                         │   │
│  │                                                     │   │
│  │  • Weekly 1-on-1s with structure                    │   │
│  │  • Performance conversations                        │   │
│  │  • Conflict resolution between team members         │   │
│  │  • Feedback exchanges                               │   │
│  │  • Return-from-leave check-ins                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│        [Explore Manager Templates]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Platform Features Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  HOW MEDIATOR WORKS                         │
│                                                             │
│  1. SET UP          2. CONVERSE          3. REFLECT        │
│  ────────────       ────────────         ────────────       │
│  Choose a           Turn-taking          AI summary         │
│  template or        timer ensures        captures key       │
│  customize          equal airtime        points             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │          [INTERACTIVE PRODUCT DEMO]                 │   │
│  │                                                     │   │
│  │     Show: Timer, Speaker cards, Live transcript    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  FEATURES:                                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Real-time │ │ Trigger   │ │ Speaking  │ │ PDF       │  │
│  │ Transcript│ │ Detection │ │ Analytics │ │ Export    │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Security Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                 SECURITY & PRIVACY                          │
│          Built for Sensitive Conversations                  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   🔒        │  │   🛡️        │  │   📋        │        │
│  │ End-to-End │  │ GDPR &      │  │ Audit       │        │
│  │ Encryption │  │ HIPAA Ready │  │ Logging     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  • Conversations encrypted at rest and in transit          │
│  • No conversation data used for AI training               │
│  • User-controlled data retention                          │
│  • SOC 2 Type II compliance (in progress)                  │
│  • Optional on-premise deployment                          │
│                                                             │
│        [Read our Security Whitepaper]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Pricing Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                       PRICING                               │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │    PERSONAL     │  │      TEAM       │  │  ENTERPRISE │ │
│  │                 │  │                 │  │             │ │
│  │     FREE        │  │   $15/user/mo   │  │   Custom    │ │
│  │                 │  │                 │  │             │ │
│  │ • Unlimited     │  │ Everything in   │  │ Everything  │ │
│  │   sessions      │  │ Personal, plus: │  │ in Team,    │ │
│  │ • Basic         │  │                 │  │ plus:       │ │
│  │   summaries     │  │ • Team dashbd   │  │             │ │
│  │ • PDF export    │  │ • Templates     │  │ • SSO/SAML  │ │
│  │                 │  │ • Analytics     │  │ • On-prem   │ │
│  │ [Get Started]   │  │ • Priority      │  │ • Custom    │ │
│  │                 │  │   support       │  │   integr.   │ │
│  │                 │  │                 │  │             │ │
│  │                 │  │ [Start Trial]   │  │ [Contact]   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│          All plans include: No conversation limits,        │
│          AI summaries, Mobile-friendly                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### CTA Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            READY TO TRANSFORM YOUR TEAM'S                   │
│               COMMUNICATION?                                │
│                                                             │
│     ┌─────────────────────┐  ┌─────────────────────┐       │
│     │   Book a Demo       │  │  Try Free Session   │       │
│     │   (15 min)          │  │  (No signup)        │       │
│     └─────────────────────┘  └─────────────────────┘       │
│                                                             │
│     Questions? hello@mediator.app                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Visual & Motion Recommendations

| Section | Visual Treatment |
|---------|-----------------|
| Hero | Subtle gradient animation, floating UI mockup |
| For Teams | 3-card layout with hover lift effects |
| For HR | Testimonial carousel with fade transitions |
| Features | Interactive demo embed or animated GIF |
| Security | Icon grid with subtle pulse animations |
| Pricing | Card selection with highlight state |

### 3.3 Production Checklist

#### Before Launch
- [ ] SSL certificate configured
- [ ] CORS restricted to production domains
- [ ] Rate limiting tuned for production traffic
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog/Mixpanel) configured
- [ ] Database backups scheduled
- [ ] Load testing completed (target: 1000 concurrent)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Mobile responsive testing complete
- [ ] SEO meta tags configured
- [ ] Open Graph images created
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner implemented

#### Launch Day
- [ ] DNS configured
- [ ] CDN enabled
- [ ] Monitoring dashboards ready
- [ ] Support email configured
- [ ] Social media assets ready
- [ ] Press release drafted

---

## Implementation Order

### Phase 1: Core Polish (This Sprint)
1. Wire admin dashboard to real data
2. Integrate template selection in setup flow
3. Add Deepgram for transcription + diarization
4. Build transcription UI component

### Phase 2: Analytics (Next Sprint)
1. Define Postgres schema
2. Build metrics collection pipeline
3. Create individual dashboard
4. Create team/org dashboards

### Phase 3: Landing Page (Parallel)
1. Build landing page sections
2. Add animations and polish
3. Integrate demo/trial flow

---

## Environment Variables Needed

```bash
# Existing
ANTHROPIC_API_KEY=sk-ant-...

# New for v0
DEEPGRAM_API_KEY=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXT_PUBLIC_APP_URL=https://mediator.app
SENTRY_DSN=...
POSTHOG_KEY=...
```
