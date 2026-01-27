'use client';

import { useState, useCallback } from 'react';
import {
  sessionsToCSV,
  analyticsToCSV,
  downloadCSV,
  generateAnalyticsPDF,
  generateSessionPDF,
  downloadPDF,
} from '@/lib/export';
import type { SessionSummary, DashboardStats, SkillBreakdown } from './useAdminDashboard';

interface UseExportReturn {
  isExporting: boolean;
  exportSessionsCSV: (sessions: SessionSummary[], filename?: string) => void;
  exportAnalyticsCSV: (
    stats: DashboardStats,
    skillBreakdown: SkillBreakdown[],
    filename?: string
  ) => void;
  exportAnalyticsPDF: (
    stats: DashboardStats,
    skillBreakdown: SkillBreakdown[],
    recentSessions: SessionSummary[],
    filename?: string
  ) => void;
  exportSessionPDF: (
    session: SessionSummary & { rounds?: Array<{
      roundNumber: number;
      phase: string;
      inputType: string;
      duration: number;
      volumeFlag: boolean;
    }> },
    filename?: string
  ) => void;
}

/**
 * Export Hook
 *
 * Provides functions to export session and analytics data
 * to CSV and PDF formats.
 */
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const exportSessionsCSV = useCallback(
    (sessions: SessionSummary[], filename = 'mediator-sessions') => {
      setIsExporting(true);
      try {
        const csv = sessionsToCSV(sessions);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `${filename}-${timestamp}.csv`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportAnalyticsCSV = useCallback(
    (
      stats: DashboardStats,
      skillBreakdown: SkillBreakdown[],
      filename = 'mediator-analytics'
    ) => {
      setIsExporting(true);
      try {
        const csv = analyticsToCSV(stats, skillBreakdown);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `${filename}-${timestamp}.csv`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportAnalyticsPDF = useCallback(
    (
      stats: DashboardStats,
      skillBreakdown: SkillBreakdown[],
      recentSessions: SessionSummary[],
      filename = 'mediator-report'
    ) => {
      setIsExporting(true);
      try {
        const doc = generateAnalyticsPDF(stats, skillBreakdown, recentSessions, {
          title: 'Mediator Analytics Report',
          subtitle: 'Communication Skills Training Analytics',
        });
        const timestamp = new Date().toISOString().split('T')[0];
        downloadPDF(doc, `${filename}-${timestamp}.pdf`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportSessionPDF = useCallback(
    (
      session: SessionSummary & { rounds?: Array<{
        roundNumber: number;
        phase: string;
        inputType: string;
        duration: number;
        volumeFlag: boolean;
      }> },
      filename?: string
    ) => {
      setIsExporting(true);
      try {
        const doc = generateSessionPDF(session, {
          title: 'Session Report',
        });
        const name = filename || `session-${session.sessionCode}`;
        downloadPDF(doc, `${name}.pdf`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    isExporting,
    exportSessionsCSV,
    exportAnalyticsCSV,
    exportAnalyticsPDF,
    exportSessionPDF,
  };
}
