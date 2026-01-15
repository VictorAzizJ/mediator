'use client';

import { create } from 'zustand';
import type {
  SessionAnalytics,
  RoundAnalytics,
  InputType,
  RoundPhase,
  DBTSkill,
  SessionSummaryExport,
} from '@/types';

interface AnalyticsState {
  currentSession: SessionAnalytics | null;
  currentRound: Partial<RoundAnalytics> | null;
  sessionStartTime: number | null;
}

interface AnalyticsActions {
  // Session lifecycle
  startSession: (params: {
    sessionId: string;
    sessionCode: string;
    skillUsed: DBTSkill | null;
    templateId: string | null;
    templateName: string | null;
    participantCount: number;
  }) => void;
  endSession: () => SessionAnalytics | null;

  // Round tracking
  startRound: (round: number, phase: RoundPhase) => void;
  endRound: (text: string, inputType: InputType) => void;
  flagVolumeAlert: () => void;
  markRoundAsRedone: () => void;

  // Utilities
  getSessionSummary: () => SessionSummaryExport | null;
  exportToJSON: () => string | null;
  clearSession: () => void;
}

const initialState: AnalyticsState = {
  currentSession: null,
  currentRound: null,
  sessionStartTime: null,
};

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set, get) => ({
  ...initialState,

  startSession: ({ sessionId, sessionCode, skillUsed, templateId, templateName, participantCount }) => {
    const now = Date.now();
    set({
      sessionStartTime: now,
      currentSession: {
        sessionId,
        sessionCode,
        createdAt: now,
        completedAt: null,
        skillUsed,
        templateId,
        templateName,
        roundsCompleted: 0,
        totalRounds: skillUsed ? 3 : 0, // Skill-based always 3 rounds
        sessionTime: 0,
        rounds: [],
        volumeFlags: 0,
        redos: 0,
        inputTypeBreakdown: { voice: 0, text: 0 },
        averageResponseLength: 0,
        participantCount,
      },
      currentRound: null,
    });
  },

  endSession: () => {
    const { currentSession, sessionStartTime } = get();
    if (!currentSession || !sessionStartTime) return null;

    const now = Date.now();
    const sessionTime = Math.floor((now - sessionStartTime) / 1000);

    // Calculate average response length
    const totalWords = currentSession.rounds.reduce((sum, r) => sum + r.responseLength, 0);
    const avgLength = currentSession.rounds.length > 0
      ? Math.round(totalWords / currentSession.rounds.length)
      : 0;

    const finalSession: SessionAnalytics = {
      ...currentSession,
      completedAt: now,
      sessionTime,
      roundsCompleted: currentSession.rounds.length,
      averageResponseLength: avgLength,
    };

    set({ currentSession: finalSession });
    return finalSession;
  },

  startRound: (round, phase) => {
    set({
      currentRound: {
        round,
        phase,
        startTime: Date.now(),
        volumeFlag: false,
        wasRedone: false,
      },
    });
  },

  endRound: (text, inputType) => {
    const { currentSession, currentRound } = get();
    if (!currentSession || !currentRound) return;

    const now = Date.now();
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    const completedRound: RoundAnalytics = {
      round: currentRound.round || 1,
      phase: currentRound.phase || 'setup',
      inputType,
      text,
      responseLength: wordCount,
      volumeFlag: currentRound.volumeFlag || false,
      startTime: currentRound.startTime || now,
      endTime: now,
      duration: Math.floor((now - (currentRound.startTime || now)) / 1000),
      wasRedone: currentRound.wasRedone || false,
    };

    // Update input type breakdown
    const newBreakdown = { ...currentSession.inputTypeBreakdown };
    newBreakdown[inputType]++;

    // Update volume flags count
    const newVolumeFlags = currentSession.volumeFlags + (completedRound.volumeFlag ? 1 : 0);

    // Update redos count
    const newRedos = currentSession.redos + (completedRound.wasRedone ? 1 : 0);

    set({
      currentSession: {
        ...currentSession,
        rounds: [...currentSession.rounds, completedRound],
        inputTypeBreakdown: newBreakdown,
        volumeFlags: newVolumeFlags,
        redos: newRedos,
      },
      currentRound: null,
    });
  },

  flagVolumeAlert: () => {
    const { currentRound } = get();
    if (!currentRound) return;

    set({
      currentRound: {
        ...currentRound,
        volumeFlag: true,
      },
    });
  },

  markRoundAsRedone: () => {
    const { currentRound } = get();
    if (!currentRound) return;

    set({
      currentRound: {
        ...currentRound,
        wasRedone: true,
      },
    });
  },

  getSessionSummary: () => {
    const { currentSession } = get();
    if (!currentSession) return null;

    // Format time
    const minutes = Math.floor(currentSession.sessionTime / 60);
    const seconds = currentSession.sessionTime % 60;
    const timeStr = minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;

    // Format input breakdown
    const { voice, text } = currentSession.inputTypeBreakdown;
    const inputBreakdown = voice > 0 && text > 0
      ? `${voice} voice, ${text} text`
      : voice > 0
        ? `${voice} voice`
        : `${text} text`;

    // Volume alert summary
    const volumeSummary = currentSession.volumeFlags > 0
      ? `${currentSession.volumeFlags} alert${currentSession.volumeFlags > 1 ? 's' : ''} detected`
      : 'No alerts';

    return {
      summary: {
        skillPracticed: currentSession.skillUsed || 'Free-form',
        roundsCompleted: currentSession.roundsCompleted,
        inputBreakdown,
        volumeAlertSummary: volumeSummary,
        revisedRounds: currentSession.redos,
        totalTime: timeStr,
      },
      rawData: currentSession,
      exportedAt: Date.now(),
    };
  },

  exportToJSON: () => {
    const summary = get().getSessionSummary();
    if (!summary) return null;
    return JSON.stringify(summary, null, 2);
  },

  clearSession: () => {
    set(initialState);
  },
}));

// Helper to format analytics for display
export function formatSessionDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Helper to generate CSV export
export function exportAnalyticsToCSV(analytics: SessionAnalytics): string {
  const headers = [
    'Round',
    'Phase',
    'Input Type',
    'Word Count',
    'Duration (s)',
    'Volume Alert',
    'Was Redone',
  ];

  const rows = analytics.rounds.map(r => [
    r.round,
    r.phase,
    r.inputType,
    r.responseLength,
    r.duration,
    r.volumeFlag ? 'Yes' : 'No',
    r.wasRedone ? 'Yes' : 'No',
  ]);

  const csvContent = [
    `Session Analytics - ${analytics.skillUsed || 'Free-form'}`,
    `Session ID: ${analytics.sessionId}`,
    `Date: ${new Date(analytics.createdAt).toLocaleDateString()}`,
    `Total Time: ${formatSessionDuration(analytics.sessionTime)}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  return csvContent;
}
