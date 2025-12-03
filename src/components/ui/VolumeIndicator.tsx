'use client';

import { motion } from 'framer-motion';

interface VolumeIndicatorProps {
  level: number; // 0-100
  showWarning?: boolean;
}

export function VolumeIndicator({ level, showWarning = false }: VolumeIndicatorProps) {
  // Determine color based on level
  const getBarColor = (index: number, totalBars: number) => {
    const barThreshold = (index / totalBars) * 100;

    if (barThreshold > level) {
      return 'var(--color-calm-200)';
    }

    if (level > 80) {
      return 'var(--color-safe-rose)';
    }
    if (level > 60) {
      return 'var(--color-safe-amber)';
    }
    return 'var(--color-safe-green)';
  };

  const bars = 10;

  return (
    <div className="flex flex-col items-center gap-2">
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
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
      {showWarning && level > 70 && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs"
          style={{ color: 'var(--color-safe-amber)' }}
        >
          Voices are rising
        </motion.p>
      )}
    </div>
  );
}
