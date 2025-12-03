'use client';

import { motion } from 'framer-motion';
import type { Participant } from '@/types';

interface ParticipantCardProps {
  participant: Participant;
  isSpeaking: boolean;
  isCurrentUser?: boolean;
}

export function ParticipantCard({ participant, isSpeaking, isCurrentUser }: ParticipantCardProps) {
  return (
    <motion.div
      className="card flex flex-col items-center gap-3 p-6"
      animate={{
        borderColor: isSpeaking ? 'var(--color-safe-green)' : 'var(--border-soft)',
        boxShadow: isSpeaking
          ? '0 0 0 2px var(--color-safe-green), 0 4px 12px rgba(134, 199, 165, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold"
        style={{
          backgroundColor: isSpeaking ? 'var(--color-safe-green)' : 'var(--color-calm-200)',
          color: isSpeaking ? 'white' : 'var(--color-calm-700)',
        }}
      >
        {participant.name.charAt(0).toUpperCase()}
      </div>

      {/* Name and role */}
      <div className="text-center">
        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
          {participant.name}
          {isCurrentUser && <span className="text-sm" style={{ color: 'var(--color-calm-400)' }}> (you)</span>}
        </p>
        <p
          className="text-sm capitalize"
          style={{ color: isSpeaking ? 'var(--color-safe-green)' : 'var(--color-calm-500)' }}
        >
          {isSpeaking ? 'Speaking' : 'Listening'}
        </p>
      </div>

      {/* Listening indicator */}
      {!isSpeaking && (
        <div className="listening-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7.03 3 3 7.03 3 12V19C3 20.1 3.9 21 5 21H7V12C7 9.24 9.24 7 12 7S17 9.24 17 12V21H19C20.1 21 21 20.1 21 19V12C21 7.03 16.97 3 12 3Z"
              fill="var(--color-calm-400)"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
