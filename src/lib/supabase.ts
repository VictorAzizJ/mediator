import { createClient } from '@supabase/supabase-js';
import type { SessionAnalytics, DBTSkill } from '@/types';

// Supabase client for client-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create client only if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ============================================
// DATABASE TYPES
// ============================================

export interface DBSession {
  id: string;
  session_code: string;
  created_at: string;
  completed_at: string | null;
  skill_used: DBTSkill | null;
  template_id: string | null;
  template_name: string | null;
  rounds_completed: number;
  total_rounds: number;
  session_time_seconds: number;
  volume_flags: number;
  redos: number;
  voice_rounds: number;
  text_rounds: number;
  participant_count: number;
  user_email: string | null;
  org_id: string | null;
  transcript_deleted: boolean;
  transcript_delete_at: string | null;
}

export interface DBSessionRound {
  id: string;
  session_id: string;
  round_number: number;
  phase: string;
  input_type: 'voice' | 'text';
  response_length: number;
  volume_flag: boolean;
  duration_seconds: number;
  was_redone: boolean;
  created_at: string;
}

export interface DBTranscript {
  id: string;
  session_id: string;
  content: string; // Encrypted or plain text
  created_at: string;
  delete_at: string; // 24 hours after creation
}

// ============================================
// SESSION STORAGE FUNCTIONS
// ============================================

/**
 * Save session analytics to database
 * Note: Transcript is stored separately and auto-deleted after 24 hours
 */
export async function saveSessionAnalytics(
  analytics: SessionAnalytics,
  userEmail?: string,
  orgId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping database save');
    return { success: true }; // Graceful degradation
  }

  try {
    // Insert main session record
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        id: analytics.sessionId,
        session_code: analytics.sessionCode,
        created_at: new Date(analytics.createdAt).toISOString(),
        completed_at: analytics.completedAt
          ? new Date(analytics.completedAt).toISOString()
          : null,
        skill_used: analytics.skillUsed,
        template_id: analytics.templateId,
        template_name: analytics.templateName,
        rounds_completed: analytics.roundsCompleted,
        total_rounds: analytics.totalRounds,
        session_time_seconds: analytics.sessionTime,
        volume_flags: analytics.volumeFlags,
        redos: analytics.redos,
        voice_rounds: analytics.inputTypeBreakdown.voice,
        text_rounds: analytics.inputTypeBreakdown.text,
        participant_count: analytics.participantCount,
        user_email: userEmail || null,
        org_id: orgId || null,
        transcript_deleted: false,
        transcript_delete_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error saving session:', sessionError);
      return { success: false, error: sessionError.message };
    }

    // Insert round records
    if (analytics.rounds.length > 0) {
      const roundRecords = analytics.rounds.map((round) => ({
        session_id: analytics.sessionId,
        round_number: round.round,
        phase: round.phase,
        input_type: round.inputType,
        response_length: round.responseLength,
        volume_flag: round.volumeFlag,
        duration_seconds: round.duration,
        was_redone: round.wasRedone,
        created_at: new Date(round.startTime).toISOString(),
      }));

      const { error: roundsError } = await supabase
        .from('session_rounds')
        .insert(roundRecords);

      if (roundsError) {
        console.error('Error saving rounds:', roundsError);
        // Don't fail the whole operation for round errors
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving session:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Save transcript temporarily (auto-deleted after 24 hours)
 */
export async function saveTranscript(
  sessionId: string,
  transcript: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping transcript save');
    return { success: true };
  }

  try {
    const deleteAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error } = await supabase.from('transcripts').insert({
      session_id: sessionId,
      content: transcript,
      delete_at: deleteAt.toISOString(),
    });

    if (error) {
      console.error('Error saving transcript:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving transcript:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Delete transcript for a session (called after email is sent)
 */
export async function deleteTranscript(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('transcripts')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting transcript:', error);
      return { success: false, error: error.message };
    }

    // Mark session as transcript deleted
    await supabase
      .from('sessions')
      .update({ transcript_deleted: true })
      .eq('id', sessionId);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting transcript:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Get sessions for admin dashboard with filtering
 */
export async function getSessions(filters?: {
  skill?: DBTSkill;
  orgId?: string;
  userEmail?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ sessions: DBSession[]; total: number; error?: string }> {
  if (!supabase) {
    return { sessions: [], total: 0 };
  }

  try {
    let query = supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.skill) {
      query = query.eq('skill_used', filters.skill);
    }
    if (filters?.orgId) {
      query = query.eq('org_id', filters.orgId);
    }
    if (filters?.userEmail) {
      query = query.eq('user_email', filters.userEmail);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return { sessions: [], total: 0, error: error.message };
    }

    return { sessions: data || [], total: count || 0 };
  } catch (error) {
    console.error('Unexpected error fetching sessions:', error);
    return { sessions: [], total: 0, error: 'Unexpected error' };
  }
}

/**
 * Get session details including rounds
 */
export async function getSessionDetails(
  sessionId: string
): Promise<{ session: DBSession | null; rounds: DBSessionRound[]; error?: string }> {
  if (!supabase) {
    return { session: null, rounds: [] };
  }

  try {
    const [sessionResult, roundsResult] = await Promise.all([
      supabase.from('sessions').select('*').eq('id', sessionId).single(),
      supabase
        .from('session_rounds')
        .select('*')
        .eq('session_id', sessionId)
        .order('round_number'),
    ]);

    if (sessionResult.error) {
      return { session: null, rounds: [], error: sessionResult.error.message };
    }

    return {
      session: sessionResult.data,
      rounds: roundsResult.data || [],
    };
  } catch (error) {
    console.error('Unexpected error fetching session details:', error);
    return { session: null, rounds: [], error: 'Unexpected error' };
  }
}

/**
 * Get aggregate analytics for admin dashboard
 */
export async function getAggregateAnalytics(
  orgId?: string
): Promise<{
  totalSessions: number;
  totalRounds: number;
  avgSessionTime: number;
  skillBreakdown: Record<string, number>;
  volumeFlagTotal: number;
  error?: string;
}> {
  if (!supabase) {
    return {
      totalSessions: 0,
      totalRounds: 0,
      avgSessionTime: 0,
      skillBreakdown: {},
      volumeFlagTotal: 0,
    };
  }

  try {
    let query = supabase.from('sessions').select('*');

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        totalSessions: 0,
        totalRounds: 0,
        avgSessionTime: 0,
        skillBreakdown: {},
        volumeFlagTotal: 0,
        error: error.message,
      };
    }

    const sessions = data || [];
    const totalSessions = sessions.length;
    const totalRounds = sessions.reduce((sum, s) => sum + s.rounds_completed, 0);
    const avgSessionTime =
      totalSessions > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.session_time_seconds, 0) / totalSessions)
        : 0;
    const volumeFlagTotal = sessions.reduce((sum, s) => sum + s.volume_flags, 0);

    // Skill breakdown
    const skillBreakdown: Record<string, number> = {};
    sessions.forEach((s) => {
      const skill = s.skill_used || 'Free-form';
      skillBreakdown[skill] = (skillBreakdown[skill] || 0) + 1;
    });

    return {
      totalSessions,
      totalRounds,
      avgSessionTime,
      skillBreakdown,
      volumeFlagTotal,
    };
  } catch (error) {
    console.error('Unexpected error getting analytics:', error);
    return {
      totalSessions: 0,
      totalRounds: 0,
      avgSessionTime: 0,
      skillBreakdown: {},
      volumeFlagTotal: 0,
      error: 'Unexpected error',
    };
  }
}
