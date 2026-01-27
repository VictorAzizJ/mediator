# Mediator MVP Roadmap

> Generated from CTO Agent + Product Designer Agent collaborative analysis
> Updated: January 2025 — v0 Production Release

---

## v0 Release (January 2025)

### What's New in v0

| Feature | Status | Description |
|---------|--------|-------------|
| **Real-Time Transcription** | ✅ Complete | Deepgram Nova-2 with speaker diarization |
| **Conversation Health Analytics** | ✅ Complete | Balance, regulation, engagement, safety scores |
| **User Analytics Dashboard** | ✅ Complete | Personal trends and coaching insights |
| **Enterprise Landing Page** | ✅ Complete | Full marketing page for B2B customers |
| **Transcription UI** | ✅ Complete | Color-coded speaker turns, interim results |
| **Analytics Library** | ✅ Complete | Metrics calculation and health scoring |

### v0 Files Added

| File | Purpose |
|------|---------|
| `src/lib/deepgram.ts` | Deepgram WebSocket client for transcription |
| `src/lib/analytics.ts` | Health scoring and metrics calculations |
| `src/hooks/useTranscription.ts` | React hook for transcription |
| `src/components/transcription/` | Transcription UI components |
| `src/components/analytics/` | Dashboard, charts, insights |
| `src/app/page.tsx` | Enterprise landing page (main route) |
| `src/app/demo/page.tsx` | Code-protected conversation app |
| `src/app/api/transcription/token/route.ts` | Deepgram API key endpoint |
| `V0-IMPLEMENTATION-PLAN.md` | Detailed v0 specifications |

### v0 Route Structure

| Route | Purpose |
|-------|---------|
| `/` | Enterprise marketing landing page |
| `/demo` | Full conversation app (access code: `MEDIATOR2025`) |
| `/admin` | Admin dashboard |
| `/observer` | Observer join page |

### v0 Environment Variables

```env
# New for v0
DEEPGRAM_API_KEY=your_deepgram_key  # For real-time transcription
DATABASE_URL=postgresql://...        # For analytics storage (optional)
```

### Third-Party Integrations

| Service | Purpose | Pricing | Status |
|---------|---------|---------|--------|
| **Deepgram** | Real-time transcription + diarization | $0.0043/min (Nova-2) | ✅ Integrated |
| **Supabase** | Database, auth, storage | Free tier available | ✅ Integrated |
| **Resend** | Magic link emails, session reports | Free tier: 100/day | ✅ Integrated |
| **Vercel** | Deployment platform | Free tier available | ✅ Configured |
| **Redis** | Session storage (fallback) | Self-hosted or managed | ✅ Integrated |

---

## Executive Summary

**Current State:** 90% demo-ready, 70% production-ready

**Strategic Direction (Jan 2025):**
- **B2C remains free** — Family conversation tools stay accessible
- **B2B is the priority** — HR teams, manager 1-on-1s, conflict resolution
- Mentor feedback: Focus go-to-market on enterprise while keeping B2C stable

**Core Strengths:**
- Clean, maintainable codebase with strong TypeScript types
- Trauma-informed UX with graduated disclosure flow
- Thoughtful AI integration with local fallbacks
- Turn-based structure reduces conversation chaos
- **Configurable settings** — Turn duration, round limits, breathing skip (Jan 2025)

**Critical Gaps:**
- ~~No persistent session storage (in-memory only)~~ Fixed 2024-12-18
- Missing privacy/consent flows
- ~~Security vulnerabilities in session management~~ Fixed 2024-12-18
- ~~No authentication layer~~ Fixed 2025-01 (Passwordless magic link auth via Supabase + Resend)
- AI involvement hidden from users
- ~~No observer mode for B2B use cases~~ Admin dashboard significantly expanded 2025-01

**Upcoming Features:**
- **Priority 7 (NEW):** B2B MVP — Observer mode, admin dashboard, compliance logging
- Priority 5-6: Therapist integration and self-awareness (may evolve for B2B workplace counselors)

**Target Positioning:**
- B2C: "The Signal of family conversations" — ephemeral, private, transparent
- B2B: "Psychological safety infrastructure for HR teams" — structured, compliant, measurable

---

## Priority 1: Critical Blockers (Pre-Beta)

These issues will cause immediate user distrust or data loss. Must fix before any real users.

### 1.1 Session Persistence
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Replace in-memory `Map()` with Redis | CTO | `server.js:18-133` | [x] Done 2024-12-18 |
| Implement session reconnection flow | CTO | `server.js:424-471` | [x] Done 2024-12-18 |
| Add session recovery UI ("Welcome back") | Designer | New component | [ ] |

**Why Critical:** Users WILL refresh or lose connection. Losing 20 minutes of a difficult conversation is re-traumatizing.

### 1.2 Security Hardening
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Replace `Math.random()` with `crypto.randomBytes` for session codes | CTO | `server.js:438-446` | [x] Done 2024-12-18 |
| Replace `Math.random()` with crypto for participant IDs | CTO | `server.js:453-455` | [x] Done 2024-12-18 |
| Fix `Object.assign(session, data)` state injection vulnerability | CTO | `server.js:300-328` | [x] Done 2024-12-18 |
| Add Zod schema validation on all socket events | CTO | `server.js:20-78` | [x] Done 2024-12-18 |
| Add rate limiting on `session:join` (prevent brute-force) | CTO | `server.js:80-168` | [x] Done 2024-12-18 |
| Configure WSS/TLS for production | CTO | `server.js:8-13`, deployment | [ ] |

**Why Critical:** Current implementation allows session hijacking, state injection, and network eavesdropping.

### 1.3 Privacy Consent Flow
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Create privacy landing screen before SetupScreen | Designer | New component | [ ] |
| Add microphone permissions consent screen | Designer/CTO | New component | [ ] |
| Explain AI involvement with opt-out toggle | Designer | New component | [ ] |
| Add "Only visible to you" labels on intentions/triggers | Designer | `PreConversationSetup.tsx` | [ ] |

**Why Critical:** Privacy-conscious users will abandon without understanding data handling. Microphone permission without context = instant denial.

---

## Priority 2: High Priority (Beta Launch)

Required for a trustworthy beta experience with 50-100 users.

### 2.1 Trust Indicators
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Add "Session expires when you leave" tooltip on session code | Designer | `WaitingScreen.tsx:51-64` | [ ] |
| Add encrypted connection badge (when using WSS) | Designer/CTO | Header component | [ ] |
| Show "2 participants only" indicator | Designer | `ActiveConversation.tsx` | [ ] |
| Create accessible privacy policy page | Designer | New page | [ ] |

### 2.2 Data Export & Persistence
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Implement actual summary save to localStorage | CTO | `page.tsx:98` | [ ] |
| Add PDF export for conversation summary | CTO | `src/lib/export.ts` | [x] Done 2025-01 |
| Add CSV export for session data | CTO | `src/lib/export.ts`, `src/hooks/useExport.ts` | [x] Done 2025-01 |
| Add "Download your copy" button | Designer | `SummaryScreen.tsx` | [ ] |
| Add "Delete this summary" option | Designer/CTO | `SummaryScreen.tsx` | [ ] |

### 2.3 Error Handling
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Add React error boundaries around main components | CTO | `page.tsx`, components | [ ] |
| Show user-friendly socket disconnection notification | Designer/CTO | New component | [ ] |
| Handle "session not found" gracefully with clear messaging | Designer | `SetupScreen.tsx` | [ ] |
| Handle "session full" with helpful next steps | Designer | `SetupScreen.tsx` | [ ] |

### 2.4 Incomplete Features
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Implement "I need to stop this conversation" button | CTO | `ActiveConversation.tsx:166-172` | [x] Done 2025-01-04 |
| Design confirmation modal for emergency exit | Designer | New component | [ ] |
| Notify other participant when someone exits | CTO | `server.js` | [x] Done 2025-01-04 |

---

## Priority 3: Medium Priority (Public Launch)

Needed for public launch but can be iterated during beta.

