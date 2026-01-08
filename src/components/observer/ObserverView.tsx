'use client';

import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/session';
import { SpeakingTimeBar } from '@/components/ui/SpeakingTimeBar';
import { exportManagerSummaryToPDF } from '@/lib/pdfExport';
import { useState, useEffect } from 'react';

export function ObserverView() {
  const {
    phase,
    participants,
    observers,
    transcript,
    speakingTime,
    currentSpeakerId,
    roundNumber,
    turnStartedAt,
    turnTimeSeconds,
    observerSettings,
    summary,
    sessionId,
  } = useSessionStore();

  const [remainingTime, setRemainingTime] = useState(turnTimeSeconds);
  const [isExporting, setIsExporting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!turnStartedAt || phase !== 'active') {
      setRemainingTime(turnTimeSeconds);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartedAt) / 1000);
      const remaining = Math.max(0, turnTimeSeconds - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [turnStartedAt, turnTimeSeconds, phase]);

  const currentSpeaker = participants.find((p) => p.id === currentSpeakerId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportPDF = async () => {
    if (!summary) return;
    setIsExporting(true);
    try {
      exportManagerSummaryToPDF({
        summary,
        participants,
        speakingTime,
        sessionId,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Observer Header */}
        <div
          className="flex items-center justify-between p-4 rounded-lg mb-6"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-calm-400)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--color-calm-700)' }}>
                Observer Mode
              </p>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Viewing in real-time (read-only)
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
              Round {roundNumber}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
              {observers.length} observer{observers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Conversation State */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current State Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                  Conversation Status
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      phase === 'active'
                        ? 'var(--color-safe-green)'
                        : phase === 'paused'
                        ? 'var(--color-safe-amber)'
                        : 'var(--color-calm-200)',
                    color: phase === 'active' || phase === 'paused' ? 'white' : 'var(--color-calm-600)',
                  }}
                >
                  {phase === 'active' ? 'In Progress' : phase.charAt(0).toUpperCase() + phase.slice(1)}
                </span>
              </div>

              {phase === 'active' && currentSpeaker && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                        Currently Speaking
                      </p>
                      <p className="text-xl font-medium" style={{ color: 'var(--foreground)' }}>
                        {currentSpeaker.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                        Time Remaining
                      </p>
                      <p
                        className="text-2xl font-mono font-medium"
                        style={{
                          color: remainingTime < 30 ? 'var(--color-safe-amber)' : 'var(--foreground)',
                        }}
                      >
                        {formatTime(remainingTime)}
                      </p>
                    </div>
                  </div>

                  {/* Turn Progress Bar */}
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-calm-200)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--color-calm-600)' }}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(remainingTime / turnTimeSeconds) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {phase === 'breathing' && (
                <div className="text-center py-8">
                  <motion.div
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                    style={{ backgroundColor: 'var(--color-calm-200)' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <p style={{ color: 'var(--color-calm-600)' }}>
                    Participants are doing a breathing exercise
                  </p>
                </div>
              )}

              {phase === 'ended' && (
                <div className="text-center py-4">
                  <p style={{ color: 'var(--color-calm-600)' }}>
                    The conversation has ended
                  </p>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="card">
              <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                Participants
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-lg flex items-center gap-3"
                    style={{
                      backgroundColor:
                        p.id === currentSpeakerId
                          ? 'var(--color-calm-100)'
                          : 'var(--color-calm-50)',
                      border:
                        p.id === currentSpeakerId
                          ? '2px solid var(--color-calm-400)'
                          : '1px solid var(--color-calm-100)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: 'var(--color-calm-500)' }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {p.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
                        {p.id === currentSpeakerId ? 'Speaking' : 'Listening'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript (if allowed) */}
            {observerSettings.canViewTranscript && transcript.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Transcript
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-calm-50)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm" style={{ color: 'var(--color-calm-700)' }}>
                          {entry.participantName}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                          Round {entry.roundNumber}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            {/* Speaking Time (if allowed) */}
            {observerSettings.canViewSpeakingTime && speakingTime.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                  Speaking Time
                </h2>
                <SpeakingTimeBar
                  speakingTime={speakingTime}
                  participants={participants}
                  size="lg"
                  showLabels={true}
                />
              </div>
            )}

            {/* Session Stats */}
            <div className="card">
              <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                Session Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-calm-500)' }}>Rounds</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {roundNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-calm-500)' }}>Transcript Entries</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {transcript.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-calm-500)' }}>Turn Duration</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {formatTime(turnTimeSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Button (if allowed and conversation ended) */}
            {observerSettings.canExportData && phase === 'ended' && summary && (
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 18H7v-2h6v2zm0-4H7v-2h6v2zm2-5V3.5L19.5 9H15z" />
                </svg>
                {isExporting ? 'Exporting...' : 'Export Report (PDF)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
