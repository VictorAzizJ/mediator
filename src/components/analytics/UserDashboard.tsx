'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type {
  AnalyticsDashboardData,
  ConversationMetrics,
  ParticipantMetrics,
} from '@/types';
import { HealthScoreCard } from './HealthScoreCard';
import { InsightsPanel } from './InsightsPanel';
import { TrendChart, TrendSparkline } from './TrendChart';
import { formatDuration, getScoreColor, calculateTrend } from '@/lib/analytics';

interface UserDashboardProps {
  data: AnalyticsDashboardData;
  userName?: string;
}

export function UserDashboard({ data, userName }: UserDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  const trend = calculateTrend(data.trends.map((t) => t.score));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {userName ? `${userName}'s` : 'Your'} Communication Insights
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-calm-500)' }}>
            Track your conversation health over time
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-calm-50)' }}>
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{
                backgroundColor: selectedPeriod === period ? 'white' : 'transparent',
                color: selectedPeriod === period ? 'var(--foreground)' : 'var(--color-calm-500)',
                boxShadow: selectedPeriod === period ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {period === 'week' ? '7 days' : period === 'month' ? '30 days' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="lg:col-span-1">
          <HealthScoreCard
            score={data.healthScore}
            trend={trend}
            trendPercentage={
              data.trends.length >= 2
                ? Math.round(
                    ((data.trends[data.trends.length - 1].score - data.trends[0].score) /
                      data.trends[0].score) *
                      100
                  )
                : undefined
            }
          />
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-2">
          <TrendChart
            data={data.trends}
            title="Health Score Over Time"
            height={250}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Conversations"
          value={data.recentSessions.length}
          subtext="this period"
        />
        <StatCard
          label="Avg Duration"
          value={formatDuration(
            Math.round(
              data.recentSessions.reduce((a, b) => a + b.duration, 0) /
                (data.recentSessions.length || 1)
            )
          )}
          subtext="per session"
        />
        <StatCard
          label="Completion Rate"
          value={`${Math.round(
            (data.recentSessions.filter((s) => s.endReason === 'completed').length /
              (data.recentSessions.length || 1)) *
              100
          )}%`}
          subtext="finished fully"
        />
        <StatCard
          label="Speaking Balance"
          value={`${Math.round(
            data.recentSessions.reduce((a, b) => a + b.speakingBalance, 0) /
              (data.recentSessions.length || 1) *
              100
          )}%`}
          subtext="your share"
        />
      </div>

      {/* Insights */}
      <InsightsPanel insights={data.insights} title="Personalized Insights" />

      {/* Recent Sessions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Recent Conversations
        </h3>
        {data.recentSessions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
            No conversations yet. Start one to see your history.
          </p>
        ) : (
          <div className="space-y-3">
            {data.recentSessions.slice(0, 5).map((session) => (
              <SessionRow key={session.sessionId} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <div className="card">
      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
        {label}
      </p>
      <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-calm-400)' }}>
        {subtext}
      </p>
    </div>
  );
}

function SessionRow({ session }: { session: ConversationMetrics }) {
  const date = new Date(session.startedAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{ backgroundColor: 'var(--color-calm-50)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="var(--color-calm-600)"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
            {formattedDate} at {formattedTime}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
            {formatDuration(session.duration)} •{' '}
            {session.endReason === 'completed' ? 'Completed' : 'Ended early'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mini balance bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div
            className="w-16 h-2 rounded-full overflow-hidden flex"
            style={{ backgroundColor: 'var(--color-calm-200)' }}
          >
            <div
              className="h-full"
              style={{
                width: `${session.speakingBalance * 100}%`,
                backgroundColor: 'var(--color-calm-700)',
              }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
            {Math.round(session.speakingBalance * 100)}%
          </span>
        </div>

        {/* Status badge */}
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor:
              session.endReason === 'completed'
                ? 'var(--color-safe-green)'
                : 'var(--color-safe-amber)',
            color: 'white',
          }}
        >
          {session.triggerCount === 0 ? 'Smooth' : `${session.triggerCount} triggers`}
        </span>
      </div>
    </div>
  );
}