### 3.1 AI Transparency & Control
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Add settings panel accessible during conversation | Designer/CTO | `src/components/settings/AdvancedSettings.tsx` | [x] Done 2025-01 |
| Implement toggle for AI assistance on/off | CTO | `useAI.ts`, settings | [ ] |
| Implement toggle for volume monitoring on/off | CTO | `useVolumeMonitor.ts` | [ ] |
| Show indicator when AI vs local fallback is active | Designer | `ReflectionPrompt.tsx` | [ ] |
| Explain WHY a trigger was detected | Designer | `PauseOverlay.tsx` | [ ] |

### 3.2 Volume Monitoring Improvements
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Add 3-second voice calibration step | CTO | `useVolumeMonitor.ts` | [ ] |
| Design calibration UI ("Speak normally for 3 seconds") | Designer | New component | [ ] |
| Make volume threshold adaptive based on calibration | CTO | `useVolumeMonitor.ts:23-24` | [ ] |
| Reframe pause as "helpful nudge" not punishment | Designer | `PauseOverlay.tsx` | [ ] |

### 3.3 Session Security Enhancements
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Add session expiry (24-hour max lifetime) | CTO | `server.js` | [ ] |
| Add maximum join attempts with lockout | CTO | `server.js` | [ ] |
| Implement session code reservation prevention | CTO | `server.js` | [ ] |
| Add CORS environment-based configuration | CTO | `server.js:9-12` | [ ] |

### 3.4 Accessibility & Localization
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Implement Spanish translations (language option exists) | Designer/CTO | New i18n files | [ ] |
| Add `prefers-reduced-motion` checks | CTO | All Framer Motion usage | [ ] |
| Ensure WCAG 2.1 AA compliance | Designer | All components | [ ] |
| Add keyboard navigation for all interactive elements | CTO | All components | [ ] |

---

## Priority 4: Post-Launch Enhancements

Nice-to-haves that improve the experience but don't block launch.

### 4.1 Advanced AI Features
| Item | Owner | Status |
|------|-------|--------|
| Cache common reflection prompts for faster response | CTO | [ ] |
| Implement streaming summarization for better UX | CTO | [ ] |
| Add emotion detection beyond volume | CTO | [ ] |
| Pattern analysis across multiple sessions (opt-in) | CTO | [ ] |
| User-customizable trigger sensitivity | Designer/CTO | [ ] |

### 4.2 Scalability Infrastructure
| Item | Owner | Status |
|------|-------|--------|
| Redis adapter for multi-instance Socket.io | CTO | [ ] |
| Sticky sessions via load balancer | CTO | [ ] |
| Connection state recovery | CTO | [ ] |
| Performance monitoring (Socket.io latency, AI response times) | CTO | [ ] |

### 4.3 Extended Features
| Item | Owner | Status |
|------|-------|--------|
| Configurable turn duration (currently fixed at 90s) | Designer/CTO | [x] Done 2025-01-04 |
| Configurable round limits (unlimited/3/5) | Designer/CTO | [x] Done 2025-01-04 |
| Breathing exercise skip option | Designer/CTO | [x] Done 2025-01-04 |
| End conversation button | CTO | [x] Done 2025-01-04 |
| Calendar integration for follow-up reminders | CTO | [ ] |
| End-to-end encryption (Signal Protocol) | CTO | [ ] |

---

## Priority 7: B2B Enterprise Features (NEW — Jan 2025)

> **Strategic Priority:** This is now the primary development focus.
> B2C features (Priority 5-6) remain on roadmap but may evolve into B2B workplace counselor/ombuds roles.

### Why B2B?

| Reason | Details |
|--------|---------|
| Clear buyer persona | HR leaders have budget and pain points |
| Recurring revenue | Per-seat or per-org pricing |
| Differentiation | Trauma-informed design is rare in workplace tools |
| Existing foundation | Turn-taking, volume monitoring, summaries all transfer |

### B2B Use Cases

| Use Case | Description | Target Buyer |
|----------|-------------|--------------|
| Manager 1-on-1s | Emotionally safe check-ins with reflection | HR Leaders, L&D |
| Conflict Retros | Post-incident debriefs with HR observation | HR, Employee Relations |
| Team Retros | Psychological safety tracking across sprints | Engineering Managers |

---

### 7.1 MVP B2B Features (Weeks 1-4 — January 2025)

| Item | Owner | Effort | Status |
|------|-------|--------|--------|
| Manager check-in template (pre-built prompts) | Designer/CTO | 2 days | [ ] |
| Basic observer mode (read-only, consent-based) | CTO | 3 days | [ ] |
| PDF summary export | CTO | 2 days | [x] Done 2025-01 |
| Speaking time tracking (% split) | CTO | 1 day | [x] Done 2025-01 |
| Workplace tone prompts (professional language) | Designer | 2 days | [ ] |
| Simple admin dashboard (active sessions, stats) | CTO | 3 days | [x] Done 2025-01 |
| Basic audit logging (who did what, when) | CTO | 2 days | [ ] |

**Total Estimated Effort:** ~15 days (~3 weeks)

**Exit Criteria:**
- [ ] HR pilot user can create and observe a conflict retro
- [ ] Manager can run a 1-on-1 with check-in template
- [ ] PDF export works for all session types
- [ ] Audit log captures all observer actions

---

### 7.2 Enterprise Features (Months 2-3 — Feb-Mar 2025)

| Item | Owner | Effort | Dependencies | Status |
|------|-------|--------|--------------|--------|
| Conflict retro full flow | Designer/CTO | 2 weeks | Observer mode | [ ] |
| Trust ledger (private safety event log) | CTO | 1 week | Audit logging | [ ] |
| Meeting health dashboard (org trends) | Designer/CTO | 2 weeks | Analytics infra | [ ] |
| RBAC system (Employee/Manager/HR/Admin) | CTO | 1 week | User model | [ ] |
| SSO integration (SAML 2.0 / OIDC) | CTO | 2 weeks | Enterprise customer | [ ] |
| Anonymized pause requests in reports | CTO | 3 days | Trust ledger | [ ] |

---

### 7.3 Future B2B (Q2 2025+)

| Item | Trigger | Status |
|------|---------|--------|
| Multi-party sessions (3+ participants) | Team retro demand | [ ] |
| Calendar integration (Google, Outlook) | Enterprise request | [ ] |
| Slack/Teams integration | Enterprise request | [ ] |
| SOC-2 Type II certification | Enterprise requirement | [ ] |
| Custom branding / white-labeling | Enterprise request | [ ] |
| On-premises deployment option | Regulated industries | [ ] |

---

### 7.4 B2B Database Schema Additions

