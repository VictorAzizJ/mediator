'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PauseReason } from '@/types';

interface PauseOverlayProps {
  isVisible: boolean;
  reason: PauseReason | null;
  suggestedReframe?: string;
  onResume: () => void;
  onStartBreathing?: () => void;
}

const reasonMessages: Record<PauseReason, { title: string; description: string }> = {
  'trigger-detected': {
    title: "Let's pause for a moment",
    description: 'Some words can make it harder to hear each other. Would you like to try a different approach?',
  },
  'volume-escalation': {
    title: 'Voices are rising',
    description: "That's normal in hard conversations. Taking a breath together can help.",
  },
  'user-requested': {
    title: 'Taking a pause',
    description: "It's okay to take a break. You can continue when you're ready.",
  },
  'breathing-exercise': {
    title: 'Breathing together',
    description: 'Let this moment settle before continuing.',
  },
};

export function PauseOverlay({
  isVisible,
  reason,
  suggestedReframe,
  onResume,
  onStartBreathing,
}: PauseOverlayProps) {
  const message = reason ? reasonMessages[reason] : null;

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="card max-w-md w-full text-center"
          >
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-warm-100)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                    fill="var(--color-warm-500)"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                {message.title}
              </h2>
              <p style={{ color: 'var(--color-calm-600)' }}>
                {message.description}
              </p>
            </div>

            {suggestedReframe && reason === 'trigger-detected' && (
              <div
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: 'var(--color-calm-100)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--color-calm-500)' }}>
                  You might try saying:
                </p>
                <p className="italic" style={{ color: 'var(--color-calm-700)' }}>
                  "{suggestedReframe}"
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onResume} className="btn-primary">
                {reason === 'trigger-detected' ? 'Try again' : 'Continue'}
              </button>
              {onStartBreathing && reason !== 'breathing-exercise' && (
                <button onClick={onStartBreathing} className="btn-gentle">
                  Breathe together
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
