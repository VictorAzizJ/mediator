'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { DBTSkill, InputType, RoundAnalytics } from '@/types';
import type { SkillCoverage } from '@/hooks/useSkillElementDetector';

interface LiveSummaryPanelProps {
  skillUsed: DBTSkill | null;
  totalRounds: number;
  currentRound: number;
  rounds: RoundAnalytics[];
  isExpanded?: boolean;
  onToggle?: () => void;
  // New: Skill element tracking
  skillCoverage?: SkillCoverage | null;
  currentTranscript?: string;
}

export function LiveSummaryPanel({
  skillUsed,
  totalRounds,
  currentRound,
  rounds,
  isExpanded = false,
  onToggle,
  skillCoverage,
  currentTranscript,
}: LiveSummaryPanelProps) {
  // Calculate summary stats
  const completedRounds = rounds.length;
  const volumeFlags = rounds.filter((r) => r.volumeFlag).length;
  const voiceRounds = rounds.filter((r) => r.inputType === 'voice').length;
  const textRounds = rounds.filter((r) => r.inputType === 'text').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40"
    >
      <div
        className="rounded-xl shadow-lg border overflow-hidden"
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border-soft)',
        }}
      >
        {/* Header - Always visible */}
        <button
          onClick={onToggle}
          className="w-full p-3 flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-calm-50)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-safe-green)' }}
            />
            <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
              Live Summary
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RoundTracker
              totalRounds={totalRounds}
              currentRound={currentRound}
              completedRounds={completedRounds}
              compact
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="var(--color-calm-500)"
              className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
            </svg>
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Skill Badge */}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                    Skill Practiced
                  </label>
                  <div className="mt-1">
                    {skillUsed ? (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: 'var(--color-calm-100)',
                          color: 'var(--color-calm-700)',
                        }}
                      >
                        {skillUsed}
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
                        Free-form conversation
                      </span>
                    )}
                  </div>
                </div>

                {/* Skill Element Coverage (NEW) */}
                {skillCoverage && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                      Skill Coverage
                    </label>
                    <div className="mt-2">
                      <SkillElementTracker coverage={skillCoverage} />
                    </div>
                    {skillCoverage.coachingTip && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-2 rounded-lg text-xs"
                        style={{
                          backgroundColor: 'var(--color-calm-100)',
                          color: 'var(--color-calm-700)',
                        }}
                      >
                        <span className="font-medium">Tip:</span> {skillCoverage.coachingTip}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Live Transcript Preview (NEW) */}
                {currentTranscript && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                      Latest
                    </label>
                    <div
                      className="mt-1 p-2 rounded text-sm italic max-h-16 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-calm-50)',
                        color: 'var(--color-calm-600)',
                      }}
                    >
                      &ldquo;{currentTranscript.slice(-100)}{currentTranscript.length > 100 ? '...' : ''}&rdquo;
                    </div>
                  </div>
                )}

                {/* Round Progress */}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                    Round Progress
                  </label>
                  <div className="mt-2">
                    <RoundTracker
                      totalRounds={totalRounds}
                      currentRound={currentRound}
                      completedRounds={completedRounds}
                    />
                  </div>
                </div>

                {/* Input Type Breakdown */}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                    Input Types
                  </label>
                  <div className="mt-2 flex gap-3">
                    <InputTypeBadge type="voice" count={voiceRounds} />
                    <InputTypeBadge type="text" count={textRounds} />
                  </div>
                </div>

                {/* Volume Flags */}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                    Volume Alerts
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    {volumeFlags > 0 ? (
                      <>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                          style={{
                            backgroundColor: 'var(--color-alert-amber-bg)',
                            color: 'var(--color-alert-amber)',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                          </svg>
                          {volumeFlags} alert{volumeFlags > 1 ? 's' : ''} detected
                        </span>
                      </>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: 'var(--color-safe-green-bg)',
                          color: 'var(--color-safe-green)',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        No alerts
                      </span>
                    )}
                  </div>
                </div>

                {/* Round-by-Round Details */}
                {rounds.length > 0 && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'var(--color-calm-500)' }}>
                      Round Details
                    </label>
                    <div className="mt-2 space-y-2">
                      {rounds.map((round, idx) => (
                        <RoundDetail key={idx} round={round} index={idx + 1} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Round completion tracker with emoji indicators
function RoundTracker({
  totalRounds,
  currentRound,
  completedRounds,
  compact = false,
}: {
  totalRounds: number;
  currentRound: number;
  completedRounds: number;
  compact?: boolean;
}) {
  const rounds = Array.from({ length: totalRounds || 3 }, (_, i) => {
    const roundNum = i + 1;
    if (roundNum < currentRound) return 'completed';
    if (roundNum === currentRound) return 'active';
    return 'pending';
  });

  return (
    <div className={`flex ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {rounds.map((status, idx) => (
        <span
          key={idx}
          className={compact ? 'text-sm' : 'text-lg'}
          title={`Round ${idx + 1}: ${status}`}
        >
          {status === 'completed' ? '✅' : status === 'active' ? '🟦' : '⬜'}
        </span>
      ))}
    </div>
  );
}

// Input type badge
function InputTypeBadge({ type, count }: { type: InputType; count: number }) {
  const isVoice = type === 'voice';

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded"
      style={{
        backgroundColor: 'var(--color-calm-100)',
        opacity: count > 0 ? 1 : 0.5,
      }}
    >
      {isVoice ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-calm-600)">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-calm-600)">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      )}
      <span className="text-xs font-medium" style={{ color: 'var(--color-calm-600)' }}>
        {count} {isVoice ? 'voice' : 'text'}
      </span>
    </div>
  );
}

// Individual round detail
function RoundDetail({ round, index }: { round: RoundAnalytics; index: number }) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div
      className="flex items-center justify-between p-2 rounded"
      style={{ backgroundColor: 'var(--color-calm-50)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          R{index}
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-xs"
          style={{
            backgroundColor: round.inputType === 'voice' ? 'var(--color-calm-200)' : 'var(--color-calm-100)',
            color: 'var(--color-calm-700)',
          }}
        >
          {round.inputType}
        </span>
        {round.volumeFlag && (
          <span title="Volume alert">⚠️</span>
        )}
        {round.wasRedone && (
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ backgroundColor: 'var(--color-calm-100)', color: 'var(--color-calm-500)' }}
          >
            redo
          </span>
        )}
      </div>
      <span className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
        {formatDuration(round.duration)}
      </span>
    </div>
  );
}

// Export a compact version for use in headers
export function LiveSummaryCompact({
  skillUsed,
  currentRound,
  totalRounds,
  volumeFlags,
}: {
  skillUsed: DBTSkill | null;
  currentRound: number;
  totalRounds: number;
  volumeFlags: number;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {skillUsed && (
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold"
          style={{
            backgroundColor: 'var(--color-calm-100)',
            color: 'var(--color-calm-700)',
          }}
        >
          {skillUsed}
        </span>
      )}
      <span style={{ color: 'var(--color-calm-500)' }}>
        Round {currentRound}/{totalRounds || '∞'}
      </span>
      {volumeFlags > 0 && (
        <span
          className="px-1.5 py-0.5 rounded text-xs"
          style={{
            backgroundColor: 'var(--color-alert-amber-bg)',
            color: 'var(--color-alert-amber)',
          }}
        >
          ⚠️ {volumeFlags}
        </span>
      )}
    </div>
  );
}

// Skill element coverage tracker with visual indicators
function SkillElementTracker({ coverage }: { coverage: SkillCoverage }) {
  return (
    <div className="space-y-2">
      {/* Coverage percentage bar */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${coverage.overallCoverage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor:
                coverage.overallCoverage >= 70
                  ? 'var(--color-safe-green)'
                  : coverage.overallCoverage >= 40
                  ? 'var(--color-alert-amber)'
                  : 'var(--color-calm-400)',
            }}
          />
        </div>
        <span
          className="text-xs font-medium w-10 text-right"
          style={{ color: 'var(--color-calm-600)' }}
        >
          {coverage.overallCoverage}%
        </span>
      </div>

      {/* Element boxes */}
      <div className="flex gap-1 justify-center">
        {coverage.elements.map((element, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="relative group"
          >
            <div
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${
                element.detected ? 'ring-2 ring-offset-1 ring-green-500' : ''
              }`}
              style={{
                backgroundColor: element.detected
                  ? 'var(--color-safe-green-bg)'
                  : 'var(--color-calm-100)',
                color: element.detected
                  ? 'var(--color-safe-green)'
                  : 'var(--color-calm-400)',
              }}
              title={`${element.word}${element.detected ? ' ✓' : ' (not detected yet)'}`}
            >
              {element.letter}
            </div>
            {/* Tooltip on hover */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              style={{
                backgroundColor: 'var(--foreground)',
                color: 'var(--background)',
              }}
            >
              {element.word}
              {element.detected && (
                <span style={{ color: 'var(--color-safe-green)' }}> ✓</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Missing elements hint */}
      {coverage.missingElements.length > 0 && coverage.missingElements.length <= 3 && (
        <div
          className="text-xs text-center"
          style={{ color: 'var(--color-calm-500)' }}
        >
          Try adding: {coverage.missingElements.join(', ')}
        </div>
      )}
    </div>
  );
}
