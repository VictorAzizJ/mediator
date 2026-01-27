import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/sessions
 *
 * Fetch sessions list for admin dashboard with filtering and pagination
 * Query params:
 *   - org_id: Filter by organization
 *   - user_email: Filter by user
 *   - skill: Filter by skill used
 *   - date_from, date_to: Date range
 *   - page: Page number (1-indexed)
 *   - limit: Items per page (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get('org_id');
  const userEmail = searchParams.get('user_email');
  const skill = searchParams.get('skill');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return mock data if Supabase not configured
    return NextResponse.json({
      source: 'mock',
      sessions: [
        {
          id: 'mock-1',
          sessionCode: 'DEMO01',
          skill: 'DEAR MAN',
          templateName: 'Technical to Non-Technical Team Meeting',
          roundsCompleted: 3,
          sessionTime: 540,
          volumeFlags: 0,
          userEmail: 'demo@example.com',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: 'mock-2',
          sessionCode: 'DEMO02',
          skill: 'GIVE',
          templateName: 'Client Relationship Repair',
          roundsCompleted: 3,
          sessionTime: 480,
          volumeFlags: 1,
          userEmail: 'demo@example.com',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    if (skill) {
      query = query.eq('skill_used', skill);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const sessions = data?.map((s) => ({
      id: s.id,
      sessionCode: s.session_code,
      skill: s.skill_used,
      templateName: s.template_name,
      roundsCompleted: s.rounds_completed,
      totalRounds: s.total_rounds,
      sessionTime: s.session_time_seconds,
      volumeFlags: s.volume_flags,
      redos: s.redos,
      voiceRounds: s.voice_rounds,
      textRounds: s.text_rounds,
      userEmail: s.user_email,
      orgId: s.org_id,
      createdAt: s.created_at,
      completedAt: s.completed_at,
    })) || [];

    return NextResponse.json({
      source: 'supabase',
      sessions,
      total: count || 0,
      page,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error('Admin sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sessions/[id]
 *
 * Fetch detailed session with rounds
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get session with rounds
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    const { data: rounds, error: roundsError } = await supabase
      .from('session_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number', { ascending: true });

    if (roundsError) throw roundsError;

    return NextResponse.json({
      session: {
        id: session.id,
        sessionCode: session.session_code,
        skill: session.skill_used,
        templateId: session.template_id,
        templateName: session.template_name,
        roundsCompleted: session.rounds_completed,
        totalRounds: session.total_rounds,
        sessionTime: session.session_time_seconds,
        volumeFlags: session.volume_flags,
        redos: session.redos,
        voiceRounds: session.voice_rounds,
        textRounds: session.text_rounds,
        userEmail: session.user_email,
        orgId: session.org_id,
        createdAt: session.created_at,
        completedAt: session.completed_at,
      },
      rounds: rounds?.map((r) => ({
        id: r.id,
        roundNumber: r.round_number,
        phase: r.phase,
        inputType: r.input_type,
        responseLength: r.response_length,
        volumeFlag: r.volume_flag,
        duration: r.duration_seconds,
        wasRedone: r.was_redone,
        createdAt: r.created_at,
      })) || [],
    });
  } catch (error) {
    console.error('Session detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    );
  }
}
