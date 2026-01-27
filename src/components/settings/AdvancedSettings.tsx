'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationMode, SpeakerDetectionSettings } from '@/types';

interface AdvancedSettingsProps {
  conversationMode: ConversationMode;
  speakerDetectionSettings: SpeakerDetectionSettings;
  enableVolumeAlerts: boolean;
  enableLiveSummary: boolean;
  enableBreathingExercise: boolean;
  onConversationModeChange: (mode: ConversationMode) => void;
  onSpeakerDetectionSettingsChange: (settings: SpeakerDetectionSettings) => void;
  onVolumeAlertsChange: (enabled: boolean) => void;
  onLiveSummaryChange: (enabled: boolean) => void;
  onBreathingExerciseChange: (enabled: boolean) => void;
  compact?: boolean;
}

const DEFAULT_SPEAKER_SETTINGS: SpeakerDetectionSettings = {
  silenceThresholdMs: 2000,
  minSpeakingDurationMs: 3000,
  maxTurnDurationMs: 180000,
  enableAutoPrompts: true,
};

export function AdvancedSettings({
  conversationMode,
  speakerDetectionSettings = DEFAULT_SPEAKER_SETTINGS,
  enableVolumeAlerts,
  enableLiveSummary,
  enableBreathingExercise,
  onConversationModeChange,
  onSpeakerDetectionSettingsChange,
  onVolumeAlertsChange,
  onLiveSummaryChange,
  onBreathingExerciseChange,
  compact = false,
}: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const handleSpeakerSettingChange = (key: keyof SpeakerDetectionSettings, value: number | boolean) => {
    onSpeakerDetectionSettingsChange({
      ...speakerDetectionSettings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Expandable header for compact mode */}
      {compact && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: 'var(--color-calm-50)' }}
        >
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-calm-500)">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              Advanced Settings
            </span>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="var(--color-calm-400)"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={compact ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Conversation Mode */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Conversation Mode
              </h4>
              <div className="space-y-3">
                <label
                  className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: conversationMode === 'rounds' ? 'var(--color-calm-50)' : 'var(--background)',
                    borderColor: conversationMode === 'rounds' ? 'var(--color-calm-400)' : 'var(--color-calm-200)',
                  }}
                >
                  <input
                    type="radio"
                    name="conversationMode"
                    checked={conversationMode === 'rounds'}
                    onChange={() => onConversationModeChange('rounds')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                      Round-Based
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                      Structured 3 rounds (Setup → Practice → Reflect) with timed turns and prompts.
                    </p>
                  </div>
                </label>

                <label
                  className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: conversationMode === 'speaker-triggered' ? 'var(--color-calm-50)' : 'var(--background)',
                    borderColor: conversationMode === 'speaker-triggered' ? 'var(--color-calm-400)' : 'var(--color-calm-200)',
                  }}
                >
                  <input
                    type="radio"
                    name="conversationMode"
                    checked={conversationMode === 'speaker-triggered'}
                    onChange={() => onConversationModeChange('speaker-triggered')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                      Speaker-Triggered (VAD)
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                      Natural flow using voice activity detection. Turn ends automatically after silence.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Speaker Detection Settings - only show when speaker-triggered */}
            {conversationMode === 'speaker-triggered' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pl-4 border-l-2 space-y-4"
                style={{ borderColor: 'var(--color-calm-200)' }}
              >
                <h5 className="text-sm font-medium" style={{ color: 'var(--color-calm-600)' }}>
                  Voice Activity Detection Settings
                </h5>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                    Silence Threshold: {speakerDetectionSettings.silenceThresholdMs / 1000}s
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={speakerDetectionSettings.silenceThresholdMs}
                    onChange={(e) => handleSpeakerSettingChange('silenceThresholdMs', Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                    How long to wait in silence before turn ends
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                    Min Speaking Duration: {speakerDetectionSettings.minSpeakingDurationMs / 1000}s
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={speakerDetectionSettings.minSpeakingDurationMs}
                    onChange={(e) => handleSpeakerSettingChange('minSpeakingDurationMs', Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                    Minimum time speaking before turn can end
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                    Max Turn Duration: {speakerDetectionSettings.maxTurnDurationMs / 60000}min
                  </label>
                  <input
                    type="range"
                    min="60000"
                    max="300000"
                    step="30000"
                    value={speakerDetectionSettings.maxTurnDurationMs}
                    onChange={(e) => handleSpeakerSettingChange('maxTurnDurationMs', Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                    Maximum time for a single turn
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={speakerDetectionSettings.enableAutoPrompts}
                    onChange={(e) => handleSpeakerSettingChange('enableAutoPrompts', e.target.checked)}
                  />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    Show coaching prompts based on speaking patterns
                  </span>
                </label>
              </motion.div>
            )}

            {/* Monitoring & Feedback */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Monitoring & Feedback
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--color-calm-50)' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                      Volume Alerts
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                      Alert when voice volume gets too high
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableVolumeAlerts}
                    onChange={(e) => onVolumeAlertsChange(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--color-calm-50)' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                      Live Summary Panel
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                      Show real-time session stats (rounds, input types, flags)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableLiveSummary}
                    onChange={(e) => onLiveSummaryChange(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--color-calm-50)' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                      Breathing Exercises
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                      Guided breathing before conversations and during pauses
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableBreathingExercise}
                    onChange={(e) => onBreathingExerciseChange(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
