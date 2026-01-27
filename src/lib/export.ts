/**
 * Export Utilities
 *
 * Functions for exporting session data to CSV and PDF formats.
 */

import jsPDF from 'jspdf';
import type { SessionSummary, DashboardStats, SkillBreakdown } from '@/hooks/useAdminDashboard';

// ============================================
// CSV EXPORT
// ============================================

/**
 * Convert sessions array to CSV string
 */
export function sessionsToCSV(sessions: SessionSummary[]): string {
  const headers = [
    'Session Code',
    'Skill',
    'Template',
    'Rounds Completed',
    'Duration (seconds)',
    'Volume Flags',
    'User Email',
    'Created At',
    'Completed At',
  ];

  const rows = sessions.map((s) => [
    s.sessionCode,
    s.skill || 'Free-form',
    s.templateName || '',
    s.roundsCompleted.toString(),
    s.sessionTime.toString(),
    s.volumeFlags.toString(),
    s.userEmail || '',
    s.createdAt,
    s.completedAt,
  ]);

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Convert analytics stats to CSV string
 */
export function analyticsToCSV(
  stats: DashboardStats,
  skillBreakdown: SkillBreakdown[]
): string {
  const sections: string[] = [];

  // Summary stats section
  sections.push('SUMMARY STATISTICS');
  sections.push('Metric,Value');
  sections.push(`Total Sessions,${stats.totalSessions}`);
  sections.push(`Total Rounds,${stats.totalRounds}`);
  sections.push(`Average Session Time (seconds),${stats.avgSessionTime}`);
  sections.push(`Total Participants,${stats.totalParticipants}`);
  sections.push(`Total Volume Flags,${stats.volumeFlagsTotal}`);
  sections.push(`Total Redos,${stats.redosTotal}`);

  sections.push('');

  // Skill breakdown section
  sections.push('SKILL BREAKDOWN');
  sections.push('Skill,Sessions,Percentage');
  skillBreakdown.forEach((s) => {
    sections.push(`${s.skill},${s.count},${s.percentage}%`);
  });

  return sections.join('\n');
}

/**
 * Download string as CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// PDF EXPORT
// ============================================

interface PDFReportOptions {
  title?: string;
  subtitle?: string;
  generatedAt?: Date;
  includeCharts?: boolean;
}

/**
 * Generate PDF report from analytics data
 */
export function generateAnalyticsPDF(
  stats: DashboardStats,
  skillBreakdown: SkillBreakdown[],
  recentSessions: SessionSummary[],
  options: PDFReportOptions = {}
): jsPDF {
  const {
    title = 'Mediator Analytics Report',
    subtitle = 'Session Analytics Summary',
    generatedAt = new Date(),
  } = options;

  const doc = new jsPDF();
  let yPos = 20;

  // Helper functions
  const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.text(text, 20, yPos);
    yPos += size * 0.5 + 2;
  };

  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
  };

  const checkPageBreak = (needed: number) => {
    if (yPos + needed > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 20, 35);

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Generated timestamp
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 20, yPos);
  yPos += 10;
  doc.setTextColor(0, 0, 0);

  // Summary Statistics
  addText('Summary Statistics', 16, 'bold');
  addLine();

  const statRows = [
    ['Total Sessions', stats.totalSessions.toString()],
    ['Total Rounds Completed', stats.totalRounds.toString()],
    ['Average Session Duration', formatDuration(stats.avgSessionTime)],
    ['Total Participants', stats.totalParticipants.toString()],
    ['Volume Alerts', stats.volumeFlagsTotal.toString()],
    ['Session Redos', stats.redosTotal.toString()],
  ];

  doc.setFontSize(11);
  statRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 120, yPos);
    yPos += 7;
  });

  yPos += 10;
  checkPageBreak(60);

  // Skill Breakdown
  addText('Skill Usage Breakdown', 16, 'bold');
  addLine();

  if (skillBreakdown.length > 0) {
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 4, 170, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Skill', 25, yPos);
    doc.text('Sessions', 100, yPos);
    doc.text('Percentage', 140, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    skillBreakdown.forEach((skill) => {
      doc.text(skill.skill, 25, yPos);
      doc.text(skill.count.toString(), 100, yPos);
      doc.text(`${skill.percentage}%`, 140, yPos);

      // Progress bar
      const barWidth = 30;
      const fillWidth = (skill.percentage / 100) * barWidth;
      doc.setFillColor(200, 200, 200);
      doc.rect(160, yPos - 3, barWidth, 4, 'F');
      doc.setFillColor(99, 102, 241);
      doc.rect(160, yPos - 3, fillWidth, 4, 'F');

      yPos += 8;
    });
  } else {
    doc.setFontSize(11);
    doc.text('No skill data available', 25, yPos);
    yPos += 10;
  }

  yPos += 10;
  checkPageBreak(80);

  // Recent Sessions
  addText('Recent Sessions', 16, 'bold');
  addLine();

  if (recentSessions.length > 0) {
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 4, 170, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Code', 25, yPos);
    doc.text('Skill', 50, yPos);
    doc.text('Rounds', 95, yPos);
    doc.text('Duration', 120, yPos);
    doc.text('Flags', 150, yPos);
    doc.text('Date', 170, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    recentSessions.slice(0, 15).forEach((session) => {
      checkPageBreak(10);
      doc.text(session.sessionCode, 25, yPos);
      doc.text((session.skill || 'Free').substring(0, 12), 50, yPos);
      doc.text(session.roundsCompleted.toString(), 95, yPos);
      doc.text(formatDuration(session.sessionTime), 120, yPos);
      doc.text(session.volumeFlags.toString(), 150, yPos);
      doc.text(new Date(session.createdAt).toLocaleDateString(), 170, yPos);
      yPos += 7;
    });

    if (recentSessions.length > 15) {
      yPos += 3;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`... and ${recentSessions.length - 15} more sessions`, 25, yPos);
      doc.setTextColor(0, 0, 0);
    }
  } else {
    doc.setFontSize(11);
    doc.text('No session data available', 25, yPos);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
    doc.text('Mediator - Communication Skills Training', 105, 295, { align: 'center' });
  }

  return doc;
}

