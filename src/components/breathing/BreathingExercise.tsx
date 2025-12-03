'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingExerciseProps {
  onComplete: () => void;
  rounds?: number;
}

type BreathPhase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'complete';

const INHALE_DURATION = 4;
const HOLD_DURATION = 7;
const EXHALE_DURATION = 8;

const phaseInstructions: Record<BreathPhase, string> = {
  ready: 'Get comfortable',
  inhale: 'Breathe in...',
  hold: 'Hold...',
  exhale: 'Breathe out...',
  complete: 'Well done',
};

export function BreathingExercise({ onComplete, rounds = 3 }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<BreathPhase>('ready');
  const [currentRound, setCurrentRound] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const runBreathCycle = useCallback(async () => {
    for (let round = 1; round <= rounds; round++) {
      setCurrentRound(round);

      // Inhale
      setPhase('inhale');
      for (let i = INHALE_DURATION; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Hold
      setPhase('hold');
      for (let i = HOLD_DURATION; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Exhale
      setPhase('exhale');
      for (let i = EXHALE_DURATION; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setPhase('complete');
    setTimeout(onComplete, 2000);
  }, [rounds, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runBreathCycle();
    }, 2000);

    return () => clearTimeout(timer);
  }, [runBreathCycle]);

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.4;
      case 'hold':
        return 1.4;
      case 'exhale':
        return 1;
      default:
        return 1;
    }
  };

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return 'var(--color-safe-green)';
      case 'hold':
        return 'var(--color-safe-amber)';
      case 'exhale':
        return 'var(--color-calm-400)';
      default:
        return 'var(--color-calm-300)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="text-center mb-8">
        <p className="text-sm mb-2" style={{ color: 'var(--color-calm-500)' }}>
          {currentRound > 0 ? `Breath ${currentRound} of ${rounds}` : 'Get ready'}
        </p>
        <AnimatePresence mode="wait">
          <motion.h2
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            {phaseInstructions[phase]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Background circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            backgroundColor: 'var(--color-calm-100)',
          }}
        />

        {/* Animated breathing circle */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            backgroundColor: getCircleColor(),
          }}
          animate={{
            scale: getCircleScale(),
          }}
          transition={{
            duration: phase === 'inhale' ? INHALE_DURATION : phase === 'exhale' ? EXHALE_DURATION : 0.3,
            ease: 'easeInOut',
          }}
        />

        {/* Countdown number */}
        <AnimatePresence mode="wait">
          {countdown > 0 && (
            <motion.span
              key={countdown}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute text-4xl font-bold"
              style={{ color: 'white' }}
            >
              {countdown}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <button
          onClick={onComplete}
          className="btn-secondary text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
