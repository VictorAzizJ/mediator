'use client';

import { motion } from 'framer-motion';
import type { CoachingInsight } from '@/types';

interface InsightsPanelProps {
  insights: CoachingInsight[];
  title?: string;
}

export function InsightsPanel({ insights, title = 'Insights' }: InsightsPanelProps) {
  if (insights.length === 0) {
    return null;
  }

  const getTypeStyles = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength':
        return {
          bg: 'var(--color-calm-50)',
          border: 'var(--color-safe-green)',
          icon: '✓',
          iconBg: 'var(--color-safe-green)',
        };
      case 'opportunity':
        return {
          bg: 'var(--color-warm-50)',
          border: 'var(--color-safe-amber)',
          icon: '→',
          iconBg: 'var(--color-safe-amber)',
        };
      case 'tip':
        return {
          bg: 'var(--color-calm-50)',
          border: 'var(--color-calm-400)',
          icon: '💡',
          iconBg: 'var(--color-calm-200)',
        };
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const styles = getTypeStyles(insight.type);
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: styles.bg,
                borderLeft: `4px solid ${styles.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ backgroundColor: styles.iconBg, color: 'white' }}
                >
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <h4
                    className="font-medium text-sm"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {insight.title}
                  </h4>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-calm-600)' }}
                  >
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for inline display
export function InsightBadge({ insight }: { insight: CoachingInsight }) {
  const getTypeColor = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'var(--color-safe-green)';
      case 'opportunity':
        return 'var(--color-safe-amber)';
      case 'tip':
        return 'var(--color-calm-500)';
    }
  };

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
      style={{
        backgroundColor: `${getTypeColor(insight.type)}20`,
        color: getTypeColor(insight.type),
      }}
    >
      <span>{insight.title}</span>
    </div>
  );
}
