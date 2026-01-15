'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/session';
import { useSocket } from '@/hooks/useSocket';
import { SetupScreen } from '@/components/conversation/SetupScreen';
import { WaitingScreen } from '@/components/conversation/WaitingScreen';
import { PreConversationSetup } from '@/components/conversation/PreConversationSetup';
import { ActiveConversation } from '@/components/conversation/ActiveConversation';
import { SummaryScreen } from '@/components/conversation/SummaryScreen';
import { BreathingExercise } from '@/components/breathing/BreathingExercise';
import { PrivacyConsent, PrivacyPreferences } from '@/components/onboarding';
import { MicrophonePermission } from '@/components/onboarding';
import { SessionRecovery } from '@/components/conversation/SessionRecovery';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkillLearningModule } from '@/components/skill';
import type { ConversationSettings } from '@/types';

// Demo access code - change this for your presentations
const DEMO_ACCESS_CODE = 'MEDIATOR2025';

// Storage keys
const STORAGE_KEYS = {
  PRIVACY_PREFERENCES: 'mediator_privacy_preferences',
  SESSION_INFO: 'mediator_session_info',
  MIC_PERMISSION_ASKED: 'mediator_mic_permission_asked',
  DEMO_ACCESS: 'mediator_demo_access',
};

// App state machine
type AppState =
  | 'loading'
  | 'access-gate'
  | 'privacy-consent'
  | 'mic-permission'
  | 'session-recovery'
  | 'main';

interface SavedSessionInfo {
  sessionCode: string;
  participantId: string;
  participantName: string;
  savedAt: number;
}

function AccessGate({ onAccessGranted }: { onAccessGranted: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === DEMO_ACCESS_CODE) {
      localStorage.setItem(STORAGE_KEYS.DEMO_ACCESS, 'granted');
      onAccessGranted();
    } else {
      setError('Invalid access code');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-calm-100)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-700)">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Demo Access
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Enter the access code to try Mediator
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Enter access code"
              className="input w-full text-center text-lg tracking-widest mb-4"
              style={{ letterSpacing: '0.2em' }}
              autoFocus
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm mb-4"
              style={{ color: 'var(--color-alert-red)' }}
            >
              {error}
            </motion.p>
          )}

          <button type="submit" className="btn-primary w-full">
            Access Demo
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-calm-400)' }}>
          Don't have a code?{' '}
          <a href="/" className="underline" style={{ color: 'var(--color-calm-600)' }}>
            Request access
          </a>
        </p>
      </motion.div>
    </div>
  );
}

