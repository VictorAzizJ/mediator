'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/session';
import { Timer } from '@/components/ui/Timer';
import { VolumeIndicator } from '@/components/ui/VolumeIndicator';
import { ParticipantCard } from '@/components/ui/ParticipantCard';
import { ReflectionPrompt } from '@/components/ui/ReflectionPrompt';
import { PauseOverlay } from '@/components/ui/PauseOverlay';

interface ActiveConversationProps {
  currentUserId: string;
  onEndTurn: () => void;
  onExtendTurn: (seconds: number) => void;
  onRequestPause: () => void;
  onResume: () => void;
  onDismissReflection: () => void;
  onStartBreathing: () => void;
}

export function ActiveConversation({
  currentUserId,
  onEndTurn,
  onExtendTurn,
  onRequestPause,
  onResume,
  onDismissReflection,
  onStartBreathing,
}: ActiveConversationProps) {
  const {
    participants,
    currentSpeakerId,
    turnTimeSeconds,
    turnStartedAt,
    volumeLevel,
    phase,
    pauseReason,
    currentReflectionPrompt,
    roundNumber,
  } = useSessionStore();

  const [showExtendOption, setShowExtendOption] = useState(false);
  const currentParticipant = participants.find((p) => p.id === currentUserId);
  const otherParticipant = participants.find((p) => p.id !== currentUserId);
  const isSpeaking = currentSpeakerId === currentUserId;

  // Show extend option when timer is low
  useEffect(() => {
    if (!turnStartedAt) return;

    const checkTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartedAt) / 1000);
      const remaining = turnTimeSeconds - elapsed;
      setShowExtendOption(remaining <= 15 && remaining > 0);
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [turnStartedAt, turnTimeSeconds]);

  const handleTurnComplete = () => {
    onEndTurn();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <div>
          <h1 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Mediator
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
            Round {roundNumber}
          </p>
        </div>
        <VolumeIndicator level={volumeLevel} showWarning />
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 flex flex-col">
        {/* Participants */}
        <div className="flex justify-center gap-4 mb-8">
          {currentParticipant && (
            <ParticipantCard
              participant={currentParticipant}
              isSpeaking={isSpeaking}
              isCurrentUser
            />
          )}
          {otherParticipant && (
            <ParticipantCard
              participant={otherParticipant}
              isSpeaking={!isSpeaking}
            />
          )}
        </div>

        {/* Timer and controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {phase === 'active' && (
            <>
              <Timer
                duration={turnTimeSeconds}
                startedAt={turnStartedAt}
                onComplete={handleTurnComplete}
                size={160}
              />

              <motion.p
                className="text-lg text-center max-w-xs"
                style={{ color: 'var(--color-calm-600)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {isSpeaking
                  ? 'Share what you need to say'
                  : `Listen to ${otherParticipant?.name || 'them'} without interrupting`}
              </motion.p>

              {/* Speaker controls */}
              {isSpeaking && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  {showExtendOption && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => onExtendTurn(30)}
                      className="btn-gentle w-full"
                    >
                      Need more time? (+30s)
                    </motion.button>
                  )}
                  <button onClick={onEndTurn} className="btn-primary w-full">
                    I'm done speaking
                  </button>
                  <button onClick={onRequestPause} className="btn-secondary w-full">
                    I need a pause
                  </button>
                </div>
              )}

              {/* Listener controls */}
              {!isSpeaking && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={onRequestPause} className="btn-secondary w-full">
                    I need a moment
                  </button>
                </div>
              )}
            </>
          )}

          {/* Reflection prompt */}
          {phase === 'reflection' && currentReflectionPrompt && (
            <ReflectionPrompt
              prompt={currentReflectionPrompt.text}
              onDismiss={onDismissReflection}
              onTakeTime={() => onStartBreathing()}
            />
          )}
        </div>
      </main>

      {/* Footer - always visible exit option */}
      <footer className="p-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <button
          className="w-full text-center py-2 text-sm"
          style={{ color: 'var(--color-calm-400)' }}
        >
          I need to stop this conversation
        </button>
      </footer>

      {/* Pause overlay */}
      <PauseOverlay
        isVisible={phase === 'paused'}
        reason={pauseReason}
        onResume={onResume}
        onStartBreathing={onStartBreathing}
      />
    </div>
  );
}
