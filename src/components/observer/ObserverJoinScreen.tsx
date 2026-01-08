'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ObserverJoinScreenProps {
  onJoin: (code: string, name: string) => void;
  onBack: () => void;
}

export function ObserverJoinScreen({ onJoin, onBack }: ObserverJoinScreenProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError('Session code must be 6 characters');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    onJoin(code.toUpperCase(), name.trim());
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ backgroundColor: 'var(--color-calm-100)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-calm-600)">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Join as Observer
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Watch a conversation in real-time
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: 'var(--color-calm-50)' }}
          >
            <div className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-calm-500)">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--color-calm-700)' }}>
                  Observer Mode
                </p>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  You'll be able to watch the conversation without participating.
                  Participants may or may not be notified of your presence.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="observer-name"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Your Name
              </label>
              <input
                id="observer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input w-full"
                maxLength={50}
              />
            </div>

            <div>
              <label
                htmlFor="session-code"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Session Code
              </label>
              <input
                id="session-code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXXXX"
                className="input w-full text-center font-mono text-2xl tracking-widest uppercase"
                maxLength={6}
                style={{ letterSpacing: '0.25em' }}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm"
                style={{ color: 'var(--color-escalation-high)' }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={code.length !== 6 || !name.trim()}
              className="btn-primary w-full"
            >
              Join as Observer
            </button>
          </form>

          {/* What Observers Can Do */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-calm-200)' }}>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-calm-600)' }}>
              As an observer you can:
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-calm-500)' }}>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                View conversation in real-time
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                See speaking time distribution
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Export summary reports (if allowed)
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