```sql
-- Observer relationships (HR watching sessions)
CREATE TABLE session_observers (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  observer_id UUID NOT NULL,
  observer_role VARCHAR(50) NOT NULL,  -- 'hr_admin', 'mediator', 'manager'

  -- Permissions (consent-based)
  can_view_transcript BOOLEAN DEFAULT false,
  can_send_prompts BOOLEAN DEFAULT false,
  can_pause_session BOOLEAN DEFAULT false,

  consent_given_at TIMESTAMP,
  consent_given_by UUID[],  -- Both participants must consent

  created_at TIMESTAMP DEFAULT NOW()
);

-- Basic audit log for compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  actor_id UUID NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  ip_hash VARCHAR(64),
  timestamp TIMESTAMP DEFAULT NOW()
  -- No UPDATE or DELETE permissions
);

-- Check-in templates
CREATE TABLE checkin_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  prompts JSONB NOT NULL,  -- Array of prompt objects
  turn_duration_seconds INTEGER DEFAULT 90,
  max_rounds INTEGER DEFAULT 4,
  created_by UUID,
  is_system BOOLEAN DEFAULT false,  -- Built-in templates
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meeting health metrics (aggregated, anonymized)
CREATE TABLE meeting_health_metrics (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Aggregated stats
  total_sessions INTEGER,
  completion_rate DECIMAL(5,2),
  avg_speaking_balance DECIMAL(5,2),
  escalation_events INTEGER,
  pause_requests INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 7.5 B2B Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `observer:join` | Observer → Server | Request to observe session |
| `observer:consent-request` | Server → Participants | Ask for consent |
| `observer:consent-granted` | Participants → Server | Approve observer |
| `observer:joined` | Server → All | Observer now watching |
| `observer:prompt-send` | Observer → Participant | Send reflection prompt |
| `observer:pause-request` | Observer → Server | Emergency pause |
| `admin:sessions-list` | Admin → Server | Get active sessions |
| `admin:metrics-request` | Admin → Server | Get health metrics |

---

### 7.6 B2B New Components

| Component | Purpose | Priority |
|-----------|---------|----------|
| `<ObserverPanel />` | HR's view of ongoing session | High |
| `<ConsentModal />` | Ask participants to approve observer | High |
| `<CheckInTemplate />` | Pre-built 1-on-1 prompts | High |
| `<AdminDashboard />` | Org-wide session overview | High |
| `<MeetingHealthChart />` | Trend visualization | Medium |
| `<PDFExport />` | Download summary as PDF | High |
| `<SpeakingTimeBar />` | % split visualization | Medium |
| `<AuditLogViewer />` | Compliance review interface | Low |

---

### 7.7 B2B Deployment Phases

| Phase | Timeline | Who | Success Criteria |
|-------|----------|-----|------------------|
| Internal Testing | Week 1-2 | Your team | All flows work, 0 critical bugs |
| Pilot HR Teams | Week 3-6 | 2-3 HR professionals | 10+ sessions facilitated, NPS > 7 |
| Small Orgs | Week 7-12 | 2-3 companies (10-50 employees) | 15+ sessions/week, >50% retention |
| Enterprise | Week 13-24 | 1-2 enterprises (500+ employees) | Signed contract, passed IT review |

---

## Priority 5: Licensed Therapist/Advisor Integration

> Designed 2024-12-25 via CTO + Product Designer collaborative dialogue
> HIPAA-compliant professional support integration

### 5.1 Therapist Onboarding & Verification
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Create `therapist_profiles` database table | CTO | New migration | [ ] |
| Implement NPI Registry API integration for license verification | CTO | New service | [ ] |
| Build therapist registration flow | CTO | New API routes | [ ] |
| Design therapist onboarding UI | Designer | New components | [ ] |
| Create invite code generation system | CTO | `server.js` | [ ] |
| Add `<LicenseVerificationBadge />` component | Designer | New component | [ ] |

**Why Important:** Professionals must be verified before accessing client data. NPI Registry provides authoritative license validation.

### 5.2 Client-Therapist Linking
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Create `therapist_links` database table with granular permissions | CTO | New migration | [ ] |
| Implement invite code acceptance flow | CTO | New API routes | [ ] |
| Build permission toggle UI (all OFF by default) | Designer | New component | [ ] |
| Add "Revoke Access" functionality (1-tap) | Designer/CTO | Settings component | [ ] |
| Implement time-bounded access (`expires_at`) | CTO | Database schema | [ ] |
| Create `<PermissionToggle />` component | Designer | New component | [ ] |

**Consent Matrix:**
| Data Type | Client Consent | Partner Consent | Therapist Can See |
|-----------|----------------|-----------------|-------------------|
| Client's summary | Required | No | If granted |
| Client's analytics | Required | No | If granted |
| Partner's identity | Required | **Required** | Only if both |
| Partner's speech | Required | **Required** | Only if both |
| Real-time view | Required | Notified* | If granted |

*Partner sees "A support person is observing" indicator

### 5.3 Real-Time Therapist Observation
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Add `therapist:session-started` socket event | CTO | `server.js` | [ ] |
| Add `therapist:escalation-alert` socket event | CTO | `server.js` | [ ] |
| Implement `accessMode: 'realtime' | 'async-review'` | CTO | `server.js` | [ ] |
| Build therapist real-time dashboard view | Designer/CTO | New page | [ ] |
| Add `<ObserverIndicator />` component ("N support people observing") | Designer | New component | [ ] |
| Design privacy explainer modal for observer indicator | Designer | New component | [ ] |

**Socket Events:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `therapist:session-started` | Server → Therapist | Client began session |
| `therapist:escalation-alert` | Server → Therapist | Volume threshold crossed |
| `therapist:session-summary` | Server → Therapist | Post-session data |
| `therapist:prompt-send` | Therapist → Client | Send reflection prompt |
| `session:observer-count-updated` | Server → Both | "N support people observing" |

### 5.4 Therapist Prompts & Interventions
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Implement `therapist:prompt-send` socket event | CTO | `server.js` | [ ] |
| Build prompt delivery UI (client-only visibility) | Designer | New component | [ ] |
| Add therapist prompt permissions check | CTO | `server.js` | [ ] |
| Design therapist prompt composition interface | Designer | New page | [ ] |

### 5.5 Multi-Therapist Support
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Support multiple therapists observing (one per party) | CTO | `server.js` | [ ] |
| Show "2 support people observing" indicator | Designer | `<ObserverIndicator />` | [ ] |
| Implement 4-way consent for therapist collaboration | CTO | New flow | [ ] |
| Design collaboration request modal | Designer | New component | [ ] |
| Add `<CollaborationRequest />` component | Designer | New component | [ ] |

**Collaboration Mode (Requires 4-way consent):**
- Each party must approve their therapist joining collaboration
- Therapists can see each other's professional identity
- Therapists can share observations about conversation
- Visual indicator: "Support people are collaborating"

### 5.6 HIPAA Audit Trail
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Create `therapist_audit_log` table (append-only) | CTO | New migration | [ ] |
| Log all therapist access events | CTO | `server.js` | [ ] |
| Implement audit log viewer for compliance | CTO | New admin page | [ ] |
| Add IP hashing for audit entries | CTO | `server.js` | [ ] |

**Audit Entry Fields:**
- `therapist_id`, `client_id`, `session_id`
- `action`: 'viewed-summary' | 'viewed-transcript' | 'sent-prompt' | 'received-alert'
- `data_accessed`: Field names only (not values)
- `ip_hash`, `timestamp`

---

## Priority 6: Self-Awareness Conversation Analysis

> Designed 2024-12-25 via CTO + Product Designer collaborative dialogue
> Privacy-first, trauma-informed personal insight system

### 6.1 Private Analytics Infrastructure
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Create `private_analytics` table (per-participant, encrypted) | CTO | New migration | [ ] |
| Implement client-side encryption for sensitive triggers | CTO | New lib | [ ] |
| Build word hashing system (match without reading) | CTO | New lib | [ ] |
| Design analytics data model | CTO | `src/types/index.ts` | [ ] |
| Add aggregate stats for therapist summaries (non-sensitive) | CTO | Database schema | [ ] |

**Privacy Architecture:**
```
Encrypted on client → Hashed for matching → Server stores encrypted blob
                                         → Only user can decrypt with their key
