import { NextRequest, NextResponse } from 'next/server';
import type { SessionAnalytics, TranscriptEntry } from '@/types';

// Email template for session report
function generateEmailHTML(
  analytics: SessionAnalytics,
  transcript: TranscriptEntry[],
  summaryText?: string
): string {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Build round summary HTML
  const roundsHTML = analytics.rounds
    .map(
      (round, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 12px; font-size: 14px;">Round ${idx + 1}</td>
        <td style="padding: 8px 12px; font-size: 14px;">${round.phase}</td>
        <td style="padding: 8px 12px; font-size: 14px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; background-color: ${
            round.inputType === 'voice' ? '#dbeafe' : '#e0e7ff'
          }; color: ${round.inputType === 'voice' ? '#1d4ed8' : '#4338ca'}; font-size: 12px;">
            ${round.inputType}
          </span>
        </td>
        <td style="padding: 8px 12px; font-size: 14px;">${formatDuration(round.duration)}</td>
        <td style="padding: 8px 12px; font-size: 14px;">${
          round.volumeFlag ? '⚠️ Yes' : '✓ No'
        }</td>
      </tr>
    `
    )
    .join('');

  // Build transcript HTML
  const transcriptHTML = transcript
    .map(
      (entry) => `
      <div style="margin-bottom: 12px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
        <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
          ${entry.participantName} <span style="font-weight: normal; color: #9ca3af; font-size: 12px;">Round ${entry.roundNumber}</span>
        </div>
        <div style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          ${entry.text}
        </div>
      </div>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mediator Session Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #4f46e5; border-radius: 12px; margin-bottom: 16px;"></div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Session Report</h1>
      <p style="margin: 8px 0 0; color: #6b7280;">Your Mediator conversation summary</p>
    </div>

    <!-- Session Info -->
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Skill Practiced</div>
          <div style="font-size: 18px; font-weight: 600; color: #166534;">${
            analytics.skillUsed || 'Free-form'
          }</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Duration</div>
          <div style="font-size: 18px; font-weight: 600; color: #166534;">${formatDuration(
            analytics.sessionTime
          )}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Rounds</div>
          <div style="font-size: 18px; font-weight: 600; color: #166534;">${
            analytics.roundsCompleted
          }/${analytics.totalRounds || 3}</div>
        </div>
      </div>
    </div>

    <!-- Analytics Summary -->
    <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px;">Session Analytics</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Round</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Phase</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Input</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Duration</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Alert</th>
        </tr>
      </thead>
      <tbody>
        ${roundsHTML}
      </tbody>
    </table>

    <!-- Input Type Summary -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      <div style="flex: 1; padding: 12px; background-color: #dbeafe; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 600; color: #1d4ed8;">${
          analytics.inputTypeBreakdown.voice
        }</div>
        <div style="font-size: 12px; color: #1d4ed8;">Voice Rounds</div>
      </div>
      <div style="flex: 1; padding: 12px; background-color: #e0e7ff; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 600; color: #4338ca;">${
          analytics.inputTypeBreakdown.text
        }</div>
        <div style="font-size: 12px; color: #4338ca;">Text Rounds</div>
      </div>
      <div style="flex: 1; padding: 12px; background-color: ${
        analytics.volumeFlags > 0 ? '#fef3c7' : '#dcfce7'
      }; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 600; color: ${
          analytics.volumeFlags > 0 ? '#d97706' : '#16a34a'
        };">${analytics.volumeFlags}</div>
        <div style="font-size: 12px; color: ${
          analytics.volumeFlags > 0 ? '#d97706' : '#16a34a'
        };">Volume Alerts</div>
      </div>
    </div>

    ${
      summaryText
        ? `
    <!-- AI Summary -->
    <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px;">Conversation Summary</h2>
    <div style="padding: 16px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${summaryText}</p>
    </div>
    `
        : ''
    }

    <!-- Transcript -->
    <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px;">Full Transcript</h2>
    ${transcriptHTML}

    <!-- Privacy Notice -->
    <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #b91c1c; font-size: 14px;">Privacy Notice</p>
      <p style="margin: 0; color: #7f1d1d; font-size: 13px;">
        This transcript is auto-deleted from our system after this message. Your analytics summary is retained securely for training insights. We do not use your conversation content to train AI models.
      </p>
    </div>

    <!-- Email Setup Instructions -->
    <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #374151; font-size: 14px;">Keep Mediator emails organized</p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        <strong>Gmail:</strong> Search for "from:notifications@mediator.app" → Click "More" → "Filter messages like these" → "Apply label" → "Mediator"<br><br>
        <strong>Outlook:</strong> Right-click this email → Rules → "Always move messages from..." → Select or create a "Mediator" folder
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Session ${analytics.sessionCode} • ${formatTimestamp(analytics.createdAt)}
      </p>
      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
        Powered by Mediator • DBT-based communication training
      </p>
    </div>
  </div>
</body>
</html>
`;
}

// Plain text version for email clients that don't support HTML
function generateEmailText(
  analytics: SessionAnalytics,
  transcript: TranscriptEntry[],
  summaryText?: string
): string {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  let text = `
MEDIATOR SESSION REPORT
=======================

Session Code: ${analytics.sessionCode}
Date: ${new Date(analytics.createdAt).toLocaleString()}
Skill Practiced: ${analytics.skillUsed || 'Free-form'}
Duration: ${formatDuration(analytics.sessionTime)}
Rounds Completed: ${analytics.roundsCompleted}/${analytics.totalRounds || 3}

SESSION ANALYTICS
-----------------
Voice Rounds: ${analytics.inputTypeBreakdown.voice}
Text Rounds: ${analytics.inputTypeBreakdown.text}
Volume Alerts: ${analytics.volumeFlags}
`;

  if (summaryText) {
    text += `
CONVERSATION SUMMARY
--------------------
${summaryText}
`;
  }

  text += `
FULL TRANSCRIPT
---------------
`;

  transcript.forEach((entry) => {
    text += `
[Round ${entry.roundNumber}] ${entry.participantName}:
${entry.text}
`;
  });

  text += `
---
PRIVACY NOTICE
This transcript is auto-deleted from our system after this message.
Your analytics summary is retained securely for training insights.
We do not use your conversation content to train AI models.

---
Email filtering tips:
Gmail: Search "from:notifications@mediator.app" → More → Filter messages → Apply label
Outlook: Right-click → Rules → Always move messages from...
`;

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, analytics, transcript, summaryText } = body as {
      email: string;
      analytics: SessionAnalytics;
      transcript: TranscriptEntry[];
      summaryText?: string;
    };

    // Validate required fields
    if (!email || !analytics || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: email, analytics, transcript' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'Mediator <onboarding@resend.dev>';

    if (!resendApiKey) {
      console.warn('Resend API key not configured, email not sent');
      return NextResponse.json(
        {
          success: false,
          warning: 'Email service not configured. Please set RESEND_API_KEY in environment variables.',
          mockSent: true
        },
        { status: 200 }
      );
    }

    // Generate email content
    const htmlContent = generateEmailHTML(analytics, transcript, summaryText);
    const textContent = generateEmailText(analytics, transcript, summaryText);

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [email],
        subject: `Mediator Session Report - ${analytics.skillUsed || 'Conversation'} (${analytics.sessionCode})`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      messageId: result.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
