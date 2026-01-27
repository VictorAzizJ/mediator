'use client';

import { useState, useCallback } from 'react';
import type { SessionAnalytics, TranscriptEntry } from '@/types';

interface EmailReportState {
  sending: boolean;
  sent: boolean;
  error: string | null;
}

export function useEmailReport() {
  const [state, setState] = useState<EmailReportState>({
    sending: false,
    sent: false,
    error: null,
  });

  const sendReport = useCallback(
    async (
      email: string,
      analytics: SessionAnalytics,
      transcript: TranscriptEntry[],
      summaryText?: string
    ): Promise<boolean> => {
      setState({ sending: true, sent: false, error: null });

      try {
        const response = await fetch('/api/email/send-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            analytics,
            transcript,
            summaryText,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email');
        }

        // Handle warning case (email service not configured)
        if (data.warning) {
          console.warn(data.warning);
          setState({ sending: false, sent: true, error: null });
          return true; // Still consider it "successful" for demo purposes
        }

        setState({ sending: false, sent: true, error: null });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setState({ sending: false, sent: false, error: message });
        return false;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ sending: false, sent: false, error: null });
  }, []);

  return {
    ...state,
    sendReport,
    reset,
  };
}

// Utility to format transcript for email
export function formatTranscriptForEmail(
  transcript: TranscriptEntry[]
): string {
  return transcript
    .map(
      (entry) =>
        `[Round ${entry.roundNumber}] ${entry.participantName}:\n${entry.text}`
    )
    .join('\n\n');
}

// Utility to build summary text from conversation summary
export function buildSummaryText(summary: {
  topicsDiscussed: string[];
  agreements: string[];
  openQuestions: string[];
}): string {
  let text = '';

  if (summary.topicsDiscussed.length > 0) {
    text += `Topics discussed: ${summary.topicsDiscussed.join(', ')}. `;
  }

  if (summary.agreements.length > 0) {
    text += `Agreements made: ${summary.agreements.join(', ')}. `;
  }

  if (summary.openQuestions.length > 0) {
    text += `Items to revisit: ${summary.openQuestions.join(', ')}.`;
  }

  return text.trim();
}
