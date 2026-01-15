'use client';

import { motion } from 'framer-motion';
import type { RoundPhase, SkillRoundPrompt } from '@/types';

interface RoundPromptDisplayProps {
  roundNumber: number;
  roundPrompt: SkillRoundPrompt;
  totalRounds?: number;
}

const phaseLabels: Record<RoundPhase, string> = {
  setup: 'Set the Stage',
  practice: 'Apply the Skill',
  reflect: 'Reflect & Respond',
};

const phaseColors: Record<RoundPhase, { bg: string; text: string }> = {
  setup: { bg: 'var(--color-calm-100)', text: 'var(--color-calm-700)' },
  practice: { bg: 'var(--color-safe-green)', text: 'var(--foreground)' },
  reflect: { bg: 'var(--color-warm-100)', text: 'var(--foreground)' },
};

export function RoundPromptDisplay({
  roundNumber,
  roundPrompt,
  totalRounds = 3,
}: RoundPromptDisplayProps) {
  const colors = phaseColors[roundPrompt.phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Round Progress */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i + 1 === roundNumber ? '32px' : '16px',
              backgroundColor:
                i + 1 <= roundNumber
                  ? 'var(--color-calm-600)'
                  : 'var(--color-calm-200)',
            }}
          />
        ))}
      </div>

      {/* Phase Badge */}
      <div className="flex justify-center mb-3">
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          Round {roundNumber}: {phaseLabels[roundPrompt.phase]}
        </span>
      </div>

      {/* Main Prompt */}
      <motion.div
        key={roundNumber}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-4"
      >
        <p
          className="text-lg font-medium leading-relaxed"
          style={{ color: 'var(--foreground)' }}
        >
          "{roundPrompt.prompt}"
        </p>
      </motion.div>

      {/* Coaching Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-start gap-2 p-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-calm-50)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="var(--color-calm-400)"
          className="flex-shrink-0 mt-0.5"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <p
          className="text-sm"
          style={{ color: 'var(--color-calm-600)' }}
        >
          {roundPrompt.coachingNote}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Compact version for use during active conversation
export function RoundPromptCompact({
  roundNumber,
  roundPrompt,
}: {
  roundNumber: number;
  roundPrompt: SkillRoundPrompt;
}) {
  return (
    <div className="text-center">
      <span
        className="text-xs font-medium"
        style={{ color: 'var(--color-calm-500)' }}
      >
        Round {roundNumber} — {phaseLabels[roundPrompt.phase]}
      </span>
      <p
        className="text-base mt-1"
        style={{ color: 'var(--color-calm-600)' }}
      >
        {roundPrompt.prompt}
      </p>
    </div>
  );
}
