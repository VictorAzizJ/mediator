'use client';

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/session';
import { useSocket } from '@/hooks/useSocket';
import { SetupScreen } from '@/components/conversation/SetupScreen';
import { WaitingScreen } from '@/components/conversation/WaitingScreen';
import { PreConversationSetup } from '@/components/conversation/PreConversationSetup';
import { ActiveConversation } from '@/components/conversation/ActiveConversation';
import { SummaryScreen } from '@/components/conversation/SummaryScreen';
import { BreathingExercise } from '@/components/breathing/BreathingExercise';

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const {
    phase,
    sessionCode,
    participants,
    summary,
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
  } = useSocket();

  // Set current user ID when participants change
  useEffect(() => {
    if (participants.length > 0 && !currentUserId) {
      // The current user is the first participant when creating,
      // or the second when joining
      const userId = participants[participants.length === 1 ? 0 : 1]?.id;
      setCurrentUserId(userId);
    }
  }, [participants, currentUserId]);

  const currentUser = participants.find((p) => p.id === currentUserId);

  // Handle session creation
  const handleCreateSession = (name: string, language: 'en' | 'es') => {
    createSession(name, language);
  };

  // Handle session join
  const handleJoinSession = (code: string, name: string, language: 'en' | 'es') => {
    joinSession(code, name, language);
  };

  // Handle setting intention
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

  // Handle ready for conversation
  const handleReady = () => {
    startBreathing();
  };

  // Handle breathing complete
  const handleBreathingComplete = () => {
    completeBreathing();
  };

  // Handle adding private note
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

  // Handle summary confirmation
  const handleConfirmSummary = () => {
    // In a real app, this would save to local storage
    console.log('Summary confirmed and saved');
  };

  // Handle new conversation
  const handleNewConversation = () => {
    useSessionStore.getState().resetSession();
    setCurrentUserId(null);
  };

  // Render based on phase
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
          />
        ) : null;

      case 'summary':
      case 'ended':
        return summary && currentUserId ? (
          <SummaryScreen
            summary={summary}
            participants={participants}
            currentUserId={currentUserId}
            onAddPrivateNote={handleAddPrivateNote}
            onConfirm={handleConfirmSummary}
            onNewConversation={handleNewConversation}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <p>Generating summary...</p>
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
