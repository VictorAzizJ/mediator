'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { DBTSkill } from '@/types';
import {
  getSessions,
  getSessionDetails,
  getAggregateAnalytics,
  isSupabaseConfigured,
  type DBSession,
  type DBSessionRound,
} from '@/lib/supabase';

interface SessionsTableProps {
  orgId?: string;
}

type FilterState = {
  skill: DBTSkill | 'all';
  dateRange: '7d' | '30d' | '90d' | 'all';
  searchEmail: string;
};

export function SessionsTable({ orgId }: SessionsTableProps) {
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    skill: 'all',
    dateRange: '30d',
    searchEmail: '',
  });
  const [selectedSession, setSelectedSession] = useState<{
    session: DBSession;
    rounds: DBSessionRound[];
  } | null>(null);
  const [aggregateStats, setAggregateStats] = useState<{
    totalSessions: number;
    totalRounds: number;
    avgSessionTime: number;
    skillBreakdown: Record<string, number>;
    volumeFlagTotal: number;
  } | null>(null);

  const pageSize = 20;

  // Fetch sessions with filters
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Calculate date filter
      let startDate: string | undefined;
      const now = new Date();
      if (filters.dateRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (filters.dateRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (filters.dateRange === '90d') {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { sessions: data, total } = await getSessions({
        skill: filters.skill === 'all' ? undefined : filters.skill,
        orgId,
        userEmail: filters.searchEmail || undefined,
        startDate,
        limit: pageSize,
        offset: page * pageSize,
      });

      setSessions(data);
      setTotalCount(total);
      setLoading(false);
    }

    fetchData();
  }, [filters, page, orgId]);

  // Fetch aggregate stats
  useEffect(() => {
    async function fetchAggregates() {
      const stats = await getAggregateAnalytics(orgId);
      setAggregateStats(stats);
    }
    fetchAggregates();
  }, [orgId]);

  // View session details
  const handleViewDetails = async (sessionId: string) => {
    const { session, rounds } = await getSessionDetails(sessionId);
    if (session) {
      setSelectedSession({ session, rounds });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show message if Supabase not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="card text-center py-12">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-400)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Database Not Connected
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-calm-500)' }}>
          Connect Supabase to view real session analytics.
        </p>
        <p className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      {aggregateStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Sessions" value={aggregateStats.totalSessions} />
          <StatCard label="Total Rounds" value={aggregateStats.totalRounds} />
          <StatCard
            label="Avg Duration"
            value={formatDuration(aggregateStats.avgSessionTime)}
          />
          <StatCard label="Volume Alerts" value={aggregateStats.volumeFlagTotal} />
          <StatCard
            label="Top Skill"
            value={
              Object.entries(aggregateStats.skillBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ||
              'N/A'
            }
          />
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Skill Filter */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-calm-500)' }}>
              Skill
            </label>
            <select
              value={filters.skill}
              onChange={(e) => {
                setFilters({ ...filters, skill: e.target.value as FilterState['skill'] });
                setPage(0);
              }}
              className="input text-sm"
            >
              <option value="all">All Skills</option>
              <option value="DEAR MAN">DEAR MAN</option>
              <option value="GIVE">GIVE</option>
              <option value="FAST">FAST</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-calm-500)' }}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => {
                setFilters({ ...filters, dateRange: e.target.value as FilterState['dateRange'] });
                setPage(0);
              }}
              className="input text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Email Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-calm-500)' }}>
              Search by Email
            </label>
            <input
              type="text"
              value={filters.searchEmail}
              onChange={(e) => {
                setFilters({ ...filters, searchEmail: e.target.value });
                setPage(0);
              }}
              placeholder="user@example.com"
              className="input text-sm w-full"
            />
          </div>

          {/* Results count */}
          <div className="ml-auto text-sm" style={{ color: 'var(--color-calm-500)' }}>
            {totalCount} sessions
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-calm-200)' }}>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Skill
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Template
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Rounds
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Duration
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Input
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Alerts
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--color-calm-500)' }}>
                  Date
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center" style={{ color: 'var(--color-calm-400)' }}>
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center" style={{ color: 'var(--color-calm-400)' }}>
                    No sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    style={{ borderBottom: '1px solid var(--color-calm-100)' }}
                    className="hover:bg-[var(--color-calm-50)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <code className="text-sm font-mono" style={{ color: 'var(--color-calm-700)' }}>
                        {session.session_code}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      {session.skill_used ? (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--color-calm-100)',
                            color: 'var(--color-calm-700)',
                          }}
                        >
                          {session.skill_used}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
                          Free-form
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-calm-600)' }}>
                      {session.template_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--foreground)' }}>
                      {session.rounds_completed}/{session.total_rounds}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-calm-600)' }}>
                      {formatDuration(session.session_time_seconds)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {session.voice_rounds > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                          >
                            {session.voice_rounds} voice
                          </span>
                        )}
                        {session.text_rounds > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                          >
                            {session.text_rounds} text
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {session.volume_flags > 0 ? (
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                        >
                          ⚠️ {session.volume_flags}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--color-safe-green)' }}>
                          ✓
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-calm-500)' }}>
                      {formatDate(session.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(session.id)}
                        className="text-sm underline"
                        style={{ color: 'var(--color-calm-600)' }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="flex justify-between items-center p-4 border-t" style={{ borderColor: 'var(--color-calm-200)' }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="btn-secondary text-sm"
            >
              Previous
            </button>
            <span className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
              Page {page + 1} of {Math.ceil(totalCount / pageSize)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * pageSize >= totalCount}
              className="btn-secondary text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession.session}
          rounds={selectedSession.rounds}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}

// Stat card component
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}
    >
      <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
        {label}
      </div>
    </div>
  );
}

// Session detail modal
function SessionDetailModal({
  session,
  rounds,
  onClose,
}: {
  session: DBSession;
  rounds: DBSessionRound[];
  onClose: () => void;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Session {session.session_code}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                {new Date(session.created_at).toLocaleString()}
              </p>
            </div>
            <button onClick={onClose} style={{ color: 'var(--color-calm-400)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Session Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-calm-50)' }}>
              <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {session.skill_used || 'Free-form'}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Skill</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-calm-50)' }}>
              <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {formatDuration(session.session_time_seconds)}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Duration</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-calm-50)' }}>
              <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {session.rounds_completed}/{session.total_rounds}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Rounds</div>
            </div>
          </div>

          {/* Round Details */}
          <h3 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Round-by-Round
          </h3>
          <div className="space-y-2">
            {rounds.length > 0 ? (
              rounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-calm-50)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      R{round.round_number}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'var(--color-calm-200)', color: 'var(--color-calm-700)' }}
                    >
                      {round.phase}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: round.input_type === 'voice' ? '#dbeafe' : '#e0e7ff',
                        color: round.input_type === 'voice' ? '#1d4ed8' : '#4338ca',
                      }}
                    >
                      {round.input_type}
                    </span>
                    {round.volume_flag && <span>⚠️</span>}
                    {round.was_redone && (
                      <span className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                        (redone)
                      </span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                    {formatDuration(round.duration_seconds)} • {round.response_length} words
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
                No round data available
              </p>
            )}
          </div>

          {/* Privacy indicator */}
          <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-sm" style={{ color: '#166534' }}>
                {session.transcript_deleted
                  ? 'Transcript deleted (privacy protected)'
                  : 'Analytics only - no raw transcript stored'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
