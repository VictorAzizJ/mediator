'use client';

import { motion } from 'framer-motion';

interface SessionRecoveryProps {
  sessionCode: string;
  participantName: string;
  onReconnect: () => void;
  onStartFresh: () => void;
}

export function SessionRecovery({
  sessionCode,
  participantName,
  onReconnect,
  onStartFresh,
}: SessionRecoveryProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Welcome Back Icon */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-calm-100)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-700)">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Welcome back, {participantName}
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Looks like you have an active conversation
          </p>
        </div>

        <div className="card space-y-6">
          {/* Session Info */}
          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: 'var(--color-calm-50)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--color-calm-500)' }}>
              Session Code
            </p>
            <p
              className="text-2xl font-mono tracking-widest"
              style={{ color: 'var(--color-calm-700)' }}
            >
              {sessionCode}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={onReconnect}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              Rejoin Conversation
            </button>

            <button
              onClick={onStartFresh}
              className="btn-secondary w-full"
            >
              Start a New Conversation
            </button>
          </div>

          {/* Info */}
          <p
            className="text-xs text-center"
            style={{ color: 'var(--color-calm-400)' }}
          >
            If your partner is still in the session, you'll be reconnected automatically.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
