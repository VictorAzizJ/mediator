'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PrivacyConsentProps {
  onAccept: (preferences: PrivacyPreferences) => void;
}

export interface PrivacyPreferences {
  acceptedPrivacyPolicy: boolean;
  allowVolumeMonitoring: boolean;
  allowAIAssistance: boolean;
  acceptedAt: number;
}

export function PrivacyConsent({ onAccept }: PrivacyConsentProps) {
  const [step, setStep] = useState<'welcome' | 'privacy' | 'features'>('welcome');
  const [preferences, setPreferences] = useState({
    allowVolumeMonitoring: true,
    allowAIAssistance: true,
  });

  const handleAccept = () => {
    onAccept({
      acceptedPrivacyPolicy: true,
      allowVolumeMonitoring: preferences.allowVolumeMonitoring,
      allowAIAssistance: preferences.allowAIAssistance,
      acceptedAt: Date.now(),
    });
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
        {/* Logo */}
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
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card space-y-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                A safe space for difficult conversations
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Before we begin, let's make sure you understand how Mediator protects your privacy.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-calm-100)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    Your privacy comes first
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    Audio is processed in real-time and never stored. Conversations are encrypted.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-calm-100)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    You're always in control
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    Exit anytime. Toggle features on or off. Delete your data whenever you want.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-calm-100)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    AI helps, not judges
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    Optional AI features offer gentle prompts. You can turn them off anytime.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('privacy')}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step: Privacy Details */}
        {step === 'privacy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card space-y-6"
          >
            <div>
              <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                How we handle your data
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Transparency is important to us.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  Audio & Voice
                </p>
                <p style={{ color: 'var(--color-calm-600)' }}>
                  Your microphone is used only to detect volume levels. Audio is processed locally on your device and <strong>never recorded or stored</strong>.
                </p>
              </div>

              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  Conversation Data
                </p>
                <p style={{ color: 'var(--color-calm-600)' }}>
                  Session data exists only during your conversation. When you leave, it's gone. Summaries can be saved locally on your device if you choose.
                </p>
              </div>

              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  AI Features
                </p>
                <p style={{ color: 'var(--color-calm-600)' }}>
                  If enabled, AI generates reflection prompts and summaries. Text is processed but not stored. You can disable AI features entirely.
                </p>
              </div>

              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  Private Notes
                </p>
                <p style={{ color: 'var(--color-calm-600)' }}>
                  Notes you write are <strong>only visible to you</strong>. They're never shared with your conversation partner or anyone else.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('welcome')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep('features')}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step: Feature Preferences */}
        {step === 'features' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card space-y-6"
          >
            <div>
              <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Choose your preferences
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                You can change these anytime in settings.
              </p>
            </div>

            <div className="space-y-4">
              {/* Volume Monitoring Toggle */}
              <label
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <button
                  type="button"
                  onClick={() => setPreferences(p => ({ ...p, allowVolumeMonitoring: !p.allowVolumeMonitoring }))}
                  className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                    preferences.allowVolumeMonitoring ? 'bg-[var(--color-safe-green)]' : 'bg-[var(--color-calm-300)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      preferences.allowVolumeMonitoring ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    Volume awareness
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    Gentle alerts when voices rise. Helps maintain calm conversations.
                  </p>
                </div>
              </label>

              {/* AI Assistance Toggle */}
              <label
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <button
                  type="button"
                  onClick={() => setPreferences(p => ({ ...p, allowAIAssistance: !p.allowAIAssistance }))}
                  className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                    preferences.allowAIAssistance ? 'bg-[var(--color-safe-green)]' : 'bg-[var(--color-calm-300)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                      preferences.allowAIAssistance ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    AI assistance
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    Thoughtful prompts and neutral summaries. All AI processing is private.
                  </p>
                </div>
              </label>
            </div>

            <div
              className="p-3 rounded-lg text-xs"
              style={{ backgroundColor: 'var(--color-calm-100)', color: 'var(--color-calm-600)' }}
            >
              By continuing, you agree to our approach to privacy. No account required. No data sold. Ever.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('privacy')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleAccept}
                className="btn-primary flex-1"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {['welcome', 'privacy', 'features'].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === s ? 'bg-[var(--color-calm-700)]' : 'bg-[var(--color-calm-300)]'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
