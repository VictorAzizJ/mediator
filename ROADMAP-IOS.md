# Mediator iOS App Roadmap

> Companion roadmap for native iOS app launching alongside web platform

---

## Executive Summary

**Goal:** Launch native iOS app simultaneously with web platform as dual flagships

**Why Native iOS (vs React Native/PWA):**
- Microphone/audio APIs are more reliable and performant natively
- App Store presence builds trust for privacy-focused users
- Push notifications for session invites
- Background audio processing capabilities
- Haptic feedback for gentle interventions
- HealthKit integration potential (stress/heart rate awareness)

**Shared Backend:** Same Socket.io server, same session codes, cross-platform sessions (iOS user can mediate with web user)

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│   iOS App       │     │   Web App       │
│   (Swift/UIKit  │     │   (Next.js)     │
│    or SwiftUI)  │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │ Socket.io   │
              │ Server      │
              │ (Node.js)   │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │ Redis       │
              │ (Sessions)  │
              └─────────────┘
                     │
              ┌──────▼──────┐
              │ Claude API  │
              │ (AI)        │
              └─────────────┘
```

---

## Technology Decisions

### Framework Choice

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **SwiftUI** | Modern, declarative, less code | iOS 15+ only, some limitations | Recommended for MVP |
| **UIKit** | Full control, mature ecosystem | More boilerplate, imperative | Fallback if SwiftUI limits |
| **React Native** | Code sharing with web | Audio APIs less reliable, bridge overhead | Not recommended |
| **Flutter** | Cross-platform | Different ecosystem, Dart learning curve | Not recommended |

**Decision:** SwiftUI with UIKit components where needed (audio processing)

### Key Dependencies

| Purpose | Library | Notes |
|---------|---------|-------|
| Socket.io | `SocketIO-Client-Swift` | Official Swift client |
| Audio Processing | `AVFoundation` | Native, no dependency needed |
| Speech Recognition | `Speech` framework | On-device, privacy-friendly |
| State Management | `Observation` (iOS 17+) or `Combine` | Native solutions |
| Animations | SwiftUI native | Match Framer Motion feel |
| Networking | `URLSession` | Native, for API calls |

---

## Priority 1: Critical (MVP Parity)

Must match web app functionality for simultaneous launch.

### 1.1 Core Session Flow
| Item | Complexity | Status |
|------|------------|--------|
| Create session (generate code via server) | Medium | [ ] |
| Join session with 6-character code | Low | [ ] |
| Real-time sync via Socket.io | High | [ ] |
| Handle participant join/leave events | Medium | [ ] |
| Session reconnection after app backgrounding | High | [ ] |
| Cross-platform compatibility (iOS ↔ Web) | Medium | [ ] |

### 1.2 Conversation Screens
| Screen | Web Equivalent | Complexity | Status |
|--------|---------------|------------|--------|
| Setup Screen (name, language) | `SetupScreen.tsx` | Low | [ ] |
| Waiting Screen (session code display) | `WaitingScreen.tsx` | Low | [ ] |
| Pre-Conversation Setup (intentions, triggers) | `PreConversationSetup.tsx` | Medium | [ ] |
| Breathing Exercise | `BreathingExercise.tsx` | Medium | [ ] |
| Active Conversation | `ActiveConversation.tsx` | High | [ ] |
| Summary Screen | `SummaryScreen.tsx` | Medium | [ ] |

### 1.3 Audio & Permissions
| Item | Complexity | Status |
|------|------------|--------|
| Microphone permission request with explanation | Low | [ ] |
| Volume monitoring via AVAudioEngine | High | [ ] |
| Speech recognition (on-device) | High | [ ] |
| Background audio session handling | Medium | [ ] |
| Calibration for volume threshold | Medium | [ ] |

### 1.4 Privacy & Consent (iOS-Specific)
| Item | Complexity | Status |
|------|------------|--------|
| App Tracking Transparency (ATT) - likely skip, no tracking | Low | [ ] |
| Privacy Nutrition Labels for App Store | Medium | [ ] |
| Microphone usage description (Info.plist) | Low | [ ] |
| Speech recognition usage description | Low | [ ] |
| Privacy consent flow matching web | Medium | [ ] |

---

## Priority 2: iOS-Native Enhancements

Features that are better on iOS than web.

### 2.1 Haptic Feedback
| Item | Purpose | Status |
|------|---------|--------|
| Gentle haptic on turn transition | Non-intrusive notification | [ ] |
| Stronger haptic on volume escalation warning | Attention without sound | [ ] |
| Subtle haptic during breathing exercise (inhale/exhale) | Grounding, eyes-free guidance | [ ] |
| Success haptic on conversation completion | Positive reinforcement | [ ] |

### 2.2 Push Notifications
| Item | Purpose | Status |
|------|---------|--------|
| Session invite notification | "Alex invited you to a conversation" | [ ] |
| Partner joined notification | "Your partner is ready" | [ ] |
| Session expiring reminder | "Your session expires in 10 minutes" | [ ] |
| Follow-up nudge (opt-in) | "Ready to continue your conversation?" | [ ] |

### 2.3 Native Sharing
| Item | Purpose | Status |
|------|---------|--------|
| Share session code via iOS Share Sheet | Easy invite via Messages, WhatsApp, etc. | [ ] |
| Share summary PDF via Share Sheet | Export to Files, email, etc. | [ ] |
| AirDrop session code | Quick sharing when nearby | [ ] |

### 2.4 Accessibility (iOS-Specific)
| Item | Purpose | Status |
|------|---------|--------|
| VoiceOver support throughout | Screen reader compatibility | [ ] |
| Dynamic Type support | Respect system font size | [ ] |
| Reduce Motion support | Match `prefers-reduced-motion` | [ ] |
| Bold Text support | System accessibility setting | [ ] |
| High Contrast support | Visibility improvement | [ ] |

---

## Priority 3: Advanced iOS Features

Leverage iOS capabilities beyond web parity.

### 3.1 HealthKit Integration (Opt-In)
| Item | Purpose | Privacy Consideration | Status |
|------|---------|----------------------|--------|
| Read heart rate during conversation | Detect physiological stress | Explicit opt-in, never shared | [ ] |
| Suggest breathing exercise if HR elevated | Proactive de-escalation | On-device only | [ ] |
| Mindfulness minutes logging | Integration with Health app | User-controlled | [ ] |

### 3.2 Siri Shortcuts
| Item | Purpose | Status |
|------|---------|--------|
| "Start a mediation session" | Voice-activated session creation | [ ] |
| "Join conversation with [name]" | Quick join for frequent partners | [ ] |
| Add to Shortcuts app | User-customizable automations | [ ] |

### 3.3 Widgets
| Item | Purpose | Status |
|------|---------|--------|
| "Start Conversation" widget | Home screen quick action | [ ] |
| Recent session summary widget | Glanceable reflection | [ ] |
| Breathing exercise widget | Quick calm-down access | [ ] |

### 3.4 Apple Watch Companion (Post-Launch)
| Item | Purpose | Status |
|------|---------|--------|
| Haptic turn notifications | Discreet alerts | [ ] |
| Heart rate monitoring relay | Feed to iPhone app | [ ] |
| Quick breathing exercise | Wrist-based calming | [ ] |
| "Pause needed" tap | Silent signal to iPhone | [ ] |

---

## Priority 4: App Store Requirements

### 4.1 Required Assets
| Item | Specs | Status |
|------|-------|--------|
| App Icon | 1024x1024 + all sizes | [ ] |
| Launch Screen | Storyboard or SwiftUI | [ ] |
| Screenshots (6.7", 6.5", 5.5") | iPhone sizes | [ ] |
| Screenshots (12.9" iPad) | If supporting iPad | [ ] |
| App Preview Video (optional) | 15-30 seconds | [ ] |

### 4.2 App Store Metadata
| Item | Notes | Status |
|------|-------|--------|
| App Name | "Mediator" - check availability | [ ] |
| Subtitle | 30 chars, e.g., "Difficult Conversations Made Safer" | [ ] |
| Description | 4000 chars max, highlight privacy | [ ] |
| Keywords | 100 chars, comma-separated | [ ] |
| Privacy Policy URL | Required | [ ] |
| Support URL | Required | [ ] |
| Category | Health & Fitness or Lifestyle | [ ] |
| Age Rating | 4+ likely, no mature content | [ ] |

### 4.3 Privacy Nutrition Labels
| Data Type | Collected? | Linked to User? | Tracking? |
|-----------|-----------|-----------------|-----------|
| Name | Yes (session only) | No | No |
| Audio Data | Processed, not stored | No | No |
| Health Data | If HealthKit enabled | No | No |
| Usage Data | Minimal analytics if any | No | No |
| Diagnostics | Crash logs | No | No |

**App Store Privacy Summary:** "Data Not Linked to You" + "Data Not Used to Track You"

### 4.4 Review Guidelines Compliance
| Guideline | Consideration | Status |
|-----------|--------------|--------|
| 1.1 Objectionable Content | N/A - user conversations private | [ ] |
| 2.1 App Completeness | All features must work for review | [ ] |
| 4.2 Minimum Functionality | Not just a web wrapper | [ ] |
| 5.1.1 Data Collection | Privacy labels accurate | [ ] |
| 5.1.2 Data Use | Clear consent flows | [ ] |

---

## iOS-Specific Security Considerations

### Data Storage
| Data | Storage Method | Encryption | Status |
|------|---------------|------------|--------|
| Session state | Memory only (like web) | N/A | [ ] |
| Saved summaries | Keychain or encrypted Core Data | iOS encryption | [ ] |
| User preferences | UserDefaults (non-sensitive only) | None needed | [ ] |
| API keys | Keychain | iOS encryption | [ ] |

### Network Security
| Item | Implementation | Status |
|------|---------------|--------|
| TLS/WSS only | ATS (App Transport Security) enforces | [ ] |
| Certificate pinning | Optional, adds protection | [ ] |
| No HTTP exceptions | Strict ATS | [ ] |

### Code Security
| Item | Implementation | Status |
|------|---------------|--------|
| No hardcoded secrets | Use environment/Keychain | [ ] |
| Obfuscation | Consider for release | [ ] |
| Jailbreak detection | Optional, inform user | [ ] |

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Xcode project setup with SwiftUI
- [ ] Socket.io integration and testing
- [ ] Basic navigation structure
- [ ] Core data models matching web types
- [ ] Connect to existing Node.js backend

### Phase 2: Core Screens (Weeks 3-4)
- [ ] SetupScreen implementation
- [ ] WaitingScreen with session code
- [ ] PreConversationSetup (intentions, triggers)
- [ ] Real-time sync verification with web client

### Phase 3: Conversation Flow (Weeks 5-6)
- [ ] BreathingExercise with animations
- [ ] ActiveConversation with turn management
- [ ] Timer and role switching
- [ ] Volume monitoring integration

### Phase 4: AI Integration (Week 7)
- [ ] Trigger detection API calls
- [ ] Reflection prompt display
- [ ] Summarization and SummaryScreen
- [ ] Local fallbacks matching web

### Phase 5: Polish & iOS Enhancements (Week 8)
- [ ] Haptic feedback throughout
- [ ] Accessibility audit
- [ ] Push notification setup
- [ ] App Store assets creation

### Phase 6: Testing & Submission (Weeks 9-10)
- [ ] TestFlight beta distribution
- [ ] Cross-platform testing (iOS ↔ Web)
- [ ] Bug fixes from beta feedback
- [ ] App Store submission
- [ ] Review response preparation

---

## Cross-Platform Sync Considerations

### Shared Session Behavior
| Scenario | Expected Behavior |
|----------|-------------------|
| iOS creates, Web joins | Works - same session code |
| Web creates, iOS joins | Works - same session code |
| iOS disconnects briefly | Session preserved in Redis, reconnect works |
| Different time zones | Server uses UTC, clients display local |

### Feature Parity Tracking
| Feature | Web | iOS | Notes |
|---------|-----|-----|-------|
| Create session | ✓ | [ ] | Same API |
| Join session | ✓ | [ ] | Same code format |
| Turn timer | ✓ | [ ] | Sync via Socket |
| Volume monitoring | ✓ | [ ] | Different audio APIs |
| Speech recognition | Built | [ ] | iOS uses Speech framework |
| AI reflections | ✓ | [ ] | Same API endpoints |
| Summary export | [ ] | [ ] | PDF on both |
| Offline support | N/A | [ ] | Queue for reconnect |

---

## Testing Strategy

### Unit Testing
| Area | Framework | Priority |
|------|-----------|----------|
| Socket.io message handling | XCTest | High |
| Audio level processing | XCTest | High |
| Session state management | XCTest | Medium |
| Timer logic | XCTest | Medium |

### UI Testing
| Flow | Framework | Priority |
|------|-----------|----------|
| Complete session flow | XCUITest | High |
| Permission request handling | XCUITest | High |
| Error states | XCUITest | Medium |
| Accessibility | XCUITest + Accessibility Inspector | High |

### Integration Testing
| Scenario | Method | Priority |
|----------|--------|----------|
| iOS ↔ Web session | Manual + automated | Critical |
| Socket reconnection | Simulated network loss | High |
| Background/foreground transitions | XCUITest | High |

---

## Resource Requirements

### Team
| Role | Responsibility | Allocation |
|------|---------------|------------|
| iOS Developer | SwiftUI, audio, Socket.io | Full-time |
| Designer | iOS-specific assets, HIG compliance | Part-time |
| Backend Developer | Shared with web, API adjustments | Part-time |
| QA | Cross-platform testing | Part-time |

### Infrastructure
| Item | Purpose | Cost Estimate |
|------|---------|--------------|
| Apple Developer Account | App Store, TestFlight | $99/year |
| Push Notification Service | APNs setup | Included with Apple |
| TestFlight | Beta distribution | Free |
| CI/CD (Xcode Cloud or Fastlane) | Automated builds | Variable |

---

## Launch Coordination

### Simultaneous Launch Checklist

**Week Before:**
- [ ] Web app deployed and stable
- [ ] iOS app approved and ready for release
- [ ] Backend scaled for dual traffic
- [ ] Marketing assets prepared
- [ ] Support documentation ready

**Launch Day:**
- [ ] iOS app released (manual or scheduled)
- [ ] Web app live
- [ ] Monitoring dashboards active
- [ ] Support team briefed
- [ ] Social announcement coordinated

**Post-Launch:**
- [ ] Monitor crash reports (Xcode Organizer)
- [ ] Monitor App Store reviews
- [ ] Track cross-platform session success rate
- [ ] Gather user feedback
- [ ] Prioritize v1.1 fixes

---

## File Structure (Proposed)

```
MediatorApp/
├── MediatorApp.xcodeproj
├── MediatorApp/
│   ├── App/
│   │   ├── MediatorApp.swift          # Entry point
│   │   └── AppDelegate.swift          # Push notifications
│   ├── Models/
│   │   ├── Session.swift              # Match web types
│   │   ├── Participant.swift
│   │   └── TranscriptEntry.swift
│   ├── Services/
│   │   ├── SocketService.swift        # Socket.io wrapper
│   │   ├── AudioService.swift         # Volume monitoring
│   │   ├── SpeechService.swift        # Speech recognition
│   │   └── AIService.swift            # API calls
│   ├── ViewModels/
│   │   ├── SessionViewModel.swift     # Main state
│   │   └── ConversationViewModel.swift
│   ├── Views/
│   │   ├── Setup/
│   │   │   ├── SetupView.swift
│   │   │   └── WaitingView.swift
│   │   ├── PreConversation/
│   │   │   ├── IntentionsView.swift
│   │   │   └── TriggersView.swift
│   │   ├── Breathing/
│   │   │   └── BreathingExerciseView.swift
│   │   ├── Conversation/
│   │   │   ├── ActiveConversationView.swift
│   │   │   ├── TimerView.swift
│   │   │   └── VolumeIndicatorView.swift
│   │   ├── Summary/
│   │   │   └── SummaryView.swift
│   │   └── Components/
│   │       ├── ParticipantCard.swift
│   │       ├── ReflectionPrompt.swift
│   │       └── PauseOverlay.swift
│   ├── Utilities/
│   │   ├── HapticManager.swift
│   │   └── Constants.swift
│   └── Resources/
│       ├── Assets.xcassets
│       ├── Localizable.strings
│       └── Info.plist
├── MediatorAppTests/
└── MediatorAppUITests/
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| App Store rejection | Launch delay | Follow guidelines strictly, prepare appeal |
| Audio API differences cause sync issues | User experience | Extensive cross-platform testing |
| Socket.io Swift client bugs | Core functionality | Have fallback to raw WebSocket |
| Review time exceeds estimate | Launch delay | Submit early, use expedited review if critical |
| iOS 17+ requirement limits users | Reduced audience | Consider iOS 16 support (more work) |

---

*Last updated: Generated for iOS flagship launch alongside web platform*
