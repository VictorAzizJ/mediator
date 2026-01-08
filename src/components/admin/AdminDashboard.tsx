'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock data for dashboard - in production, this would come from API
interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  totalParticipants: number;
  avgConversationLength: number;
  avgSpeakingBalance: number;
  pauseRequestRate: number;
}

interface RecentConversation {
  id: string;
  participants: string[];
  template: string | null;
  startedAt: number;
  endedAt: number | null;
  status: 'active' | 'completed' | 'paused';
  speakingBalance: number;
  pauseCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  conversationCount: number;
  lastActive: number;
}

// Mock data
const mockStats: DashboardStats = {
  totalConversations: 247,
  activeConversations: 3,
  totalParticipants: 42,
  avgConversationLength: 28, // minutes
  avgSpeakingBalance: 52, // percent, ideal is 50
  pauseRequestRate: 12, // percent
};

const mockRecentConversations: RecentConversation[] = [
  {
    id: '1',
    participants: ['Sarah Chen', 'Mike Johnson'],
    template: 'Weekly 1-on-1',
    startedAt: Date.now() - 1800000,
    endedAt: null,
    status: 'active',
    speakingBalance: 48,
    pauseCount: 0,
  },
  {
    id: '2',
    participants: ['Alex Rivera', 'Jordan Smith'],
    template: 'Conflict Resolution',
    startedAt: Date.now() - 3600000,
    endedAt: Date.now() - 1800000,
    status: 'completed',
    speakingBalance: 55,
    pauseCount: 2,
  },
  {
    id: '3',
    participants: ['Emily Davis', 'Chris Brown'],
    template: 'Performance Check-in',
    startedAt: Date.now() - 7200000,
    endedAt: Date.now() - 5400000,
    status: 'completed',
    speakingBalance: 62,
    pauseCount: 1,
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'admin',
    conversationCount: 45,
    lastActive: Date.now() - 3600000,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'manager',
    conversationCount: 32,
    lastActive: Date.now() - 7200000,
  },
  {
    id: '3',
    name: 'Alex Rivera',
    email: 'alex@company.com',
    role: 'member',
    conversationCount: 18,
    lastActive: Date.now() - 86400000,
  },
];

type TabId = 'overview' | 'conversations' | 'team' | 'settings';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      id: 'conversations',
      label: 'Conversations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      ),
    },
    {
      id: 'team',
      label: 'Team',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      ),
    },
  ];

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Conversations"
          value={mockStats.totalConversations}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          }
        />
        <StatCard
          label="Active Now"
          value={mockStats.activeConversations}
          highlight
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          }
        />
        <StatCard
          label="Team Members"
          value={mockStats.totalParticipants}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z" />
            </svg>
          }
        />
        <StatCard
          label="Avg. Duration"
          value={`${mockStats.avgConversationLength}m`}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          }
        />
        <StatCard
          label="Speaking Balance"
          value={`${mockStats.avgSpeakingBalance}%`}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          }
        />
        <StatCard
          label="Pause Rate"
          value={`${mockStats.pauseRequestRate}%`}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          }
        />
      </div>

      {/* Recent Conversations */}
      <div className="card">
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
          Recent Conversations
        </h2>
        <div className="space-y-3">
          {mockRecentConversations.map((conv) => (
            <div
              key={conv.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-calm-50)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    conv.status === 'active' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor:
                      conv.status === 'active'
                        ? 'var(--color-safe-green)'
                        : 'var(--color-calm-400)',
                  }}
                />
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    {conv.participants.join(' & ')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    {conv.template || 'Freeform'} • {formatTimeAgo(conv.startedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
                  {conv.speakingBalance}% balance
                </p>
                {conv.pauseCount > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-safe-amber)' }}>
                    {conv.pauseCount} pause{conv.pauseCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConversations = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
          All Conversations
        </h2>
        <button className="btn-secondary text-sm">Export Data</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-calm-200)' }}>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-calm-500)' }}>
                Participants
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-calm-500)' }}>
                Template
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-calm-500)' }}>
                Status
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-calm-500)' }}>
                Balance
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-calm-500)' }}>
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {mockRecentConversations.map((conv) => (
              <tr key={conv.id} style={{ borderBottom: '1px solid var(--color-calm-100)' }}>
                <td className="py-3 px-3 text-sm" style={{ color: 'var(--foreground)' }}>
                  {conv.participants.join(' & ')}
                </td>
                <td className="py-3 px-3 text-sm" style={{ color: 'var(--color-calm-600)' }}>
                  {conv.template || 'Freeform'}
                </td>
                <td className="py-3 px-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor:
                        conv.status === 'active'
                          ? 'var(--color-safe-green)'
                          : conv.status === 'paused'
                          ? 'var(--color-safe-amber)'
                          : 'var(--color-calm-200)',
                      color: conv.status === 'completed' ? 'var(--color-calm-600)' : 'white',
                    }}
                  >
                    {conv.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm" style={{ color: 'var(--color-calm-600)' }}>
                  {conv.speakingBalance}%
                </td>
                <td className="py-3 px-3 text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  {formatTimeAgo(conv.startedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
          Team Members
        </h2>
        <button className="btn-primary text-sm">Invite Member</button>
      </div>
      <div className="space-y-3">
        {mockTeamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-calm-50)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: 'var(--color-calm-500)' }}
              >
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {member.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                  {member.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
                  {member.conversationCount} conversations
                </p>
                <p className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                  Active {formatTimeAgo(member.lastActive)}
                </p>
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor:
                    member.role === 'admin'
                      ? 'var(--color-calm-600)'
                      : member.role === 'manager'
                      ? 'var(--color-calm-400)'
                      : 'var(--color-calm-200)',
                  color: member.role === 'member' ? 'var(--color-calm-600)' : 'white',
                }}
              >
                {member.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
          Organization Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-calm-100)' }}>
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Default Turn Duration</p>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                How long each person speaks by default
              </p>
            </div>
            <select
              className="input w-32"
              defaultValue="90"
            >
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
              <option value="120">2 minutes</option>
              <option value="180">3 minutes</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-calm-100)' }}>
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Observer Mode</p>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Allow managers to observe conversations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-calm-100)' }}>
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Require Templates</p>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Require a template for all conversations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Data Retention</p>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                How long to keep conversation data
              </p>
            </div>
            <select
              className="input w-32"
              defaultValue="90"
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>
          Integrations
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-calm-50)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-calm-200)' }}>
                <span className="text-lg">S</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>Slack</p>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>Not connected</p>
              </div>
            </div>
            <button className="btn-secondary text-sm">Connect</button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-calm-50)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-calm-200)' }}>
                <span className="text-lg">C</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>Calendar</p>
                <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>Not connected</p>
              </div>
            </div>
            <button className="btn-secondary text-sm">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: 'var(--color-calm-200)', backgroundColor: 'var(--background)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
              Manage your organization's Mediator settings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
              Acme Corp
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: 'var(--color-calm-500)' }}
            >
              A
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === tab.id ? 'var(--color-calm-100)' : 'transparent',
                    color:
                      activeTab === tab.id
                        ? 'var(--color-calm-700)'
                        : 'var(--color-calm-500)',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'conversations' && renderConversations()}
              {activeTab === 'team' && renderTeam()}
              {activeTab === 'settings' && renderSettings()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: highlight ? 'var(--color-calm-100)' : 'var(--background)',
        border: `1px solid ${highlight ? 'var(--color-calm-300)' : 'var(--color-calm-200)'}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: 'var(--color-calm-400)' }}>{icon}</span>
      </div>
      <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
        {label}
      </p>
    </div>
  );
}
