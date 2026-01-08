'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationSettings } from '@/types';
import { TemplateSelector } from '@/components/templates';
import { checkInTemplates, type CheckInTemplate } from '@/lib/checkInTemplates';

interface SetupScreenProps {
  onCreateSession: (name: string, language: 'en' | 'es', settings: ConversationSettings) => void;
  onJoinSession: (code: string, name: string, language: 'en' | 'es') => void;
}

type Mode = 'landing' | 'choose-role' | 'templates' | 'create' | 'join';

const defaultSettings: ConversationSettings = {
  turnDurationSeconds: 90,
  maxRounds: 0,
  enableVolumeAlerts: true,
  enableBreathingExercise: true,
};

export function SetupScreen({ onCreateSession, onJoinSession }: SetupScreenProps) {
  const [mode, setMode] = useState<Mode>('landing');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState<ConversationSettings>(defaultSettings);
  const [selectedTemplate, setSelectedTemplate] = useState<CheckInTemplate | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateSession(name.trim(), language, settings);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      onJoinSession(code.trim().toUpperCase(), name.trim(), language);
    }
  };

  const handleSelectTemplate = (template: CheckInTemplate) => {
    setSelectedTemplate(template);
    setSettings({
      turnDurationSeconds: template.turnDuration,
      maxRounds: template.maxRounds,
      enableVolumeAlerts: true,
      enableBreathingExercise: true,
    });
    setMode('create');
  };

  const handleSkipTemplates = () => {
    setSelectedTemplate(null);
    setSettings(defaultSettings);
    setMode('create');
  };

  // Landing page - B2B focused
  if (mode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        {/* Header */}
        <header className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-calm-700)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M21 6h-2V3H5v3H3c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h2v6h14v-6h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Mediator</span>
          </div>
          <a
            href="/admin"
            className="text-sm px-3 py-1 rounded-lg"
            style={{ color: 'var(--color-calm-500)', backgroundColor: 'var(--color-calm-100)' }}
          >
            Admin
          </a>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl"
          >
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Better Workplace Conversations
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--color-calm-500)' }}>
              Structured conversations for teams. 1-on-1s, check-ins, conflict resolution, and more.
            </p>

            {/* Main actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => setMode('templates')}
                className="btn-primary px-8 py-3 text-lg"
              >
                Start a Conversation
              </button>
              <button
                onClick={() => setMode('join')}
                className="btn-secondary px-8 py-3 text-lg"
              >
                Join with Code
              </button>
            </div>

            {/* Role cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <RoleCard
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                }
                title="Participant"
                description="Start or join a structured conversation"
                onClick={() => setMode('choose-role')}
              />
              <RoleCard
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                }
                title="Observer"
                description="Watch a conversation in real-time"
                onClick={() => window.location.href = '/observer'}
              />
              <RoleCard
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                }
                title="Admin"
                description="Manage team settings and analytics"
                onClick={() => window.location.href = '/admin'}
              />
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center" style={{ color: 'var(--color-calm-400)' }}>
          <p className="text-sm">
            Powered by structured dialogue principles
          </p>
        </footer>
      </div>
    );
  }

  // Template selector
  if (mode === 'templates') {
    return (
      <TemplateSelector
        onSelect={handleSelectTemplate}
        onSkip={handleSkipTemplates}
      />
    );
  }

  // Choose role (participant flow)
  if (mode === 'choose-role') {
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
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-calm-700)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M21 6h-2V3H5v3H3c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h2v6h14v-6h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Mediator
            </h1>
            <p style={{ color: 'var(--color-calm-500)' }}>
              What would you like to do?
            </p>
          </div>

          <div className="card space-y-4">
            <button
              onClick={() => setMode('templates')}
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
            <button
              onClick={() => setMode('landing')}
              className="w-full text-center py-2 text-sm"
              style={{ color: 'var(--color-calm-500)' }}
            >
              Back to home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Create session form
  if (mode === 'create') {
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
          {/* Template info banner */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-calm-100)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-calm-700)' }}>
                    Using template
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                    {selectedTemplate.name}
                  </p>
                </div>
                <button
                  onClick={() => setMode('templates')}
                  className="text-sm underline"
                  style={{ color: 'var(--color-calm-500)' }}
                >
                  Change
                </button>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleCreate} className="card space-y-4">
            <button
              type="button"
              onClick={() => setMode(selectedTemplate ? 'templates' : 'landing')}
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

            {/* Show/customize settings if no template or user wants to adjust */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm flex items-center gap-1 w-full justify-center"
              style={{ color: 'var(--color-calm-500)' }}
            >
              {showAdvanced ? 'Hide' : 'Customize'} settings
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
              </svg>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t pt-4 overflow-hidden"
                  style={{ borderColor: 'var(--border-soft)' }}
                >
                  {/* Turn Duration */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-calm-700)' }}>
                      Speaking time per turn
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 60, label: '1m' },
                        { value: 90, label: '1.5m' },
                        { value: 120, label: '2m' },
                        { value: 180, label: '3m' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSettings({ ...settings, turnDurationSeconds: option.value })}
                          className={`py-2 px-2 rounded-lg text-sm border ${
                            settings.turnDurationSeconds === option.value
                              ? 'border-[var(--color-calm-700)] bg-[var(--color-calm-100)]'
                              : 'border-[var(--border-soft)]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Rounds */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-calm-700)' }}>
                      Number of rounds
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 0, label: '∞' },
                        { value: 3, label: '3' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSettings({ ...settings, maxRounds: option.value })}
                          className={`py-2 px-2 rounded-lg text-sm border ${
                            settings.maxRounds === option.value
                              ? 'border-[var(--color-calm-700)] bg-[var(--color-calm-100)]'
                              : 'border-[var(--border-soft)]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Breathing Exercise Toggle */}
                  <label className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-calm-700)' }}>
                      Breathing exercise
                    </span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, enableBreathingExercise: !settings.enableBreathingExercise })}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center ${
                        settings.enableBreathingExercise ? 'bg-[var(--color-safe-green)]' : 'bg-[var(--color-calm-300)]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform mx-0.5 ${
                          settings.enableBreathingExercise ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary w-full"
            >
              Create Session
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Join session form
  if (mode === 'join') {
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
          <form onSubmit={handleJoin} className="card space-y-4">
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="text-sm flex items-center gap-1"
              style={{ color: 'var(--color-calm-500)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </button>

            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Join Conversation
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Enter the code shared by the host
              </p>
            </div>

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
                placeholder="XXXXXX"
                className="input text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                autoFocus
                style={{ letterSpacing: '0.25em' }}
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
              Join Session
            </button>

            <div className="text-center pt-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <a
                href="/observer"
                className="text-sm"
                style={{ color: 'var(--color-calm-500)' }}
              >
                Joining as an observer? Click here
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return null;
}

// Role Card Component
function RoleCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg border-2 text-left transition-all hover:shadow-md hover:border-[var(--color-calm-400)]"
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--color-calm-200)',
      }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: 'var(--color-calm-100)', color: 'var(--color-calm-600)' }}
      >
        {icon}
      </div>
      <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
        {description}
      </p>
    </button>
  );
}
