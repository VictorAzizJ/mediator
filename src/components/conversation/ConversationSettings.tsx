'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ConversationSettings } from '@/types';

interface ConversationSettingsProps {
  settings: ConversationSettings;
  onSave: (settings: ConversationSettings) => void;
  onBack: () => void;
}

const TURN_DURATION_OPTIONS = [
  { value: 60, label: '1 minute' },
  { value: 90, label: '1.5 minutes' },
  { value: 120, label: '2 minutes' },
  { value: 180, label: '3 minutes' },
  { value: 300, label: '5 minutes' },
];

const ROUND_OPTIONS = [
  { value: 0, label: 'Unlimited' },
  { value: 3, label: '3 rounds' },
  { value: 5, label: '5 rounds' },
  { value: 10, label: '10 rounds' },
];

export function ConversationSettings({
  settings: initialSettings,
  onSave,
  onBack,
}: ConversationSettingsProps) {
  const [settings, setSettings] = useState<ConversationSettings>(initialSettings);

  const handleSave = () => {
    onSave(settings);
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Conversation Settings
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Customize how your conversation will work
          </p>
        </div>

        <div className="card space-y-6">
          {/* Turn Duration */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Speaking Time per Turn
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TURN_DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, turnDurationSeconds: option.value })}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    settings.turnDurationSeconds === option.value
                      ? 'bg-[var(--color-safe-green)] text-white'
                      : 'bg-[var(--color-calm-100)] hover:bg-[var(--color-calm-200)]'
                  }`}
                  style={settings.turnDurationSeconds !== option.value ? { color: 'var(--foreground)' } : {}}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Rounds */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Number of Rounds
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, maxRounds: option.value })}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    settings.maxRounds === option.value
                      ? 'bg-[var(--color-safe-green)] text-white'
                      : 'bg-[var(--color-calm-100)] hover:bg-[var(--color-calm-200)]'
                  }`}
                  style={settings.maxRounds !== option.value ? { color: 'var(--foreground)' } : {}}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-calm-400)' }}>
              A round is complete when both people have had a turn to speak
            </p>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                Volume alerts when voices rise
              </span>
              <button
                onClick={() => setSettings({ ...settings, enableVolumeAlerts: !settings.enableVolumeAlerts })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enableVolumeAlerts ? 'bg-[var(--color-safe-green)]' : 'bg-[var(--color-calm-300)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    settings.enableVolumeAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                Breathing exercise before starting
              </span>
              <button
                onClick={() => setSettings({ ...settings, enableBreathingExercise: !settings.enableBreathingExercise })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enableBreathingExercise ? 'bg-[var(--color-safe-green)]' : 'bg-[var(--color-calm-300)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    settings.enableBreathingExercise ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button onClick={onBack} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
