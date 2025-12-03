'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Participant } from '@/types';

interface PreConversationSetupProps {
  participants: Participant[];
  currentUserId: string;
  onSetIntention: (intention: string) => void;
  onReady: () => void;
}

export function PreConversationSetup({
  participants,
  currentUserId,
  onSetIntention,
  onReady,
}: PreConversationSetupProps) {
  const [intention, setIntention] = useState('');
  const [step, setStep] = useState<'intention' | 'triggers' | 'ready'>('intention');
  const [customTrigger, setCustomTrigger] = useState('');

  const currentUser = participants.find((p) => p.id === currentUserId);
  const otherUser = participants.find((p) => p.id !== currentUserId);

  const handleIntentionSubmit = () => {
    if (intention.trim()) {
      onSetIntention(intention.trim());
      setStep('triggers');
    }
  };

  const handleReady = () => {
    setStep('ready');
    onReady();
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Before you begin
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Let's set this conversation up for success
          </p>
        </div>

        {/* Participants */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto"
              style={{ backgroundColor: 'var(--color-safe-green)', color: 'white' }}
            >
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
              {currentUser?.name} (you)
            </p>
          </div>
          <div className="flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h16M12 4v16"
                stroke="var(--color-calm-300)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto"
              style={{ backgroundColor: 'var(--color-calm-400)', color: 'white' }}
            >
              {otherUser?.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
              {otherUser?.name}
            </p>
          </div>
        </div>

        {/* Step: Set intention */}
        {step === 'intention' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
              What do you hope {otherUser?.name} understands after this conversation?
            </h2>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="For example: That I care about them, even when I'm frustrated..."
              className="input min-h-[100px] resize-none mb-4"
              autoFocus
            />
            <p className="text-sm mb-4" style={{ color: 'var(--color-calm-400)' }}>
              This is private — only you will see this
            </p>
            <button
              onClick={handleIntentionSubmit}
              disabled={!intention.trim()}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step: Triggers (optional) */}
        {step === 'triggers' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Is there anything that might make this conversation harder for you?
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-calm-500)' }}>
              Optional: Let us know if there are words or topics that are difficult for you. We'll help pause the conversation if things get tense.
            </p>
            <textarea
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              placeholder="For example: When they bring up my job... When they compare me to my sibling..."
              className="input min-h-[80px] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleReady} className="btn-primary flex-1">
                I'm ready
              </button>
              <button onClick={handleReady} className="btn-secondary flex-1">
                Skip this
              </button>
            </div>
          </motion.div>
        )}

        {/* Step: Ready / Waiting */}
        {step === 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center"
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-safe-green)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              You're ready
            </h2>
            <p style={{ color: 'var(--color-calm-500)' }}>
              Waiting for {otherUser?.name} to finish setting up...
            </p>
            <div className="mt-4">
              <motion.div
                className="h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-calm-200)' }}
              >
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: 'var(--color-safe-green)' }}
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
