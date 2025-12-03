'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SetupScreenProps {
  onCreateSession: (name: string, language: 'en' | 'es') => void;
  onJoinSession: (code: string, name: string, language: 'en' | 'es') => void;
}

export function SetupScreen({ onCreateSession, onJoinSession }: SetupScreenProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateSession(name.trim(), language);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      onJoinSession(code.trim().toUpperCase(), name.trim(), language);
    }
  };

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
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-calm-700)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 6h-2V3H5v3H3c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h2v6h14v-6h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Mediator
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            A safe space for difficult conversations
          </p>
        </div>

        {/* Mode selection */}
        {mode === 'choose' && (
          <div className="card space-y-4">
            <p className="text-center mb-4" style={{ color: 'var(--color-calm-600)' }}>
              What would you like to do?
            </p>
            <button
              onClick={() => setMode('create')}
              className="btn-primary w-full"
            >
              Start a new conversation
            </button>
            <button
              onClick={() => setMode('join')}
              className="btn-secondary w-full"
            >
              Join an existing conversation
            </button>
          </div>
        )}

        {/* Create session form */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} className="card space-y-4">
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="text-sm flex items-center gap-1"
              style={{ color: 'var(--color-calm-500)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </button>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-calm-700)' }}
              >
                Your name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-calm-700)' }}
              >
                Language
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    language === 'en'
                      ? 'border-[var(--color-calm-700)] bg-[var(--color-calm-100)]'
                      : 'border-[var(--border-soft)]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    language === 'es'
                      ? 'border-[var(--color-calm-700)] bg-[var(--color-calm-100)]'
                      : 'border-[var(--border-soft)]'
                  }`}
                >
                  Español
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary w-full"
            >
              Create session
            </button>
          </form>
        )}

        {/* Join session form */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="card space-y-4">
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="text-sm flex items-center gap-1"
              style={{ color: 'var(--color-calm-500)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </button>

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-calm-700)' }}
              >
                Session code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                className="input text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="join-name"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-calm-700)' }}
              >
                Your name
              </label>
              <input
                type="text"
                id="join-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-calm-700)' }}
              >
                Language
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    language === 'en'
                      ? 'border-[var(--color-calm-700)] bg-[var(--color-calm-100)]'
                      : 'border-[var(--border-soft)]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    language === 'es'
                      ? 'border-[var(--color-calm-700)] bg-[var(--color-calm-100)]'
                      : 'border-[var(--border-soft)]'
                  }`}
                >
                  Español
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || code.length !== 6}
              className="btn-primary w-full"
            >
              Join session
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
