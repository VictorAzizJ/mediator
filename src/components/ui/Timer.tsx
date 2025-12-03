'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number; // in seconds
  startedAt: number | null;
  onComplete?: () => void;
  size?: number;
}

export function Timer({ duration, startedAt, onComplete, size = 120 }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!startedAt) {
      setRemaining(duration);
      setIsComplete(false);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const newRemaining = Math.max(0, duration - elapsed);
      setRemaining(newRemaining);

      if (newRemaining === 0 && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startedAt, duration, onComplete, isComplete]);

  const progress = remaining / duration;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Color transitions based on time remaining
  const getColor = () => {
    if (progress > 0.5) return 'var(--color-safe-green)';
    if (progress > 0.2) return 'var(--color-safe-amber)';
    return 'var(--color-safe-rose)';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="timer-ring"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
          remaining
        </span>
      </div>
    </div>
  );
}
