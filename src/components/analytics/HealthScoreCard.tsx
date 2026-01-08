'use client';

import { motion } from 'framer-motion';
import type { ConversationHealthScore } from '@/types';
import { getScoreColor } from '@/lib/analytics';

interface HealthScoreCardProps {
  score: ConversationHealthScore;
  trend?: 'improving' | 'stable' | 'declining';
  trendPercentage?: number;
  showBreakdown?: boolean;
}

export function HealthScoreCard({
  score,
  trend,
  trendPercentage,
  showBreakdown = true,
}: HealthScoreCardProps) {
  const getTrendInfo = () => {
    if (!trend) return null;
    const icons = {
      improving: { icon: '↑', color: 'var(--color-safe-green)', label: 'Improving' },
      stable: { icon: '→', color: 'var(--color-safe-amber)', label: 'Stable' },
      declining: { icon: '↓', color: 'var(--color-alert-red)', label: 'Needs attention' },
    };
    return icons[trend];
  };

  const trendInfo = getTrendInfo();

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Conversation Health
          </h3>
          {trendInfo && (
            <div className="flex items-center gap-1 mt-1">
              <span style={{ color: trendInfo.color }}>{trendInfo.icon}</span>
              <span className="text-sm" style={{ color: trendInfo.color }}>
                {trendInfo.label}
                {trendPercentage !== undefined && ` (${trendPercentage > 0 ? '+' : ''}${trendPercentage}%)`}
              </span>
            </div>
          )}
        </div>

        {/* Main score circle */}
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
              stroke={getScoreColor(score.overall)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 251.2' }}
              animate={{
                strokeDasharray: `${(score.overall / 100) * 251.2} 251.2`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span
                className="text-2xl font-bold"
                style={{ color: getScoreColor(score.overall) }}
              >
                {score.overall}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      {showBreakdown && (
        <div className="space-y-3">
          <ScoreBar
            label="Communication Balance"
            score={score.communicationBalance}
            description="Equal speaking time"
          />
          <ScoreBar
            label="Emotional Regulation"
            score={score.emotionalRegulation}
            description="Pause usage & stability"
          />
          <ScoreBar
            label="Engagement Depth"
            score={score.engagementDepth}
            description="Thoughtful responses"
          />
          <ScoreBar
            label="Safety Indicator"
            score={score.safetyIndicator}
            description="Healthy patterns"
          />
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  score,
  description,
}: {
  label: string;
  score: number;
  description: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {label}
        </span>
        <span className="text-sm" style={{ color: getScoreColor(score) }}>
          {score}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-calm-100)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getScoreColor(score) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--color-calm-400)' }}>
        {description}
      </p>
    </div>
  );
}
