'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SessionAnalytics, SessionSummaryExport } from '@/types';
import { formatSessionDuration, exportAnalyticsToCSV } from '@/store/analytics';

interface SessionAnalyticsSummaryProps {
  analytics: SessionSummaryExport;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onEmailReport?: (email: string) => void;
}

export function SessionAnalyticsSummary({
  analytics,
  onExportJSON,
  onExportCSV,
  onEmailReport,
}: SessionAnalyticsSummaryProps) {
  const [showRawData, setShowRawData] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { summary, rawData } = analytics;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && onEmailReport) {
      onEmailReport(emailInput.trim());
      setEmailSent(true);
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailSent(false);
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-calm-600)">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        </div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--foreground)' }}
        >
          Session Complete
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--color-calm-500)' }}
        >
          Here's how your practice went
        </p>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-4"
      >
        {/* Skill Badge */}
        {summary.skillPracticed !== 'Free-form' && (
          <div className="flex justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-calm-100)',
                color: 'var(--color-calm-700)',
              }}
            >
              {summary.skillPracticed}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard
            label="Rounds Completed"
            value={`${summary.roundsCompleted}`}
            subtext="of 3"
          />
          <StatCard
            label="Total Time"
            value={summary.totalTime}
          />
          <StatCard
            label="Input Type"
            value={summary.inputBreakdown}
          />
          <StatCard
            label="Volume Alerts"
            value={summary.volumeAlertSummary}
            highlight={rawData.volumeFlags > 0}
          />
        </div>

        {/* Revisions */}
        {summary.revisedRounds > 0 && (
          <div
            className="text-center py-2 px-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-warm-100)' }}
          >
            <p
              className="text-sm"
              style={{ color: 'var(--color-calm-700)' }}
            >
              You revised {summary.revisedRounds} round{summary.revisedRounds > 1 ? 's' : ''} — great attention to clarity!
            </p>
          </div>
        )}
      </motion.div>

      {/* Round-by-Round Breakdown (Expandable) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--color-calm-50)' }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--color-calm-600)' }}
          >
            View round-by-round breakdown
          </span>
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="var(--color-calm-500)"
            animate={{ rotate: showRawData ? 180 : 0 }}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </motion.svg>
        </button>

        <AnimatePresence>
          {showRawData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                {rawData.rounds.map((round, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-calm-50)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-medium uppercase"
                        style={{ color: 'var(--color-calm-500)' }}
                      >
                        Round {round.round} — {round.phase}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'var(--color-calm-200)',
                            color: 'var(--color-calm-700)',
                          }}
                        >
                          {round.inputType}
                        </span>
                        {round.volumeFlag && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: 'var(--color-safe-rose)',
                              color: 'var(--foreground)',
                            }}
                          >
                            volume alert
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className="text-sm mb-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      "{round.text.length > 100 ? round.text.slice(0, 100) + '...' : round.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-calm-400)' }}
                      >
                        {round.responseLength} words
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-calm-400)' }}
                      >
                        {formatSessionDuration(round.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex gap-2">
          {onExportJSON && (
            <button
              onClick={onExportJSON}
              className="flex-1 btn-secondary text-sm py-2"
            >
              Export JSON
            </button>
          )}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex-1 btn-secondary text-sm py-2"
            >
              Export CSV
            </button>
          )}
        </div>

        {/* Email Report */}
        {onEmailReport && (
          <>
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full btn-gentle text-sm py-2"
              >
                Email me this report
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleEmailSubmit}
                className="space-y-2"
              >
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="input text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!emailInput.trim() || emailSent}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    {emailSent ? 'Sent!' : 'Send Report'}
                  </button>
                </div>
              </motion.form>
            )}
          </>
        )}
      </motion.div>

      {/* Data Notice */}
      <p
        className="text-center text-xs mt-4"
        style={{ color: 'var(--color-calm-400)' }}
      >
        Demo data is automatically deleted after 24 hours
      </p>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="p-3 rounded-lg text-center"
      style={{
        backgroundColor: highlight
          ? 'var(--color-warm-100)'
          : 'var(--color-calm-50)',
      }}
    >
      <p
        className="text-xs font-medium mb-1"
        style={{ color: 'var(--color-calm-500)' }}
      >
        {label}
      </p>
      <p
        className="text-lg font-semibold"
        style={{ color: 'var(--foreground)' }}
      >
        {value}
        {subtext && (
          <span
            className="text-sm font-normal ml-1"
            style={{ color: 'var(--color-calm-400)' }}
          >
            {subtext}
          </span>
        )}
      </p>
    </div>
  );
}
