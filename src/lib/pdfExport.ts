'use client';

import { jsPDF } from 'jspdf';
import type { ConversationSummary, Participant, SpeakingTimeRecord } from '@/types';

interface ExportOptions {
  summary: ConversationSummary;
  participants: Participant[];
  speakingTime?: SpeakingTimeRecord[];
  currentUserId?: string;
  includePrivateNotes?: boolean;
}

export function exportSummaryToPDF({
  summary,
  participants,
  speakingTime = [],
  currentUserId,
  includePrivateNotes = true,
}: ExportOptions): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  // Helper to add text with word wrap
  const addWrappedText = (text: string, fontSize: number, isBold = false): number => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    return lines.length * (fontSize * 0.4);
  };

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number): void => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Conversation Summary', margin, yPos);
  yPos += 15;

  // Date
  const date = new Date(summary.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(date, margin, yPos);
  yPos += 10;

  // Participants
  const participantNames = participants.map((p) => p.name).join(' & ');
  doc.text(`Participants: ${participantNames}`, margin, yPos);
  yPos += 15;

  // Speaking Time section (if available)
  if (speakingTime.length > 0) {
    const totalSeconds = speakingTime.reduce((sum, r) => sum + r.totalSeconds, 0);

    if (totalSeconds > 0) {
      checkNewPage(40);
      doc.setTextColor(60, 60, 60);
      yPos += addWrappedText('Speaking Time', 14, true);
      yPos += 5;

      speakingTime.forEach((record) => {
        const participant = participants.find((p) => p.id === record.participantId);
        if (participant) {
          const percentage = Math.round((record.totalSeconds / totalSeconds) * 100);
          const minutes = Math.floor(record.totalSeconds / 60);
          const seconds = record.totalSeconds % 60;
          const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`${participant.name}: ${percentage}% (${timeStr}, ${record.turnCount} turns)`, margin, yPos);
          yPos += 6;
        }
      });
      yPos += 10;
    }
  }

  // Topics Discussed
  if (summary.topicsDiscussed.length > 0) {
    checkNewPage(30);
    doc.setTextColor(60, 60, 60);
    yPos += addWrappedText('Topics Discussed', 14, true);
    yPos += 5;

    summary.topicsDiscussed.forEach((topic) => {
      checkNewPage(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const height = addWrappedText(`• ${topic}`, 11);
      yPos += height + 2;
    });
    yPos += 10;
  }

  // What Was Shared
  if (summary.participantExpressions.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('What Was Shared', 14, true);
    yPos += 5;

    summary.participantExpressions.forEach((expr) => {
      checkNewPage(20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(expr.participantName, margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const height = addWrappedText(expr.summary, 11);
      yPos += height + 8;
    });
    yPos += 5;
  }

  // Agreements Made
  if (summary.agreements.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('Agreements Made', 14, true);
    yPos += 5;

    summary.agreements.forEach((agreement) => {
      checkNewPage(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const height = addWrappedText(`✓ ${agreement}`, 11);
      yPos += height + 2;
    });
    yPos += 10;
  }

  // Open Questions
  if (summary.openQuestions.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('To Revisit Later', 14, true);
    yPos += 5;

    summary.openQuestions.forEach((question) => {
      checkNewPage(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const height = addWrappedText(`? ${question}`, 11);
      yPos += height + 2;
    });
    yPos += 10;
  }

  // Private Notes (only for current user)
  if (includePrivateNotes && currentUserId) {
    const userNotes = summary.privateNotes.filter(
      (n) => n.participantId === currentUserId
    );

    if (userNotes.length > 0) {
      checkNewPage(30);
      yPos += addWrappedText('Your Private Notes', 14, true);
      yPos += 5;

      userNotes.forEach((note) => {
        checkNewPage(10);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        const height = addWrappedText(`"${note.note}"`, 11);
        yPos += height + 4;
      });
    }
  }

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generated by Mediator • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `conversation-summary-${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);
}

// Export for B2B: Manager/HR version with all participants' data
export function exportManagerSummaryToPDF({
  summary,
  participants,
  speakingTime = [],
  sessionId,
}: ExportOptions & { sessionId?: string }): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const addWrappedText = (text: string, fontSize: number, isBold = false): number => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    return lines.length * (fontSize * 0.4);
  };

  const checkNewPage = (requiredSpace: number): void => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header with branding
  doc.setFillColor(74, 85, 104);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Mediator', margin, 20);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Conversation Report', margin, 32);

  if (sessionId) {
    doc.setFontSize(10);
    doc.text(`Session: ${sessionId.substring(0, 8)}...`, pageWidth - margin - 40, 20);
  }

  yPos = 60;

  // Meta information
  doc.setTextColor(60, 60, 60);
  const date = new Date(summary.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(11);
  doc.text(`Date: ${date}`, margin, yPos);
  yPos += 7;

  const participantNames = participants.map((p) => p.name).join(', ');
  doc.text(`Participants: ${participantNames}`, margin, yPos);
  yPos += 15;

  // Speaking Time Analysis (emphasized for B2B)
  if (speakingTime.length > 0) {
    const totalSeconds = speakingTime.reduce((sum, r) => sum + r.totalSeconds, 0);

    if (totalSeconds > 0) {
      checkNewPage(50);

      doc.setFillColor(240, 245, 250);
      doc.roundedRect(margin, yPos - 5, contentWidth, 55, 3, 3, 'F');

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Speaking Time Analysis', margin + 5, yPos + 5);
      yPos += 15;

      speakingTime.forEach((record) => {
        const participant = participants.find((p) => p.id === record.participantId);
        if (participant) {
          const percentage = Math.round((record.totalSeconds / totalSeconds) * 100);
          const minutes = Math.floor(record.totalSeconds / 60);
          const seconds = record.totalSeconds % 60;
          const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`${participant.name}:`, margin + 5, yPos);

          // Draw progress bar
          const barWidth = 80;
          const barHeight = 6;
          const barX = margin + 60;
          doc.setFillColor(200, 200, 200);
          doc.roundedRect(barX, yPos - 5, barWidth, barHeight, 2, 2, 'F');
          doc.setFillColor(74, 85, 104);
          doc.roundedRect(barX, yPos - 5, (barWidth * percentage) / 100, barHeight, 2, 2, 'F');

          doc.text(`${percentage}% (${timeStr})`, barX + barWidth + 5, yPos);
          yPos += 12;
        }
      });
      yPos += 15;
    }
  }

  // Topics
  if (summary.topicsDiscussed.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('Topics Discussed', 14, true);
    yPos += 5;

    summary.topicsDiscussed.forEach((topic) => {
      checkNewPage(10);
      const height = addWrappedText(`• ${topic}`, 11);
      yPos += height + 2;
    });
    yPos += 10;
  }

  // Participant Summaries
  if (summary.participantExpressions.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('Individual Contributions', 14, true);
    yPos += 5;

    summary.participantExpressions.forEach((expr) => {
      checkNewPage(25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(expr.participantName, margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const height = addWrappedText(expr.summary, 11);
      yPos += height + 8;
    });
    yPos += 5;
  }

  // Agreements
  if (summary.agreements.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('Agreements & Action Items', 14, true);
    yPos += 5;

    summary.agreements.forEach((agreement, index) => {
      checkNewPage(10);
      const height = addWrappedText(`${index + 1}. ${agreement}`, 11);
      yPos += height + 2;
    });
    yPos += 10;
  }

  // Open Questions
  if (summary.openQuestions.length > 0) {
    checkNewPage(30);
    yPos += addWrappedText('Follow-up Items', 14, true);
    yPos += 5;

    summary.openQuestions.forEach((question) => {
      checkNewPage(10);
      const height = addWrappedText(`• ${question}`, 11);
      yPos += height + 2;
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Confidential • Generated by Mediator for Business • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `mediator-report-${dateStr}.pdf`;
  doc.save(filename);
}