```

### 6.2 Self-Defined Triggers
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Build "Communication Preferences" settings screen | Designer | New component | [ ] |
| Implement self-defined word trigger system | CTO | New hook | [ ] |
| Add volume sensitivity slider | Designer/CTO | New component | [ ] |
| Create speaking-time awareness option | CTO | New hook | [ ] |
| Design "Words I'm working on" encrypted input | Designer | New component | [ ] |

**Trigger Types:**
| Type | Description | Action Options |
|------|-------------|----------------|
| Volume | Voice getting louder | nudge-me, suggest-pause |
| My-Word | User's self-defined words | nudge-me, suggest-pause |
| Speaking-Time | Talking too long | nudge-me |

**Key Principle:** User chooses THEIR OWN triggers. Never imposed.

### 6.3 Private Nudge System
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Implement `self:volume-nudge` socket event (private) | CTO | `server.js` | [ ] |
| Implement `self:word-nudge` socket event (private) | CTO | `server.js` | [ ] |
| Build `<SelfAwarenessNudge />` overlay component | Designer | New component | [ ] |
| Add "Take a breath" / "Continue" choice buttons | Designer | `<SelfAwarenessNudge />` | [ ] |
| Implement cooldown logic (prevent alert fatigue) | CTO | `server.js` | [ ] |
| Add sensitivity auto-adjustment prompt (after 3 nudges in 2 min) | Designer | New component | [ ] |

**Nudge UX Principles:**
1. **Never display the "bad" word** — No shaming
2. **Choice, not control** — Always offer "Continue" option
3. **Anonymous to partner** — Pause requests don't reveal trigger
4. **Growth-oriented language** — "Word you're working on" not "profanity"

**Nudge Messages:**
| Trigger | Message |
|---------|---------|
| Volume | "Your voice is getting louder. Take a breath?" |
| Word | "You said a word you're working on. Rephrase?" |
| Time | "You've been speaking for a while. Check in with your partner?" |

### 6.4 Anonymous Pause Requests
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Implement `self:take-breath` socket event | CTO | `server.js` | [ ] |
| Implement `session:breath-requested` broadcast (anonymous) | CTO | `server.js` | [ ] |
| Build `<BreathRequestModal />` component | Designer | New component | [ ] |
| Add 30-second breathing exercise for mutual pause | Designer | Extend existing | [ ] |

**Flow:**
1. User receives private nudge
2. User clicks "Take a breath"
3. Both parties see: "One participant requested a breathing pause"
4. No attribution — partner doesn't know who or why

### 6.5 Post-Session Analytics Dashboard
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Build private analytics summary screen | Designer | New component | [ ] |
| Show speaking time split visualization | Designer | New component | [ ] |
| Show volume pattern timeline | Designer | New component | [ ] |
| Display self-awareness moments (nudge responses) | Designer | New component | [ ] |
| Add "Share with therapist" button | Designer/CTO | New component | [ ] |
| Implement "Download my data" export | CTO | New API route | [ ] |
| Add "Delete all data" option | CTO | New API route | [ ] |
| Build `<AnalyticsSummary />` component | Designer | New component | [ ] |

**Client Dashboard:**
```
YOUR CONVERSATION PATTERNS (Only you can see this)
├── Speaking Time: 45% / Partner: 55%
├── Voice Level Timeline: ▁▂▃▅▇▅▃▂▁▂▃▄▃▂
│                         ↑ Moment you took a breath
├── Self-Awareness Moments: 2
│   • Volume check (chose to continue)
│   • Word check (rephrased successfully) ⭐
└── Actions: [Share with therapist] [Download] [Delete]
```

### 6.6 Therapist Analytics View (If Shared)
| Item | Owner | File(s) | Status |
|------|-------|---------|--------|
| Build therapist-facing analytics summary | Designer | `<TherapistDashboard />` | [ ] |
| Show only aggregate patterns (not raw data) | CTO | API design | [ ] |
| Display client's self-reflection notes | Designer | New component | [ ] |
| Add clear "limited visibility" disclaimer | Designer | UI copy | [ ] |

**Therapist View:**
```
CLIENT INSIGHT SUMMARY
├── Patterns Observed:
│   • Voice escalation at minutes 8 and 15
│   • Client used self-pause tool twice (positive sign)
│   • Speaking time balanced (45/55 split)
├── Client's Self-Reflection: "I notice I get louder about money"
└── ⚠️ You cannot see partner's identity or data unless both consent
```

---

## Priority 5-6 Implementation Phases

| Phase | Features | Dependencies |
|-------|----------|--------------|
| **Phase 1** | Private analytics, self-awareness nudges, anonymous pause | Priority 1-2 complete |
| **Phase 2** | Therapist onboarding, license verification, basic linking | Phase 1, NPI API access |
| **Phase 3** | Granular permissions, audit logging, therapist dashboard | Phase 2, database migrations |
| **Phase 4** | Multi-therapist, collaboration mode, client-side encryption | Phase 3, crypto implementation |

---

## Priority 5-6 Socket Event Reference

### Therapist Integration Events
| Event | Direction | Visibility |
|-------|-----------|------------|
| `therapist:invite-generate` | Client → Server | Private |
| `therapist:link-accept` | Client → Server | Private |
| `therapist:link-revoke` | Client → Server | Private |
| `therapist:permissions-update` | Client → Server | Private |
| `therapist:session-started` | Server → Therapist | Therapist only |
| `therapist:escalation-alert` | Server → Therapist | Therapist only |
| `therapist:session-summary` | Server → Therapist | Therapist only |
| `therapist:prompt-send` | Therapist → Client | Client only |
| `session:observer-count-updated` | Server → Both | Both parties |

### Self-Awareness Events
| Event | Direction | Visibility |
|-------|-----------|------------|
| `self:volume-nudge` | Server → Individual | Private |
| `self:word-nudge` | Server → Individual | Private |
| `self:pattern-insight` | Server → Individual | Private |
| `self:take-breath` | Individual → Server | Private |
| `self:rephrase-request` | Individual → Server | Private |
| `self:continue-anyway` | Individual → Server | Private |
| `session:breath-requested` | Server → Both | Anonymous |

---

## Priority 5-6 Database Schema

```sql
-- Therapist licensing and verification
CREATE TABLE therapist_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  license_number VARCHAR(50) NOT NULL,
  license_state VARCHAR(2) NOT NULL,
  license_type VARCHAR(50), -- LMFT, LCSW, PhD, etc.
  npi_number VARCHAR(10),   -- National Provider Identifier
  verified_at TIMESTAMP,
  verification_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client-therapist relationships
CREATE TABLE therapist_links (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),
  therapist_id UUID REFERENCES therapist_profiles(id),

  -- Granular permissions (all default FALSE)
  can_view_summaries BOOLEAN DEFAULT false,
  can_view_transcripts BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_send_prompts BOOLEAN DEFAULT false,
  can_receive_escalation_alerts BOOLEAN DEFAULT false,
  can_view_partner_identity BOOLEAN DEFAULT false,

  access_mode VARCHAR(20) DEFAULT 'async',
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Immutable HIPAA audit log
CREATE TABLE therapist_audit_log (
  id UUID PRIMARY KEY,
  therapist_id UUID NOT NULL,
  client_id UUID NOT NULL,
  session_id UUID,
  action VARCHAR(50) NOT NULL,
  data_accessed TEXT[],
  ip_hash VARCHAR(64),
  timestamp TIMESTAMP DEFAULT NOW()
  -- No UPDATE or DELETE permissions on this table
);

