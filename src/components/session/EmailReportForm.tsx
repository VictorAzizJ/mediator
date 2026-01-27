'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmailReport, buildSummaryText } from '@/hooks/useEmailReport';
import type { SessionAnalytics, TranscriptEntry, ConversationSummary } from '@/types';

interface EmailReportFormProps {
  analytics: SessionAnalytics;
  transcript: TranscriptEntry[];
  conversationSummary?: ConversationSummary;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function EmailReportForm({
  analytics,
  transcript,
  conversationSummary,
  onSuccess,
  onClose,
}: EmailReportFormProps) {
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { sending, sent, error, sendReport, reset } = useEmailReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Build summary text if available
    const summaryText = conversationSummary
      ? buildSummaryText({
          topicsDiscussed: conversationSummary.topicsDiscussed,
          agreements: conversationSummary.agreements,
          openQuestions: conversationSummary.openQuestions,
        })
      : undefined;

    const success = await sendReport(email, analytics, transcript, summaryText);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleClose = () => {
    reset();
    setShowForm(false);
    setEmail('');
    onClose?.();
  };

  // Compact trigger button
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
        Email me the report
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
            Email Session Report
          </h3>
          <button onClick={handleClose} style={{ color: 'var(--color-calm-400)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-safe-green)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Report sent!
              </p>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Check your inbox at {email}
              </p>
              <button
                onClick={handleClose}
                className="btn-secondary mt-4 text-sm"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
            >
              <p className="text-sm mb-3" style={{ color: 'var(--color-calm-500)' }}>
                Receive a full transcript and analytics summary. The transcript will be auto-deleted from our servers after sending.
              </p>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={sending}
                  className="input flex-1 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="btn-primary text-sm px-4"
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Sending
                    </span>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm"
                  style={{ color: 'var(--color-alert-red)' }}
                >
                  {error}
                </motion.p>
              )}

              <p className="mt-3 text-xs" style={{ color: 'var(--color-calm-400)' }}>
                Your email will only be used to send this report. We don't store it or use it for marketing.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
