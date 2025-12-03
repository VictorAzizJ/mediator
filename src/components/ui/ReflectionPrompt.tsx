'use client';

import { motion } from 'framer-motion';

interface ReflectionPromptProps {
  prompt: string;
  onDismiss: () => void;
  onTakeTime?: () => void;
}

export function ReflectionPrompt({ prompt, onDismiss, onTakeTime }: ReflectionPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card max-w-md mx-auto text-center"
      style={{ backgroundColor: 'var(--color-warm-100)', border: 'none' }}
    >
      <div className="mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="mx-auto mb-2"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="var(--color-warm-500)"
          />
        </svg>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-calm-800)' }}>
          Before you respond...
        </h3>
      </div>

      <p className="text-base mb-6" style={{ color: 'var(--color-calm-700)' }}>
        {prompt}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onDismiss} className="btn-primary">
          I'm ready
        </button>
        {onTakeTime && (
          <button onClick={onTakeTime} className="btn-secondary">
            Take a moment
          </button>
        )}
      </div>
    </motion.div>
  );
}