/**
 * Generate PDF for a single session
 */
export function generateSessionPDF(
  session: SessionSummary & { rounds?: Array<{
    roundNumber: number;
    phase: string;
    inputType: string;
    duration: number;
    volumeFlag: boolean;
  }> },
  options: PDFReportOptions = {}
): jsPDF {
  const {
    title = 'Session Report',
    generatedAt = new Date(),
  } = options;

  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 22);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Session: ${session.sessionCode}`, 20, 30);

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // Session Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Session Details', 20, yPos);
  yPos += 10;

  const details = [
    ['Skill Practiced', session.skill || 'Free-form'],
    ['Template', session.templateName || 'N/A'],
    ['Rounds Completed', session.roundsCompleted.toString()],
    ['Total Duration', formatDuration(session.sessionTime)],
    ['Volume Alerts', session.volumeFlags.toString()],
    ['Started', new Date(session.createdAt).toLocaleString()],
    ['Completed', new Date(session.completedAt).toLocaleString()],
  ];

  doc.setFontSize(11);
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label + ':', 25, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 80, yPos);
    yPos += 8;
  });

  // Rounds breakdown
  if (session.rounds && session.rounds.length > 0) {
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Round Breakdown', 20, yPos);
    yPos += 10;

    session.rounds.forEach((round) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Round ${round.roundNumber}`, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${round.phase} | ${round.inputType} | ${formatDuration(round.duration)}`, 60, yPos);
      if (round.volumeFlag) {
        doc.setTextColor(220, 38, 38);
        doc.text('Volume Alert', 150, yPos);
        doc.setTextColor(0, 0, 0);
      }
      yPos += 8;
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 20, 285);
  doc.text('Mediator - Communication Skills Training', 105, 290, { align: 'center' });

  return doc;
}

/**
 * Download PDF document
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

// Helper function
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}
