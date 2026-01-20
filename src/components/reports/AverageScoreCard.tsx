'use client';

import { motion } from 'framer-motion';

interface AverageScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  subScores?: { label: string; score: number }[];
}

export function AverageScoreCard({
  title,
  score,
  maxScore,
  subScores,
}: AverageScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (percent: number) => {
    if (percent >= 75) return 'var(--color-safe-green)';
    if (percent >= 50) return 'var(--color-safe-amber)';
    return 'var(--color-safe-rose)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="var(--color-calm-100)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke={getScoreColor(percentage)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 251.2' }}
              animate={{
                strokeDasharray: `${(percentage / 100) * 251.2} 251.2`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span
                className="text-2xl font-bold"
                style={{ color: getScoreColor(percentage) }}
              >
                {score.toFixed(1)}
              </span>
              <span
                className="text-xs block"
                style={{ color: 'var(--color-calm-500)' }}
              >
                / {maxScore}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-sm mb-2" style={{ color: 'var(--color-calm-600)' }}>
            Average Score
          </div>
          <div
            className="text-3xl font-bold"
            style={{ color: getScoreColor(percentage) }}
          >
            {percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {subScores && subScores.length > 0 && (
        <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
          {subScores.map((sub) => (
            <div key={sub.label} className="flex items-center justify-between">
              <span className="text-sm capitalize" style={{ color: 'var(--color-calm-600)' }}>
                {sub.label.replace(/_/g, ' ')}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {sub.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