function DemoContent() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [savedSession, setSavedSession] = useState<SavedSessionInfo | null>(null);
  const [privacyPreferences, setPrivacyPreferences] = useState<PrivacyPreferences | null>(null);

  const {
    phase,
    sessionCode,
    participants,
    currentParticipantId,
    summary,
    speakingTime,
    selectedSkillTemplate,
    skillLearningComplete,
    syncState: storeSyncState,
  } = useSessionStore();

  const {
    createSession,
    joinSession,
    syncState,
    endTurn,
    extendTurn,
    requestPause,
    resumeFromPause,
    startBreathing,
    completeBreathing,
    dismissReflection,
    endConversation,
    reconnectSession,
  } = useSocket();

  // Check stored state on mount
  useEffect(() => {
    const checkStoredState = () => {
      // Check demo access first
      const demoAccess = localStorage.getItem(STORAGE_KEYS.DEMO_ACCESS);
      if (demoAccess !== 'granted') {
        setAppState('access-gate');
        return;
      }

      // Check privacy preferences
      const storedPrefs = localStorage.getItem(STORAGE_KEYS.PRIVACY_PREFERENCES);
      if (!storedPrefs) {
        setAppState('privacy-consent');
        return;
      }

      const prefs = JSON.parse(storedPrefs) as PrivacyPreferences;
      setPrivacyPreferences(prefs);

      // Check if mic permission was asked (and if volume monitoring is enabled)
      const micAsked = localStorage.getItem(STORAGE_KEYS.MIC_PERMISSION_ASKED);
      if (!micAsked && prefs.allowVolumeMonitoring) {
        setAppState('mic-permission');
        return;
      }

      // Check for saved session (less than 24 hours old)
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_INFO);
      if (storedSession) {
        const sessionInfo = JSON.parse(storedSession) as SavedSessionInfo;
        const ageHours = (Date.now() - sessionInfo.savedAt) / (1000 * 60 * 60);
        if (ageHours < 24) {
          setSavedSession(sessionInfo);
          setAppState('session-recovery');
          return;
        } else {
          localStorage.removeItem(STORAGE_KEYS.SESSION_INFO);
        }
      }

      setAppState('main');
    };

    checkStoredState();
  }, []);

  // Save session info when joining/creating
  useEffect(() => {
    if (sessionCode && currentParticipantId && phase !== 'setup') {
      const currentUser = participants.find(p => p.id === currentParticipantId);
      if (currentUser) {
        const sessionInfo: SavedSessionInfo = {
          sessionCode,
          participantId: currentParticipantId,
          participantName: currentUser.name,
          savedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEYS.SESSION_INFO, JSON.stringify(sessionInfo));
      }
    }
  }, [sessionCode, currentParticipantId, phase, participants]);

  // Clear session info when ended
  useEffect(() => {
    if (phase === 'ended') {
      localStorage.removeItem(STORAGE_KEYS.SESSION_INFO);
    }
  }, [phase]);

  // Current user
  const currentUserId = currentParticipantId;
  const currentUser = participants.find((p) => p.id === currentUserId);

  // Handlers
  const handleAccessGranted = () => {
    const storedPrefs = localStorage.getItem(STORAGE_KEYS.PRIVACY_PREFERENCES);
    if (!storedPrefs) {
      setAppState('privacy-consent');
    } else {
      setAppState('main');
    }
  };

  const handlePrivacyAccept = (prefs: PrivacyPreferences) => {
    localStorage.setItem(STORAGE_KEYS.PRIVACY_PREFERENCES, JSON.stringify(prefs));
    setPrivacyPreferences(prefs);

    if (prefs.allowVolumeMonitoring) {
      setAppState('mic-permission');
    } else {
      localStorage.setItem(STORAGE_KEYS.MIC_PERMISSION_ASKED, 'skipped');
      setAppState('main');
    }
  };

  const handleMicGranted = () => {
    localStorage.setItem(STORAGE_KEYS.MIC_PERMISSION_ASKED, 'granted');

    const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_INFO);
    if (storedSession) {
      const sessionInfo = JSON.parse(storedSession) as SavedSessionInfo;
      const ageHours = (Date.now() - sessionInfo.savedAt) / (1000 * 60 * 60);
      if (ageHours < 24) {
        setSavedSession(sessionInfo);
        setAppState('session-recovery');
        return;
      }
    }

    setAppState('main');
  };

  const handleMicSkip = () => {
    localStorage.setItem(STORAGE_KEYS.MIC_PERMISSION_ASKED, 'denied');

    const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_INFO);
    if (storedSession) {
      const sessionInfo = JSON.parse(storedSession) as SavedSessionInfo;
      const ageHours = (Date.now() - sessionInfo.savedAt) / (1000 * 60 * 60);
      if (ageHours < 24) {
        setSavedSession(sessionInfo);
        setAppState('session-recovery');
        return;
      }
    }

    setAppState('main');
  };

  const handleReconnect = () => {
    if (savedSession && reconnectSession) {
      reconnectSession(savedSession.sessionCode, savedSession.participantId);
    }
    setAppState('main');
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_INFO);
    setSavedSession(null);
    setAppState('main');
  };

  const handleCreateSession = (name: string, language: 'en' | 'es', settings: ConversationSettings) => {
    createSession(name, language, settings);
  };

  const handleJoinSession = (code: string, name: string, language: 'en' | 'es') => {
    joinSession(code, name, language);
  };

  const handleSetIntention = (intention: string) => {
    if (currentUserId) {
      syncState({
        intentions: [
          ...useSessionStore.getState().intentions.filter((i) => i.participantId !== currentUserId),
          { participantId: currentUserId, intention },
        ],
      });
    }
  };

  const handleReady = () => {
    // If there's a skill template and learning not complete, show learning module
    if (selectedSkillTemplate && !skillLearningComplete) {
      storeSyncState({ skillLearningComplete: false });
      startBreathing(); // This will trigger the skill learning check
    } else {
      startBreathing();
    }
  };

  const handleSkillLearningComplete = () => {
    storeSyncState({ skillLearningComplete: true });
    // Now start breathing exercise
    startBreathing();
  };

  const handleBreathingComplete = () => {
    completeBreathing();
  };

  const handleAddPrivateNote = (note: string) => {
    if (currentUserId && summary) {
      syncState({
        summary: {
          ...summary,
          privateNotes: [
            ...summary.privateNotes,
            { participantId: currentUserId, note },
          ],
        },
      });
    }
  };

  const handleConfirmSummary = () => {
    if (summary) {
      const savedSummaries = JSON.parse(localStorage.getItem('mediator_summaries') || '[]');
      savedSummaries.push({
        ...summary,
        savedAt: Date.now(),
      });
      localStorage.setItem('mediator_summaries', JSON.stringify(savedSummaries));
    }
  };

  const handleNewConversation = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_INFO);
    useSessionStore.getState().resetSession();
  };

  // Render based on app state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-pulse text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-calm-200)' }}
          />
          <p style={{ color: 'var(--color-calm-400)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (appState === 'access-gate') {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  if (appState === 'privacy-consent') {
    return <PrivacyConsent onAccept={handlePrivacyAccept} />;
  }

  if (appState === 'mic-permission') {
    return (
      <MicrophonePermission
        onPermissionGranted={handleMicGranted}
        onSkip={handleMicSkip}
      />
    );
  }

  if (appState === 'session-recovery' && savedSession) {
    return (
      <SessionRecovery
        sessionCode={savedSession.sessionCode}
        participantName={savedSession.participantName}
        onReconnect={handleReconnect}
        onStartFresh={handleStartFresh}
      />
    );
  }

  // Main app - render based on session phase
  const renderPhase = () => {
    switch (phase) {
      case 'setup':
        return (
          <SetupScreen
            onCreateSession={handleCreateSession}
            onJoinSession={handleJoinSession}
          />
        );

      case 'connecting':
        return (
          <WaitingScreen
            sessionCode={sessionCode}
            hostName={currentUser?.name || 'Unknown'}
          />
        );

      case 'pre-conversation':
        return currentUserId ? (
          <PreConversationSetup
            participants={participants}
            currentUserId={currentUserId}
            onSetIntention={handleSetIntention}
            onReady={handleReady}
          />
        ) : null;

      case 'breathing':
        // Show skill learning module first if template selected and not completed
        if (selectedSkillTemplate && !skillLearningComplete) {
          return (
            <SkillLearningModule
              skill={selectedSkillTemplate.skill}
              onComplete={handleSkillLearningComplete}
              allowSkip={true}
            />
          );
        }
        return (
          <BreathingExercise
            onComplete={handleBreathingComplete}
            rounds={3}
          />
        );

      case 'active':
      case 'paused':
      case 'reflection':
        return currentUserId ? (
          <ActiveConversation
            currentUserId={currentUserId}
            onEndTurn={endTurn}
            onExtendTurn={extendTurn}
            onRequestPause={() => requestPause('user-requested')}
            onResume={resumeFromPause}
            onDismissReflection={dismissReflection}
            onStartBreathing={startBreathing}
            onEndConversation={endConversation}
          />
        ) : null;

      case 'summary':
        return summary && currentUserId ? (
          <SummaryScreen
            summary={summary}
            participants={participants}
            currentUserId={currentUserId}
            speakingTime={speakingTime}
            onAddPrivateNote={handleAddPrivateNote}
            onConfirm={handleConfirmSummary}
            onNewConversation={handleNewConversation}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <p>Generating summary...</p>
          </div>
        );

      case 'ended':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-center max-w-md">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-calm-100)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Conversation Ended
              </h1>
              <p className="mb-8" style={{ color: 'var(--color-calm-500)' }}>
                Thank you for taking the time to communicate. Every conversation is a step forward.
              </p>
              <button
                onClick={handleNewConversation}
                className="btn-primary"
              >
                Start a New Conversation
              </button>
            </div>
          </div>
        );

      default:
        return (
          <SetupScreen
            onCreateSession={handleCreateSession}
            onJoinSession={handleJoinSession}
          />
        );
    }
  };

  return <main className="min-h-screen">{renderPhase()}</main>;
}

export default function DemoPage() {
  return (
    <ErrorBoundary>
      <DemoContent />
    </ErrorBoundary>
  );
}
