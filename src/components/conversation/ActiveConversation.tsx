'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/session';
import { useVolumeMonitor } from '@/hooks/useVolumeMonitor';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { Timer } from '@/components/ui/Timer';
import { VolumeIndicator } from '@/components/ui/VolumeIndicator';
import { ParticipantCard } from '@/components/ui/ParticipantCard';
import { ReflectionPrompt } from '@/components/ui/ReflectionPrompt';
import { PauseOverlay } from '@/components/ui/PauseOverlay';
import { SpeakingTimeCompact } from '@/components/ui/SpeakingTimeBar';
import { RoundPromptCompact } from '@/components/skill/RoundPromptDisplay';
import { SkillReferenceCard } from '@/components/skill/SkillReferenceCard';
import { LiveSummaryPanel } from '@/components/session/LiveSummaryPanel';

interface ActiveConversationProps {
  currentUserId: string;
  onEndTurn: () => void;
  onExtendTurn: (seconds: number) => void;
  onRequestPause: () => void;
  onResume: () => void;
  onDismissReflection: () => void;
  onStartBreathing: () => void;
  onEndConversation: () => void;
}

export function ActiveConversation({
  currentUserId,
  onEndTurn,
  onExtendTurn,
  onRequestPause,
  onResume,
  onDismissReflection,
  onStartBreathing,
  onEndConversation,
}: ActiveConversationProps) {
  const {
    participants,
    currentSpeakerId,
    turnTimeSeconds,
    turnStartedAt,
    phase,
    pauseReason,
    currentReflectionPrompt,
    roundNumber,
    speakingTime,
    syncState,
    selectedSkillTemplate,
  } = useSessionStore();

  // Get current round prompt if using skill template
  const currentRoundPrompt = selectedSkillTemplate?.rounds[roundNumber - 1] || null;
  const isSkillBased = !!selectedSkillTemplate;

  // Session analytics tracking
  const {
    rounds: analyticsRounds,
    currentRound: analyticsCurrentRound,
    volumeFlags,
    startRound,
    endRound,
    flagVolumeAlert,
  } = useSessionAnalytics({
    skillUsed: selectedSkillTemplate?.skill || null,
    templateId: selectedSkillTemplate?.id,
    templateName: selectedSkillTemplate?.name,
    totalRounds: isSkillBased ? 3 : 0,
  });

  // Live summary panel state
  const [showLiveSummary, setShowLiveSummary] = useState(true);

  // Initialize volume monitoring
  const { volumeLevel, isListening, startListening, error: micError } = useVolumeMonitor({
    onHighVolume: (level) => {
      // Auto-pause if volume stays high and flag the current round
      console.log('High volume detected:', level);
      flagVolumeAlert();
      onRequestPause();
    },
    onVolumeChange: (level) => {
      // Update store with current volume
      syncState({ volumeLevel: level });
    },
  });

  // Start round tracking when round changes
  useEffect(() => {
    if (roundNumber > 0 && phase === 'active' && roundNumber !== analyticsCurrentRound) {
      const roundPhase = currentRoundPrompt?.phase || 'practice';
      // Default to voice, can be updated when user selects input method
      startRound(roundPhase, 'voice');
    }
  }, [roundNumber, phase, analyticsCurrentRound, currentRoundPrompt, startRound]);

  // Start listening when conversation becomes active
  useEffect(() => {
    if (phase === 'active' && !isListening) {
      startListening();
    }
  }, [phase, isListening, startListening]);

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
            {isSkillBased ? selectedSkillTemplate.skill : 'Mediator'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
            Round {roundNumber}{isSkillBased ? ' of 3' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SpeakingTimeCompact
            speakingTime={speakingTime}
            participants={participants}
            currentUserId={currentUserId}
          />
          <div className="flex items-center gap-2">
            {micError && (
              <span className="text-xs" style={{ color: 'var(--color-alert-red)' }}>
                Mic unavailable
              </span>
            )}
            <VolumeIndicator level={volumeLevel} showWarning />
          </div>
        </div>
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

              {/* Skill-based round prompt or generic instruction */}
              {isSkillBased && currentRoundPrompt ? (
                <div className="max-w-sm">
                  <RoundPromptCompact
                    roundNumber={roundNumber}
                    roundPrompt={currentRoundPrompt}
                  />
                </div>
              ) : (
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
              )}

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
          onClick={onEndConversation}
          className="w-full text-center py-2 text-sm hover:underline"
          style={{ color: 'var(--color-calm-400)' }}
        >
          I need to stop this conversation
        </button>
      </footer>

      {/* Skill Reference Card (floating) */}
      {isSkillBased && selectedSkillTemplate && (
        <SkillReferenceCard skill={selectedSkillTemplate.skill} />
      )}

      {/* Live Summary Panel */}
      {isSkillBased && (
        <LiveSummaryPanel
          skillUsed={selectedSkillTemplate?.skill || null}
          totalRounds={3}
          currentRound={roundNumber}
          rounds={analyticsRounds}
          isExpanded={showLiveSummary}
          onToggle={() => setShowLiveSummary(!showLiveSummary)}
        />
      )}

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
