'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MicrophonePermissionProps {
  onPermissionGranted: () => void;
  onSkip: () => void;
}

type PermissionState = 'prompt' | 'requesting' | 'granted' | 'denied';

export function MicrophonePermission({ onPermissionGranted, onSkip }: MicrophonePermissionProps) {
  const [state, setState] = useState<PermissionState>('prompt');

  const requestPermission = async () => {
    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setState('granted');
      setTimeout(() => {
        onPermissionGranted();
      }, 1000);
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setState('denied');
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
        <div className="card space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-colors ${
                state === 'granted'
                  ? 'bg-[var(--color-safe-green)]'
                  : state === 'denied'
                  ? 'bg-[var(--color-alert-red)]'
                  : 'bg-[var(--color-calm-100)]'
              }`}
            >
              {state === 'granted' ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : state === 'denied' ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </div>

            {state === 'prompt' && (
              <>
                <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Enable volume awareness?
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  Mediator can gently alert you when voices start to rise.
                </p>
              </>
            )}

            {state === 'requesting' && (
              <>
                <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Requesting access...
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  Please allow microphone access in your browser.
                </p>
              </>
            )}

            {state === 'granted' && (
              <>
                <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  All set!
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  Volume awareness is enabled.
                </p>
              </>
            )}

            {state === 'denied' && (
              <>
                <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  No problem
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  You can still use Mediator without volume awareness.
                </p>
              </>
            )}
          </div>

          {/* Explanation */}
          {state === 'prompt' && (
            <div className="space-y-3">
              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  What we do:
                </p>
                <ul className="space-y-1" style={{ color: 'var(--color-calm-600)' }}>
                  <li>• Detect volume levels only</li>
                  <li>• Alert when voices rise</li>
                  <li>• Suggest calming pauses</li>
                </ul>
              </div>

              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  What we never do:
                </p>
                <ul className="space-y-1" style={{ color: 'var(--color-calm-600)' }}>
                  <li>• Record your voice</li>
                  <li>• Store audio data</li>
                  <li>• Send audio anywhere</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          {state === 'prompt' && (
            <div className="space-y-3">
              <button
                onClick={requestPermission}
                className="btn-primary w-full"
              >
                Enable Volume Awareness
              </button>
              <button
                onClick={onSkip}
                className="w-full text-center py-2 text-sm"
                style={{ color: 'var(--color-calm-500)' }}
              >
                Skip for now
              </button>
            </div>
          )}

          {state === 'requesting' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-calm-700)]" />
            </div>
          )}

          {state === 'denied' && (
            <div className="space-y-3">
              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-calm-100)' }}
              >
                <p style={{ color: 'var(--color-calm-600)' }}>
                  You can enable microphone access later in your browser settings if you change your mind.
                </p>
              </div>
              <button
                onClick={onSkip}
                className="btn-primary w-full"
              >
                Continue without volume awareness
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
