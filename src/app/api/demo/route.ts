import { NextRequest, NextResponse } from 'next/server';
import {
  demoSessions,
  demoStats,
  demoSkillBreakdown,
  demoDailyStats,
  demoRounds,
  demoTranscripts,
  demoUsers,
  getDemoConversationFlow,
} from '@/lib/demoData';

/**
 * GET /api/demo
 *
 * Get demo data for quick platform exploration.
 * Query params:
 *   - type: 'analytics' | 'sessions' | 'session' | 'user' | 'conversation'
 *   - sessionId: For single session details
 *   - skill: For conversation flow
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'analytics';
  const sessionId = searchParams.get('sessionId');
  const skill = searchParams.get('skill') as 'DEAR MAN' | 'GIVE' | 'FAST' | null;

  switch (type) {
    case 'analytics':
      return NextResponse.json({
        source: 'demo',
        stats: demoStats,
        skillBreakdown: demoSkillBreakdown,
        dailyStats: demoDailyStats,
        recentSessions: demoSessions,
      });

    case 'sessions':
      return NextResponse.json({
        source: 'demo',
        sessions: demoSessions,
        total: demoSessions.length,
        page: 1,
        totalPages: 1,
      });

    case 'session':
      if (!sessionId) {
        return NextResponse.json(
          { error: 'sessionId required' },
          { status: 400 }
        );
      }
      const session = demoSessions.find((s) => s.id === sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        source: 'demo',
        session,
        rounds: demoRounds[sessionId] || [],
        transcript: demoTranscripts[sessionId] || [],
      });

    case 'user':
      return NextResponse.json({
        source: 'demo',
        user: demoUsers[0],
        allUsers: demoUsers,
      });

    case 'conversation':
      const selectedSkill = skill || 'DEAR MAN';
      return NextResponse.json({
        source: 'demo',
        skill: selectedSkill,
        flow: getDemoConversationFlow(selectedSkill),
      });

    default:
      return NextResponse.json(
        { error: 'Invalid type. Use: analytics, sessions, session, user, or conversation' },
        { status: 400 }
      );
  }
}

/**
 * POST /api/demo
 *
 * Enable or disable demo mode
 *
 * Body: { action: 'enable' | 'disable' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'enable') {
      return NextResponse.json({
        success: true,
        message: 'Demo mode enabled',
        demoCode: 'MEDIATOR2025',
        instructions: [
          'Use the demo code MEDIATOR2025 to access the platform',
          'Demo data will be shown in the dashboard',
          'You can explore all features without affecting real data',
        ],
      });
    }

    if (action === 'disable') {
      return NextResponse.json({
        success: true,
        message: 'Demo mode disabled',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: enable or disable' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
