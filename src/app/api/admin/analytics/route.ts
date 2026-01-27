import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/analytics
 *
 * Fetch aggregate analytics for the admin dashboard
 * Query params: ?org_id=xxx&date_from=xxx&date_to=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get('org_id');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return mock data if Supabase not configured
    return NextResponse.json({
      source: 'mock',
      stats: {
        totalSessions: 247,
        totalRounds: 712,
        avgSessionTime: 420,
        totalParticipants: 42,
        volumeFlagsTotal: 23,
        redosTotal: 8,
      },
      skillBreakdown: [
        { skill: 'DEAR MAN', count: 120, percentage: 48.6 },
        { skill: 'GIVE', count: 75, percentage: 30.4 },
        { skill: 'FAST', count: 52, percentage: 21.0 },
      ],
      dailyStats: [],
      recentSessions: [],
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Build base query for sessions
    let sessionsQuery = supabase
      .from('sessions')
      .select('*')
      .not('completed_at', 'is', null);

    if (orgId) {
      sessionsQuery = sessionsQuery.eq('org_id', orgId);
    }

    if (dateFrom) {
      sessionsQuery = sessionsQuery.gte('created_at', dateFrom);
    }

    if (dateTo) {
      sessionsQuery = sessionsQuery.lte('created_at', dateTo);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) throw sessionsError;

    // Calculate aggregate stats
    const stats = {
      totalSessions: sessions?.length || 0,
      totalRounds: sessions?.reduce((sum, s) => sum + (s.rounds_completed || 0), 0) || 0,
      avgSessionTime: sessions?.length
        ? Math.round(
            sessions.reduce((sum, s) => sum + (s.session_time_seconds || 0), 0) / sessions.length
          )
        : 0,
      totalParticipants: new Set(sessions?.map((s) => s.user_email).filter(Boolean)).size,
      volumeFlagsTotal: sessions?.reduce((sum, s) => sum + (s.volume_flags || 0), 0) || 0,
      redosTotal: sessions?.reduce((sum, s) => sum + (s.redos || 0), 0) || 0,
    };

    // Calculate skill breakdown
    const skillCounts: Record<string, number> = {};
    sessions?.forEach((s) => {
      const skill = s.skill_used || 'Free-form';
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    const skillBreakdown = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: stats.totalSessions > 0 ? Math.round((count / stats.totalSessions) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Get daily stats view if available
    const { data: dailyStats } = await supabase
      .from('daily_session_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    // Get recent sessions
    const { data: recentSessions } = await supabase
      .from('sessions')
      .select('*')
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      source: 'supabase',
      stats,
      skillBreakdown,
      dailyStats: dailyStats || [],
      recentSessions: recentSessions?.map((s) => ({
        id: s.id,
        sessionCode: s.session_code,
        skill: s.skill_used,
        templateName: s.template_name,
        roundsCompleted: s.rounds_completed,
        sessionTime: s.session_time_seconds,
        volumeFlags: s.volume_flags,
        createdAt: s.created_at,
        completedAt: s.completed_at,
      })) || [],
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
