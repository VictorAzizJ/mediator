'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VolumeIndicatorProps {
  level: number; // 0-100
  showWarning?: boolean;
  onSustainedHighVolume?: () => void;
}

// Gentle, supportive messages for elevated volume
const gentleMessages = {
  mild: [
    "Let's slow down a moment",
    "Take a breath when you're ready",
    "You're doing great—stay grounded",
  ],
  elevated: [
    "Let's pause and reset",
    "A deep breath might help here",
    "It's okay to take a moment",
  ],
};

export function VolumeIndicator({
  level,
  showWarning = false,
  onSustainedHighVolume,
}: VolumeIndicatorProps) {
  const [sustainedSeconds, setSustainedSeconds] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Track sustained high volume
  useEffect(() => {
    if (level > 70) {
      const timer = setInterval(() => {
        setSustainedSeconds((prev) => {
          const next = prev + 1;
          // Callback at 10 seconds sustained
          if (next >= 10 && onSustainedHighVolume) {
            onSustainedHighVolume();
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setSustainedSeconds(0);
    }
  }, [level > 70, onSustainedHighVolume]);

  // Rotate through messages
  useEffect(() => {
    if (sustainedSeconds > 0 && sustainedSeconds % 5 === 0) {
      setMessageIndex((prev) => (prev + 1) % 3);
    }
  }, [sustainedSeconds]);

  // Determine color based on level using new gentle colors
  const getBarColor = (index: number, totalBars: number) => {
    const barThreshold = (index / totalBars) * 100;

    if (barThreshold > level) {
      return 'var(--color-calm-200)';
    }

    if (level > 80) {
      return 'var(--color-volume-high)';
    }
    if (level > 60) {
      return 'var(--color-volume-mid)';
    }
    return 'var(--color-volume-low)';
  };

  const getAlertLevel = () => {
    if (level > 80) return 'elevated';
    if (level > 70) return 'mild';
    return null;
  };

  const alertLevel = getAlertLevel();
  const bars = 10;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Volume Bars */}
      <div className="flex items-end gap-1 h-8">
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full"
            style={{
              backgroundColor: getBarColor(i, bars),
              height: `${((i + 1) / bars) * 100}%`,
            }}
            animate={{
              opacity: (i / bars) * 100 < level ? 1 : 0.3,
              scale: level > 80 && (i / bars) * 100 < level ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.1,
              scale: { duration: 0.3, repeat: level > 80 ? Infinity : 0, repeatDelay: 1 }
            }}
          />
        ))}
      </div>

      {/* Gentle Alert Messages */}
      <AnimatePresence mode="wait">
        {showWarning && alertLevel && (
          <motion.div
            key={`${alertLevel}-${messageIndex}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="text-center"
          >
            <p
              className="text-xs font-medium"
              style={{
                color: alertLevel === 'elevated'
                  ? 'var(--color-volume-high)'
                  : 'var(--color-volume-mid)'
              }}
            >
              {gentleMessages[alertLevel][messageIndex]}
            </p>
            {sustainedSeconds >= 5 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs mt-1"
                style={{ color: 'var(--color-calm-400)' }}
              >
                {sustainedSeconds}s elevated
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for header display
export function VolumeIndicatorCompact({ level }: { level: number }) {
  const getColor = () => {
    if (level > 80) return 'var(--color-volume-high)';
    if (level > 60) return 'var(--color-volume-mid)';
    return 'var(--color-volume-low)';
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: getColor() }}
      />
      <span
        className="text-xs tabular-nums"
        style={{ color: 'var(--color-calm-400)' }}
      >
        {level}%
      </span>
    </div>
  );
}
