'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DashboardStats {
  totalSessions: number;
  totalRounds: number;
  avgSessionTime: number;
  totalParticipants: number;
  volumeFlagsTotal: number;
  redosTotal: number;
}

export interface SkillBreakdown {
  skill: string;
  count: number;
  percentage: number;
}

export interface DailyStats {
  date: string;
  session_count: number;
  avg_duration: number;
  total_rounds: number;
  total_volume_flags: number;
}

export interface SessionSummary {
  id: string;
  sessionCode: string;
  skill: string | null;
  templateName: string | null;
  roundsCompleted: number;
  sessionTime: number;
  volumeFlags: number;
  userEmail?: string;
  createdAt: string;
  completedAt: string;
}

export interface AdminAnalytics {
  source: 'mock' | 'supabase';
  stats: DashboardStats;
  skillBreakdown: SkillBreakdown[];
  dailyStats: DailyStats[];
  recentSessions: SessionSummary[];
}

export interface SessionsResponse {
  source: 'mock' | 'supabase';
  sessions: SessionSummary[];
  total: number;
  page: number;
  totalPages: number;
}

interface UseAdminDashboardOptions {
  orgId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface UseAdminDashboardReturn {
  analytics: AdminAnalytics | null;
  sessions: SessionSummary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchSessions: (filters?: {
    skill?: string;
    page?: number;
    limit?: number;
  }) => Promise<SessionsResponse | null>;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

/**
 * Admin Dashboard Data Hook
 *
 * Fetches analytics and session data from the API.
 * Falls back to mock data if Supabase is not configured.
 */
export function useAdminDashboard(
  options: UseAdminDashboardOptions = {}
): UseAdminDashboardReturn {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
  });

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.orgId) params.set('org_id', options.orgId);
      if (options.dateFrom) params.set('date_from', options.dateFrom);
      if (options.dateTo) params.set('date_to', options.dateTo);

      const response = await fetch(`/api/admin/analytics?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setSessions(data.recentSessions || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Admin dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.orgId, options.dateFrom, options.dateTo]);

  const fetchSessions = useCallback(
    async (filters?: { skill?: string; page?: number; limit?: number }) => {
      try {
        const params = new URLSearchParams();
        if (options.orgId) params.set('org_id', options.orgId);
        if (filters?.skill) params.set('skill', filters.skill);
        if (filters?.page) params.set('page', filters.page.toString());
        if (filters?.limit) params.set('limit', filters.limit.toString());

        const response = await fetch(`/api/admin/sessions?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data: SessionsResponse = await response.json();
        setSessions(data.sessions);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });

        return data;
      } catch (err) {
        console.error('Fetch sessions error:', err);
        return null;
      }
    },
    [options.orgId]
  );

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    sessions,
    isLoading,
    error,
    refetch: fetchAnalytics,
    fetchSessions,
    pagination,
  };
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Format date to relative string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}
