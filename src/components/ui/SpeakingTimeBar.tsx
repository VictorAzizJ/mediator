'use client';

import { motion } from 'framer-motion';
import type { SpeakingTimeRecord, Participant } from '@/types';

interface SpeakingTimeBarProps {
  speakingTime: SpeakingTimeRecord[];
  participants: Participant[];
  currentUserId?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SpeakingTimeBar({
  speakingTime,
  participants,
  currentUserId,
  showLabels = true,
  size = 'md',
}: SpeakingTimeBarProps) {
  // Calculate total speaking time
  const totalSeconds = speakingTime.reduce((sum, r) => sum + r.totalSeconds, 0);

  if (totalSeconds === 0) {
    return null;
  }

  // Get participant info with speaking time
  const participantStats = participants.map((p) => {
    const record = speakingTime.find((r) => r.participantId === p.id);
    const seconds = record?.totalSeconds || 0;
    const percentage = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
    return {
      participant: p,
      seconds,
      percentage,
      turnCount: record?.turnCount || 0,
      isCurrentUser: p.id === currentUserId,
    };
  });

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full">
      {/* Bar */}
      <div
        className={`w-full ${heights[size]} rounded-full overflow-hidden flex`}
        style={{ backgroundColor: 'var(--color-calm-200)' }}
      >
        {participantStats.map((stat, index) => (
          <motion.div
            key={stat.participant.id}
            initial={{ width: 0 }}
            animate={{ width: `${stat.percentage}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${heights[size]} ${index === 0 ? 'rounded-l-full' : ''} ${
              index === participantStats.length - 1 ? 'rounded-r-full' : ''
            }`}
            style={{
              backgroundColor: stat.isCurrentUser
                ? 'var(--color-calm-700)'
                : 'var(--color-calm-400)',
            }}
          />
        ))}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-2">
          {participantStats.map((stat) => (
            <div
              key={stat.participant.id}
              className={`text-xs ${stat.isCurrentUser ? 'text-right' : 'text-left'}`}
              style={{ color: 'var(--color-calm-600)' }}
            >
              <p className="font-medium">
                {stat.isCurrentUser ? 'You' : stat.participant.name}
              </p>
              <p style={{ color: 'var(--color-calm-400)' }}>
                {Math.round(stat.percentage)}% • {formatTime(stat.seconds)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact inline version for active conversation header
export function SpeakingTimeCompact({
  speakingTime,
  participants,
  currentUserId,
}: Omit<SpeakingTimeBarProps, 'showLabels' | 'size'>) {
  const totalSeconds = speakingTime.reduce((sum, r) => sum + r.totalSeconds, 0);

  if (totalSeconds === 0) {
    return null;
  }

  const currentUserRecord = speakingTime.find((r) => r.participantId === currentUserId);
  const currentUserPercentage = currentUserRecord
    ? Math.round((currentUserRecord.totalSeconds / totalSeconds) * 100)
    : 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-16 h-1.5 rounded-full overflow-hidden flex"
        style={{ backgroundColor: 'var(--color-calm-200)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${currentUserPercentage}%`,
            backgroundColor: 'var(--color-calm-700)',
          }}
        />
      </div>
      <span className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
        {currentUserPercentage}%
      </span>
    </div>
  );
}