-- Client's private analytics (encrypted)
CREATE TABLE private_analytics (
  id UUID PRIMARY KEY,
  participant_id UUID NOT NULL,
  session_id UUID NOT NULL,

  -- Encrypted blob (client holds decryption key)
  encrypted_data BYTEA,
  encryption_iv BYTEA,

  -- Aggregate stats (non-sensitive, for therapist summaries)
  speaking_time_percent INTEGER,
  volume_escalation_count INTEGER,
  self_pause_count INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Self-defined trigger words (hashed, not plaintext)
CREATE TABLE self_awareness_triggers (
  id UUID PRIMARY KEY,
  participant_id UUID NOT NULL,
  trigger_type VARCHAR(20) NOT NULL, -- 'word', 'volume', 'speaking_time'
  word_hash VARCHAR(64),              -- SHA-256, can match but not read
  encrypted_word BYTEA,               -- AES-256-GCM, user can decrypt
  encryption_iv BYTEA,
  threshold INTEGER,                  -- Sensitivity level 1-10
  action VARCHAR(20) DEFAULT 'nudge-me',
  cooldown_ms INTEGER DEFAULT 30000,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Priority 5-6 New Components

| Component | Purpose | Priority |
|-----------|---------|----------|
| `<ObserverIndicator />` | Shows "N support people observing" | High |
| `<PermissionToggle />` | Granular therapist consent controls | High |
| `<SelfAwarenessNudge />` | Private volume/word feedback overlay | High |
| `<BreathRequestModal />` | Anonymous pause request flow | High |
| `<LicenseVerificationBadge />` | Shows therapist verified status | Medium |
| `<TherapistDashboard />` | Professional's client overview | Medium |
| `<AnalyticsSummary />` | Post-session private insights | Medium |
| `<CollaborationRequest />` | 4-way consent for therapist collaboration | Low |
| `<CommunicationPreferences />` | Self-awareness settings screen | High |

---

## Technical Debt Inventory

### High Priority Debt
| Issue | Location | Impact | Status |
|-------|----------|--------|--------|
| ~~No database - in-memory only~~ | ~~`server.js:16`~~ | ~~Data loss on restart~~ | Fixed 2024-12-18 (Redis) |
| ~~Unsafe state sync with `Object.assign`~~ | ~~`server.js:121`~~ | ~~Security vulnerability~~ | Fixed 2024-12-18 |
| ~~No authentication layer~~ | ~~Throughout~~ | ~~Session hijacking risk~~ | Fixed 2025-01 (Magic link auth) |
| No logging/monitoring | Throughout | Can't debug production | Open |
| Zero test coverage | Throughout | Can't refactor safely | Open |

### Medium Priority Debt
| Issue | Location | Impact |
|-------|----------|--------|
| Socket.io events use `any` types | `useSocket.ts` | Type safety gaps |
| Hardcoded URLs and ports | `socket.ts`, `server.js` | Deployment friction |
| No production build review | `next.config.ts` | Unknown prod issues |

### Low Priority Debt
| Issue | Location | Impact |
|-------|----------|--------|
| Could extract business logic from Zustand | `session.ts` | Code organization |
| Component organization could use atomic design | `components/` | Maintainability |
| Framer Motion performance on mobile | Throughout | UX on low-end devices |

---

## File Reference

### Core Architecture
| File | Purpose |
|------|---------|
| `server.js` | Socket.io server, session management, real-time sync |
| `src/store/session.ts` | Zustand state management |
| `src/lib/socket.ts` | Socket.io client wrapper |
| `src/lib/ai.ts` | AI integration with local fallbacks |
| `src/types/index.ts` | TypeScript type definitions |

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/ai/trigger-detection/route.ts` | Detect emotional triggers in speech |
| `src/app/api/ai/reflection-prompt/route.ts` | Generate reflection prompts |
| `src/app/api/ai/summarize/route.ts` | Summarize conversation |
| `src/app/api/auth/magic-link/route.ts` | Passwordless magic link authentication |
| `src/app/api/auth/verify/route.ts` | Auth token verification |
| `src/app/api/access-codes/route.ts` | Access code management |
| `src/app/api/access-codes/validate/route.ts` | Access code validation |
| `src/app/api/admin/analytics/route.ts` | Admin analytics data |
| `src/app/api/admin/sessions/route.ts` | Admin session management |
| `src/app/api/demo/route.ts` | Demo data endpoint |
| `src/app/api/email/send-report/route.ts` | Email session reports via Resend |
| `src/app/api/transcription/token/route.ts` | Deepgram API key endpoint (enhanced) |

### UI Components
| File | Purpose |
|------|---------|
| `src/components/conversation/SetupScreen.tsx` | Initial name/language entry |
| `src/components/conversation/WaitingScreen.tsx` | Session code display, waiting for partner |
| `src/components/conversation/PreConversationSetup.tsx` | Intentions and triggers setup |
| `src/components/conversation/ActiveConversation.tsx` | Main conversation interface |
| `src/components/conversation/SummaryScreen.tsx` | Post-conversation summary |
| `src/components/breathing/BreathingExercise.tsx` | Calming exercise before conversation |
| `src/components/ui/ReflectionPrompt.tsx` | AI-generated reflection prompts |
| `src/components/ui/PauseOverlay.tsx` | Volume escalation pause screen |
| `src/components/ui/Timer.tsx` | Turn countdown timer |
| `src/components/ui/VolumeIndicator.tsx` | Real-time volume display |
| `src/components/ui/ParticipantCard.tsx` | Speaker/listener role display |

### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useSocket.ts` | Socket.io connection management |
| `src/hooks/useVolumeMonitor.ts` | Microphone volume detection |
| `src/hooks/useSpeechRecognition.ts` | Speech-to-text (not yet integrated) |
| `src/hooks/useAI.ts` | AI feature hooks |
| `src/hooks/useAuth.ts` | Magic link authentication |
| `src/hooks/useAdminDashboard.ts` | Admin dashboard data and actions |
| `src/hooks/useDeepgramTranscription.ts` | Deepgram real-time transcription |
| `src/hooks/useEmailReport.ts` | Email session report delivery |
| `src/hooks/useExport.ts` | CSV/PDF data export |
| `src/hooks/useSessionAnalytics.ts` | Session analytics and metrics |
| `src/hooks/useSileroVAD.ts` | Silero ML-based voice activity detection |
| `src/hooks/useSkillElementDetector.ts` | DBT skill element real-time detection |
| `src/hooks/useVoiceActivityDetection.ts` | Voice activity detection (VAD) |

### New UI Components (Added 2025-01)
| File | Purpose |
|------|---------|
| `src/components/admin/SessionsTable.tsx` | Admin sessions list with filtering |
| `src/components/demo/DemoDashboard.tsx` | Demo mode dashboard with sample data |
| `src/components/onboarding/SignUpScreen.tsx` | User sign-up / onboarding screen |
| `src/components/session/EmailReportForm.tsx` | Email report composition form |
| `src/components/session/LiveSummaryPanel.tsx` | Real-time session summary panel |
| `src/components/settings/AdvancedSettings.tsx` | Advanced conversation settings |

### Libraries
| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client for database and auth |
| `src/lib/auth/emails.ts` | Email templates for magic links |
| `src/lib/auth/tokens.ts` | Token generation and validation |
| `src/lib/demoData.ts` | Sample data for demo mode |
| `src/lib/export.ts` | CSV and PDF export utilities |
| `src/lib/dbtSkills.ts` | DBT skill definitions and detection patterns |

### Infrastructure
| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema (users, sessions, analytics, access codes) |
| `vercel.json` | Vercel deployment configuration |
| `DEPLOYMENT.md` | Deployment guide and checklist |
| `docs/V1_SYSTEMS_REFERENCE.md` | V1 comprehensive technical reference |

---

## Environment Configuration

### Required Variables
```env
# Core Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001
CORS_ORIGINS=http://localhost:3000

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Transcription (Deepgram)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Email (Resend)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=Mediator <noreply@yourdomain.com>

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (optional - falls back to in-memory)
REDIS_URL=redis://localhost:6379
```

### Production Additions Needed
```env
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

---

## Launch Checklist

### Pre-Beta (Required)
- [x] Redis session storage implemented (2024-12-18)
- [x] Session reconnection flow (2024-12-18)
- [x] Secure session code generation (2024-12-18)
- [x] Input validation on all socket events (2024-12-18 - Zod schemas)
- [x] Rate limiting on session join (2024-12-18)
- [x] Configurable turn duration (2025-01-04)
- [x] Configurable round limits (2025-01-04)
- [x] End conversation button (2025-01-04)
- [x] Authentication layer (2025-01 - Magic link auth via Supabase + Resend)
- [x] Database infrastructure (2025-01 - Supabase schema)
- [x] Admin dashboard with analytics (2025-01)
- [x] Data export (CSV/PDF) (2025-01)
- [x] Deployment configuration (2025-01 - Vercel)
- [ ] Privacy consent flow complete
- [ ] Microphone permissions screen added
- [ ] Error boundaries in place
- [ ] WSS/TLS configured

### B2C Beta Launch
- [ ] 50-100 users recruited
- [ ] Feedback collection mechanism
- [ ] Basic analytics (drop-off points)
- [ ] Error monitoring (Sentry or similar)
- [ ] Support channel established

### B2B MVP Launch (Priority — Jan 2025)
- [ ] Observer mode (read-only, consent-based)
- [ ] Manager check-in template
- [x] PDF summary export (2025-01)
- [x] Basic admin dashboard (2025-01)
- [ ] Audit logging
- [ ] 2-3 HR pilot users recruited
- [ ] 10+ sessions facilitated

### Public Launch
- [ ] All Priority 1-3 items complete
- [ ] Performance tested under load
- [ ] Accessibility audit passed
- [ ] Privacy policy published
- [ ] Security audit completed (if budget allows)

### Post-Launch (Priority 5-6 / B2C)
- [ ] Self-awareness nudge system (Phase 1)
- [ ] Private analytics infrastructure (Phase 1)
- [ ] Therapist onboarding & verification (Phase 2)
- [ ] Client-therapist linking with permissions (Phase 2)
- [ ] HIPAA audit trail (Phase 3)
- [ ] Multi-therapist collaboration (Phase 4)

---

## Implementation Log

Detailed record of changes made, when, and how they apply to the roadmap.

### 2024-12-18: Security Quick Wins

#### 1. Secure Session Code Generation
**Roadmap Item:** 1.2 Security Hardening - Replace `Math.random()` with `crypto.randomBytes`

**Problem:**
- `Math.random()` is not cryptographically secure
- Session codes could theoretically be predicted by attackers
- Participant IDs were also using `Math.random()`, making them forgeable

**Solution Applied:**
```javascript
// Before (INSECURE):
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// After (SECURE):
const crypto = require('crypto');

function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

function generateId() {
  return crypto.randomUUID();
}
```

**Files Changed:**
- `server.js:6` - Added `const crypto = require('crypto');`
- `server.js:315-322` - Updated `generateSessionCode()` function
- `server.js:330-331` - Updated `generateId()` to use `crypto.randomUUID()`

**Impact:**
- Session codes now use cryptographically secure random bytes
- Participant IDs use UUID v4 (crypto-secure, guaranteed unique)
- Prevents session code guessing/brute-force attacks
- Prevents participant ID prediction/impersonation

---

#### 2. Object.assign State Injection Fix
**Roadmap Item:** 1.2 Security Hardening - Fix `Object.assign(session, data)` vulnerability

**Problem:**
- `session:sync` event used `Object.assign(session, data)` to merge client data
- Malicious client could overwrite ANY session property:
  - `sessionId`, `sessionCode` (identity theft)
  - `participants` array (add fake users, remove real ones)
  - `phase`, `currentSpeakerId` (manipulate conversation flow)
  - `transcript` (falsify conversation history)

**Solution Applied:**
```javascript
// Before (VULNERABLE):
socket.on('session:sync', (data) => {
  Object.assign(session, data); // Accepts ANY fields!
});

// After (SECURE):
const ALLOWED_SYNC_FIELDS = [
  'volumeLevel',           // Real-time volume indicator
  'currentReflectionPrompt', // AI-generated reflection text
  'privateNotes',          // User's private notes
];

socket.on('session:sync', (data) => {
  const sanitizedData = {};
  for (const field of ALLOWED_SYNC_FIELDS) {
    if (field in data) {
      sanitizedData[field] = data[field];
    }
  }

  if (Object.keys(sanitizedData).length === 0) {
    console.warn('session:sync received with no allowed fields:', Object.keys(data));
    return;
  }

  Object.assign(session, sanitizedData);
  socket.to(currentSessionCode).emit('session:updated', sanitizedData);
});
```

**Files Changed:**
- `server.js:114-149` - Complete rewrite of `session:sync` handler with whitelist

**Impact:**
- Only `volumeLevel`, `currentReflectionPrompt`, and `privateNotes` can be synced
- All other fields (sessionId, participants, phase, etc.) are protected
- Malicious sync attempts are logged with warning
- No breaking changes for legitimate client usage

**Allowed Fields Rationale:**
| Field | Why Allowed |
|-------|-------------|
| `volumeLevel` | Real-time UI indicator, no security impact |
| `currentReflectionPrompt` | AI-generated text, controlled by server AI routes |
| `privateNotes` | User's own notes, scoped to their view |

**Protected Fields (cannot be synced by client):**
- `sessionId`, `sessionCode` - Identity
- `phase` - Controlled by server events only
- `participants` - Managed by join/leave events
- `currentSpeakerId`, `roundNumber` - Turn management
- `turnTimeSeconds`, `turnStartedAt` - Timer integrity
- `transcript` - Managed by `transcript:add` event
- `intentions` - Set during pre-conversation only

---

#### 3. Zod Schema Validation
**Roadmap Item:** 1.2 Security Hardening - Add Zod schema validation on all socket events

**Problem:**
- Socket events accepted any data without type checking
- Malformed data could cause crashes or undefined behavior
- No protection against oversized payloads
- Participant IDs in transcript:add were not verified

**Solution Applied:**
```javascript
const { z } = require('zod');

// Schemas for all socket events
const SessionCreateSchema = z.object({
  hostName: z.string().min(1).max(50).trim(),
  language: z.enum(['en', 'es']).optional().default('en'),
});

const SessionJoinSchema = z.object({
  code: z.string().length(6).regex(/^[A-Z0-9]+$/i),
  guestName: z.string().min(1).max(50).trim(),
  language: z.enum(['en', 'es']).optional().default('en'),
});

const SessionSyncSchema = z.object({
  volumeLevel: z.number().min(0).max(100).optional(),
  currentReflectionPrompt: z.string().max(1000).optional(),
  privateNotes: z.string().max(5000).optional(),
}).strict(); // Rejects unknown fields

const TranscriptAddSchema = z.object({
  participantId: z.string().uuid(),
  participantName: z.string().min(1).max(50),
  text: z.string().min(1).max(10000),
});

const PauseReasonSchema = z.string().max(200).optional();
```

**Files Changed:**
- `server.js:7` - Added `const { z } = require('zod');`
- `server.js:20-78` - Added all validation schemas and helper function
- `server.js:176-233` - Updated `session:create` with validation
- `server.js:236-298` - Updated `session:join` with validation
- `server.js:300-328` - Updated `session:sync` with validation
- `server.js:365-401` - Updated `transcript:add` with validation + participant verification
- `server.js:403-422` - Updated `pause:request` with validation

**Impact:**
- All input is type-checked and sanitized before processing
- Maximum lengths prevent memory exhaustion attacks
- Invalid data returns clear error messages
- transcript:add now verifies participant is in session
- SessionSyncSchema uses strict mode - rejects any unexpected fields

---

#### 4. Rate Limiting
**Roadmap Item:** 1.2 Security Hardening - Add rate limiting on session:join

**Problem:**
- No limit on session join attempts
- Attacker could brute-force 6-character codes (~1.5 billion combinations)
- No limit on session creation (spam/resource exhaustion)
- Socket.io doesn't support express-rate-limit directly

**Solution Applied:**
```javascript
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxAttempts = options.maxAttempts || 10;
    this.attempts = new Map();
    // Auto-cleanup expired entries
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  check(identifier) {
    // Returns { allowed: boolean, remaining: number, resetIn: number }
  }
}

// Rate limiters
const joinRateLimiter = new RateLimiter({
  windowMs: 60000,    // 1 minute
  maxAttempts: 10,    // 10 attempts per minute
});

const createRateLimiter = new RateLimiter({
  windowMs: 60000,    // 1 minute
  maxAttempts: 5,     // 5 sessions per minute
});
```

**Files Changed:**
- `server.js:80-147` - Added `RateLimiter` class
- `server.js:149-159` - Created rate limiter instances
- `server.js:161-168` - Added `getClientIP()` helper
- `server.js:177-184` - Applied rate limiting to `session:create`
- `server.js:237-244` - Applied rate limiting to `session:join`

**Impact:**
- Join attempts limited to 10/minute per IP (prevents brute-force)
- Session creation limited to 5/minute per IP (prevents spam)
- Clear error messages tell users when to retry
- Rate limit violations logged for monitoring
- Memory-efficient with automatic cleanup

**Configuration:**
| Event | Limit | Window |
|-------|-------|--------|
| `session:join` | 10 attempts | 1 minute |
| `session:create` | 5 sessions | 1 minute |

---

#### 5. Redis Session Storage
**Roadmap Item:** 1.1 Session Persistence - Replace in-memory Map() with Redis

**Problem:**
- Sessions stored in JavaScript `Map()` - lost on server restart
- Cannot scale horizontally (multiple server instances)
- No persistence for reconnection after page refresh
- Memory could grow unbounded with many sessions

**Solution Applied:**
```javascript
const Redis = require('ioredis');

class SessionStore {
  constructor() {
    this.redis = null;
    this.fallbackStore = new Map();
    this.useRedis = false;
    this.SESSION_TTL = 86400; // 24 hours
    this.initRedis();
  }

  async get(sessionCode) {
    if (this.useRedis) {
      const data = await this.redis.get(this._key(sessionCode));
      return data ? JSON.parse(data) : null;
    }
    return this.fallbackStore.get(sessionCode) || null;
  }

  async set(sessionCode, session) {
    this.fallbackStore.set(sessionCode, session); // Always update fallback
    if (this.useRedis) {
      await this.redis.setex(this._key(sessionCode), this.SESSION_TTL, JSON.stringify(session));
    }
  }
}
```

**Files Changed:**
- `server.js:8` - Added `const Redis = require('ioredis');`
- `server.js:18-133` - Added `SessionStore` class with Redis + fallback
- All event handlers converted to `async` and use `await sessionStore.get/set()`

**Impact:**
- Sessions persist in Redis with 24-hour TTL
- Graceful fallback to in-memory if Redis unavailable
- Server can restart without losing active sessions
- Foundation for horizontal scaling (multiple server instances)

**Configuration:**
```env
REDIS_URL=redis://localhost:6379  # Optional - falls back to in-memory
```

---

#### 6. Session Reconnection Flow
**Roadmap Item:** 1.1 Session Persistence - Implement session reconnection flow

**Problem:**
- Page refresh = complete loss of session context
- User had to re-enter name and rejoin with code
- Conversation state lost from their perspective
- Traumatic for users in difficult conversations

**Solution Applied:**
```javascript
const SessionReconnectSchema = z.object({
  sessionCode: z.string().length(6).regex(/^[A-Z0-9]+$/i),
  participantId: z.string().uuid(),
});

socket.on('session:reconnect', async (rawData) => {
  const { sessionCode, participantId } = validation.data;
  const session = await sessionStore.get(normalizedCode);

  // Find and verify participant
  const participant = session.participants.find(p => p.id === participantId);
  if (!participant) {
    socket.emit('session:error', 'You are not a participant in this session.');
    return;
  }

  // Update socket and restore connection
  participant.socketId = socket.id;
  participant.isConnected = true;
  await sessionStore.set(normalizedCode, session);

  // Send full session state
  socket.emit('session:reconnected', { session, participantId });

  // Notify partner
  socket.to(normalizedCode).emit('participant:reconnected', participantId);
});
```

**Files Changed:**
- `server.js:175-180` - Added `SessionReconnectSchema`
- `server.js:424-471` - Added `session:reconnect` event handler

**New Socket Events:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `session:reconnect` | Client → Server | Request to rejoin with sessionCode + participantId |
| `session:reconnected` | Server → Client | Full session state for reconnecting user |
| `participant:reconnected` | Server → Others | Notify partner that user is back |

**Client Integration Required:**
```javascript
// On page load, check localStorage for session info
const savedSession = localStorage.getItem('mediator_session');
if (savedSession) {
  const { sessionCode, participantId } = JSON.parse(savedSession);
  socket.emit('session:reconnect', { sessionCode, participantId });
}

// On session:created or session:joined, save to localStorage
socket.on('session:created', ({ sessionCode, participantId }) => {
  localStorage.setItem('mediator_session', JSON.stringify({ sessionCode, participantId }));
});
```

**Impact:**
- Users can refresh page and resume conversation
- Full session state (phase, transcript, etc.) restored
- Partner notified when someone reconnects
- Session survives brief disconnections (60-second grace + reconnect)

---

### Next Steps (Remaining Priority 1 Items)
| Item | Priority | Estimated Effort |
|------|----------|-----------------|
| WSS/TLS for production | High | 2-3 hours |
| Privacy consent flow | High | 3-4 hours |
| Client-side reconnection integration | Medium | 1-2 hours |

---

### 2024-12-25: Priority 5-6 Feature Design

#### Feature Design Session: Licensed Therapist Integration + Self-Awareness Analysis

**Process:** CTO Agent + Product Designer Agent collaborative dialogue (6 turns)

**Features Designed:**

1. **Licensed Therapist/Advisor Integration (Priority 5)**
   - HIPAA-compliant professional access to client sessions
   - NPI Registry license verification
   - Granular permission system (all OFF by default)
   - Multi-therapist support with optional collaboration mode
   - Immutable audit trail for compliance

2. **Self-Awareness Conversation Analysis (Priority 6)**
   - Private analytics per participant (never shared with partner)
   - Self-defined triggers (words, volume, speaking time)
   - Non-punitive nudge system with choice
   - Anonymous pause requests
   - Client-side encryption for sensitive data

**Key Design Decisions:**

| Decision | Rationale |
|----------|-----------|
| All permissions OFF by default | Client opts IN, never out - trauma-informed consent |
| Partner identity requires BOTH consents | Protects opposing party from unwanted surveillance |
| Nudges are private | Partner never sees when threshold crossed - no shaming |
| Words never echoed back | "Word you're working on" not displayed - dignity preservation |
| Pause requests anonymous | "Someone requested pause" - no blame attribution |
| Client-side encryption for triggers | Platform cannot read user's sensitive word list |

**UX Principles Applied:**
- Security-first, trauma-informed approach
- Plain language consent (no legal jargon)
- 1-tap revocation always visible
- Growth-oriented framing ("Communication Coach" not surveillance)
- WCAG 2.1 AA accessibility compliance

**Database Tables Designed:**
- `therapist_profiles` - License verification
- `therapist_links` - Permission-scoped relationships
- `therapist_audit_log` - Immutable HIPAA trail
- `private_analytics` - Encrypted per-participant data
- `self_awareness_triggers` - Hashed word triggers

**New Socket Events:** 16 events across therapist and self-awareness namespaces

**New Components:** 9 UI components identified

---

---

### 2025-01-04: Conversation Settings & B2B Strategy

#### 1. Configurable Conversation Settings
**Roadmap Item:** 4.3 Extended Features - Configurable turn duration

**Problem:**
- Turn duration was fixed at 90 seconds
- No way to set conversation round limits
- Breathing exercise was mandatory

**Solution Applied:**

**SetupScreen.tsx:**
- Added collapsible "Show conversation settings" panel
- Turn duration options: 1 min, 1.5 min, 2 min
- Round options: Unlimited, 3, 5
- Breathing exercise toggle

**server.js:**
- Added `ConversationSettingsSchema` validation
- Settings stored with session on creation
- `turnTimeSeconds` uses `settings.turnDurationSeconds`
- Max rounds check on `turn:end` — auto-ends when limit reached
- Breathing skip: Goes directly to `active` phase if disabled

**Types:**
```typescript
interface ConversationSettings {
  turnDurationSeconds: number;  // 60, 90, 120
  maxRounds: number;            // 0 = unlimited
  enableVolumeAlerts: boolean;
  enableBreathingExercise: boolean;
}
```

**Files Changed:**
- `src/components/conversation/SetupScreen.tsx` — Settings UI
- `src/app/page.tsx` — Pass settings to createSession
- `src/hooks/useSocket.ts` — Send/receive settings
- `src/store/session.ts` — Store settings
- `src/types/index.ts` — ConversationSettings type
- `server.js` — Validate, store, and apply settings

---

#### 2. End Conversation Button
**Roadmap Item:** 2.4 Incomplete Features

**Problem:**
- "I need to stop this conversation" button was non-functional
- No way to gracefully end a conversation

**Solution Applied:**
- Added `conversation:end` socket event
- Server transitions to `ended` phase
- Both participants see end screen
- "Start a New Conversation" option available

---

#### 3. B2B Strategy & Roadmap
**Roadmap Item:** NEW Priority 7

**Context:**
- Mentor feedback: Prioritize B2B go-to-market
- B2C remains free and stable

**Additions:**
- Priority 7 section with B2B MVP features
- Use cases: Manager 1-on-1s, Conflict Retros, Team Retros
- Database schemas for observers, audit logs, templates
- Socket events for observer mode
- Deployment phases with success criteria
- Updated README with B2B vision and current status

---

### Next Steps (Immediate)

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | Test current features (timer, rounds, settings) | 1-2 hours |
| 2 | Add privacy consent flow | 3-4 hours |
| 3 | Implement WSS/TLS for production | 2-3 hours |
| 4 | Start B2B MVP: Observer mode | 3 days |
| 5 | Recruit 2-3 HR pilot users | Ongoing |

---

### 2025-01-08: Route Restructure for Demo Presentations

#### Route Structure Update
**Purpose:** Separate marketing landing from demo access for presentations

**Problem:**
- Needed enterprise landing page as main entry point
- Full conversation app should be protected for demo presentations
- Clear separation between marketing and product

**Solution Applied:**

**New Route Structure:**
| Route | Purpose |
|-------|---------|
| `/` | Enterprise marketing landing page |
| `/demo` | Code-protected conversation app (access code: `MEDIATOR2025`) |
| `/admin` | Admin dashboard |
| `/observer` | Observer join page |

**Files Changed:**
- `src/app/page.tsx` — Now contains enterprise landing page
- `src/app/demo/page.tsx` — New file with access gate + full conversation flow
- `src/app/landing/page.tsx` — Legacy (can be removed)

**Demo Access Gate:**
- Access code stored in localStorage after entry
- Users without code see professional gate UI
- "Request access" link points back to landing page
- Code: `MEDIATOR2025` (configurable in demo/page.tsx)

**Navigation Updates:**
- All CTAs ("Try Free", "Start Free Session", etc.) link to `/demo`
- Pricing cards link to `/demo`
- "Sign In" links to `/demo`

---

---

### 2025-01: V1 Platform Systems Build

#### Overview
Major platform build-out adding authentication, database infrastructure, advanced analytics, export functionality, voice activity detection, and admin tooling. This batch represents the transition from demo/MVP to a production-ready V1 platform.

#### 1. Passwordless Authentication (Magic Link)
**Roadmap Item:** Technical Debt - No authentication layer

**Solution Applied:**
- Magic link authentication via email (Resend integration)
- Token generation and verification system
- Auth verification page at `/auth/verify`
- `useAuth` hook for client-side auth state management

**Files Added:**
- `src/app/api/auth/magic-link/route.ts` — Send magic link emails
- `src/app/api/auth/verify/route.ts` — Verify auth tokens
- `src/app/auth/verify/page.tsx` — Auth verification page
- `src/hooks/useAuth.ts` — Auth hook
- `src/lib/auth/emails.ts` — Email templates
- `src/lib/auth/tokens.ts` — Token management

**Impact:**
- Users can now authenticate without passwords
- Session security significantly improved
- Foundation for role-based access control

---

#### 2. Supabase Database Integration
**Roadmap Item:** Infrastructure - Persistent storage

**Solution Applied:**
- Supabase client setup for database and auth
- Full database schema with tables for users, sessions, analytics, access codes
- Replaced in-memory storage patterns with database-backed persistence

**Files Added:**
- `src/lib/supabase.ts` — Supabase client
- `supabase/schema.sql` — Complete database schema

---

#### 3. Admin Dashboard Enhancement
**Roadmap Item:** 7.1 B2B MVP — Simple admin dashboard

**Solution Applied:**
- Admin dashboard significantly expanded with analytics views
- Sessions table component with filtering and status tracking
- Admin API routes for analytics and session management
- Dedicated admin dashboard hook

**Files Changed:**
- `src/components/admin/AdminDashboard.tsx` — Major enhancement (+407 lines)
- `src/app/admin/page.tsx` — Enhanced admin page

**Files Added:**
- `src/components/admin/SessionsTable.tsx` — Sessions list table
- `src/app/api/admin/analytics/route.ts` — Analytics API
- `src/app/api/admin/sessions/route.ts` — Sessions API
- `src/hooks/useAdminDashboard.ts` — Admin hook

---

#### 4. Export Functionality (CSV & PDF)
**Roadmap Item:** 2.2 Data Export / 7.1 PDF summary export

**Solution Applied:**
- Export utilities supporting CSV and PDF formats
- React hook for triggering exports from UI
- Session data export for admin and user views

**Files Added:**
- `src/lib/export.ts` — Export utilities
- `src/hooks/useExport.ts` — Export hook

---

#### 5. Voice Activity Detection (Silero VAD)
**Roadmap Item:** Infrastructure — Advanced voice processing

**Solution Applied:**
- Silero VAD integration for ML-based voice activity detection (96%+ accuracy)
- General voice activity detection hook
- Replaces basic volume threshold with intelligent speech detection

**Files Added:**
- `src/hooks/useSileroVAD.ts` — Silero ML model integration
- `src/hooks/useVoiceActivityDetection.ts` — VAD hook

---

#### 6. Deepgram Transcription Hook
**Roadmap Item:** v0 Transcription — Enhanced integration

**Solution Applied:**
- Dedicated Deepgram transcription hook (separate from general transcription)
- Enhanced token route with additional configuration options

**Files Changed:**
- `src/app/api/transcription/token/route.ts` — Enhanced token endpoint

**Files Added:**
- `src/hooks/useDeepgramTranscription.ts` — Deepgram-specific hook

---

#### 7. DBT Skill Element Detection
**Roadmap Item:** DBT skill-based conversation analysis

**Solution Applied:**
- Real-time skill element detection hook
- Expanded DBT skills library with detection patterns

**Files Changed:**
- `src/lib/dbtSkills.ts` — Expanded skill definitions

**Files Added:**
- `src/hooks/useSkillElementDetector.ts` — Skill detection hook

---

#### 8. Session Analytics & Email Reports
**Roadmap Item:** Analytics infrastructure / Communication features

**Solution Applied:**
- Session analytics hook for metrics tracking
- Email report system via Resend
- Email report form UI component
- Live summary panel for real-time session view

**Files Added:**
- `src/hooks/useSessionAnalytics.ts` — Session analytics
- `src/hooks/useEmailReport.ts` — Email report hook
- `src/app/api/email/send-report/route.ts` — Email API
- `src/components/session/EmailReportForm.tsx` — Report form
- `src/components/session/LiveSummaryPanel.tsx` — Live summary

---

#### 9. Access Code System
**Roadmap Item:** Demo access management

**Solution Applied:**
- API routes for access code creation and management
- Validation endpoint for code verification
- Replaces hardcoded access code approach

**Files Added:**
- `src/app/api/access-codes/route.ts` — Access code CRUD
- `src/app/api/access-codes/validate/route.ts` — Code validation

---

#### 10. Demo System & Onboarding
**Roadmap Item:** Demo presentation flow / User onboarding

**Solution Applied:**
- Demo dashboard with pre-populated sample data
- Demo API endpoint
- Sign-up screen for user onboarding
- Enhanced demo page with expanded functionality

**Files Changed:**
- `src/app/demo/page.tsx` — Significantly expanded demo flow

**Files Added:**
- `src/components/demo/DemoDashboard.tsx` — Demo dashboard
- `src/app/api/demo/route.ts` — Demo API
- `src/lib/demoData.ts` — Sample data
- `src/components/onboarding/SignUpScreen.tsx` — Sign-up screen

---

#### 11. Settings & Configuration
**Roadmap Item:** 3.1 AI Transparency — Settings panel

**Solution Applied:**
- Advanced settings component for conversation configuration
- Enhanced environment configuration with all service credentials

**Files Changed:**
- `.env.local.example` — Expanded with Supabase, Resend, Deepgram config

**Files Added:**
- `src/components/settings/AdvancedSettings.tsx` — Settings panel

---

#### 12. Deployment & Documentation
**Solution Applied:**
- Vercel deployment configuration
- Deployment guide with checklist
- V1 comprehensive systems reference document

**Files Added:**
- `vercel.json` — Vercel config
- `DEPLOYMENT.md` — Deployment guide
- `docs/V1_SYSTEMS_REFERENCE.md` — V1 technical reference

---

#### Updated Third-Party Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| **Deepgram** | Real-time transcription + diarization | ✅ Integrated |
| **Supabase** | Database, auth, storage | ✅ Integrated |
| **Resend** | Magic link emails, session reports | ✅ Integrated |
| **Vercel** | Deployment platform | ✅ Configured |
| **Redis** | Session storage (fallback) | ✅ Integrated |

---

*Last updated: 2025-01-27*
