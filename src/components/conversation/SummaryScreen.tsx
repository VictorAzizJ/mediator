'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ConversationSummary, Participant, SpeakingTimeRecord } from '@/types';
import { exportSummaryToPDF } from '@/lib/pdfExport';

interface SummaryScreenProps {
  summary: ConversationSummary;
  participants: Participant[];
  currentUserId: string;
  speakingTime?: SpeakingTimeRecord[];
  onAddPrivateNote: (note: string) => void;
  onConfirm: () => void;
  onNewConversation: () => void;
}

export function SummaryScreen({
  summary,
  participants,
  currentUserId,
  speakingTime = [],
  onAddPrivateNote,
  onConfirm,
  onNewConversation,
}: SummaryScreenProps) {
  const [privateNote, setPrivateNote] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      exportSummaryToPDF({
        summary,
        participants,
        speakingTime,
        currentUserId,
        includePrivateNotes: true,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddNote = () => {
    if (privateNote.trim()) {
      onAddPrivateNote(privateNote.trim());
      setPrivateNote('');
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm();
  };

  const currentUserNotes = summary.privateNotes.filter(
    (n) => n.participantId === currentUserId
  );

  return (
    <div
      className="min-h-screen p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-safe-green)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Conversation Complete
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Thank you both for showing up. Here's a summary of what you discussed.
          </p>
        </div>

        {/* Summary card */}
        <div className="card mb-6">
          {/* Topics */}
          <section className="mb-6">
            <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              Topics Discussed
            </h2>
            <ul className="space-y-2">
              {summary.topicsDiscussed.map((topic, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2"
                  style={{ color: 'var(--color-calm-600)' }}
                >
                  <span style={{ color: 'var(--color-safe-green)' }}>•</span>
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          {/* What each person expressed */}
          <section className="mb-6">
            <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              What Was Shared
            </h2>
            <div className="space-y-4">
              {summary.participantExpressions.map((expr) => {
                const participant = participants.find((p) => p.id === expr.participantId);
                return (
                  <div
                    key={expr.participantId}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--color-calm-50)' }}
                  >
                    <p className="font-medium mb-1" style={{ color: 'var(--color-calm-700)' }}>
                      {expr.participantName || participant?.name}
                    </p>
                    <p style={{ color: 'var(--color-calm-600)' }}>{expr.summary}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Agreements */}
          {summary.agreements.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Agreements Made
              </h2>
              <ul className="space-y-2">
                {summary.agreements.map((agreement, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2"
                    style={{ color: 'var(--color-calm-600)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    {agreement}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Open questions */}
          {summary.openQuestions.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                To Revisit Later
              </h2>
              <ul className="space-y-2">
                {summary.openQuestions.map((question, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2"
                    style={{ color: 'var(--color-calm-600)' }}
                  >
                    <span style={{ color: 'var(--color-safe-amber)' }}>?</span>
                    {question}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Private notes section */}
        <div className="card mb-6">
          <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Private Notes
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-calm-400)' }}>
              (only visible to you)
            </span>
          </h2>

          {currentUserNotes.length > 0 && (
            <div className="mb-4 space-y-2">
              {currentUserNotes.map((note, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-warm-100)' }}
                >
                  <p style={{ color: 'var(--color-calm-700)' }}>{note.note}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              placeholder="Add a private note..."
              className="input flex-1"
            />
            <button
              onClick={handleAddNote}
              disabled={!privateNote.trim()}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-8">
          {!isConfirmed ? (
            <button onClick={handleConfirm} className="btn-primary w-full">
              Save this summary
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-safe-green)', color: 'white' }}
            >
              Summary saved to your device
            </motion.div>
          )}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 18H7v-2h6v2zm0-4H7v-2h6v2zm2-5V3.5L19.5 9H15z" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export as PDF'}
          </button>
          <button onClick={onNewConversation} className="btn-secondary w-full">
            Start a new conversation
          </button>
        </div>

        {/* Closing message */}
        <p className="text-center text-sm pb-8" style={{ color: 'var(--color-calm-400)' }}>
          Remember: one conversation doesn't fix everything. But you showed up. That matters.
        </p>
      </motion.div>
    </div>
  );
}
