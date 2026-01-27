/**
 * Demo Data
 *
 * Pre-populated sample data for demo mode.
 * Allows users to quickly experience the platform without going through full setup.
 */

import type { SessionSummary, DashboardStats, SkillBreakdown, DailyStats } from '@/hooks/useAdminDashboard';
import type { RoundAnalytics } from '@/types';

// ============================================
// DEMO USER PROFILES
// ============================================

export const demoUsers = [
  {
    id: 'demo-user-1',
    email: 'alex.chen@techcorp.com',
    name: 'Alex Chen',
    role: 'Engineering Manager',
    accountType: 'team' as const,
    orgName: 'TechCorp Inc.',
  },
  {
    id: 'demo-user-2',
    email: 'sarah.johnson@techcorp.com',
    name: 'Sarah Johnson',
    role: 'Product Manager',
    accountType: 'team' as const,
    orgName: 'TechCorp Inc.',
  },
  {
    id: 'demo-user-3',
    email: 'mike.williams@startup.io',
    name: 'Mike Williams',
    role: 'Founder',
    accountType: 'individual' as const,
  },
];

// ============================================
// DEMO SESSIONS
// ============================================

const now = new Date();
const day = 24 * 60 * 60 * 1000;

export const demoSessions: SessionSummary[] = [
  {
    id: 'demo-session-1',
    sessionCode: 'DEMO01',
    skill: 'DEAR MAN',
    templateName: 'Technical to Non-Technical Team Meeting',
    roundsCompleted: 3,
    sessionTime: 540,
    volumeFlags: 0,
    userEmail: 'alex.chen@techcorp.com',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-session-2',
    sessionCode: 'DEMO02',
    skill: 'GIVE',
    templateName: 'Client Relationship Repair',
    roundsCompleted: 3,
    sessionTime: 480,
    volumeFlags: 1,
    userEmail: 'sarah.johnson@techcorp.com',
    createdAt: new Date(now.getTime() - 1 * day).toISOString(),
    completedAt: new Date(now.getTime() - 1 * day + 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-session-3',
    sessionCode: 'DEMO03',
    skill: 'FAST',
    templateName: 'Boundary Setting',
    roundsCompleted: 3,
    sessionTime: 360,
    volumeFlags: 0,
    userEmail: 'mike.williams@startup.io',
    createdAt: new Date(now.getTime() - 2 * day).toISOString(),
    completedAt: new Date(now.getTime() - 2 * day + 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-session-4',
    sessionCode: 'DEMO04',
    skill: 'DEAR MAN',
    templateName: 'Conflict with a Team Member',
    roundsCompleted: 3,
    sessionTime: 620,
    volumeFlags: 2,
    userEmail: 'alex.chen@techcorp.com',
    createdAt: new Date(now.getTime() - 3 * day).toISOString(),
    completedAt: new Date(now.getTime() - 3 * day + 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-session-5',
    sessionCode: 'DEMO05',
    skill: 'GIVE',
    templateName: 'Team Morale Recovery',
    roundsCompleted: 2,
    sessionTime: 320,
    volumeFlags: 0,
    userEmail: 'sarah.johnson@techcorp.com',
    createdAt: new Date(now.getTime() - 4 * day).toISOString(),
    completedAt: new Date(now.getTime() - 4 * day + 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-session-6',
    sessionCode: 'DEMO06',
    skill: 'DEAR MAN',
    templateName: 'Requesting Resources or Support',
    roundsCompleted: 3,
    sessionTime: 580,
    volumeFlags: 0,
    userEmail: 'mike.williams@startup.io',
    createdAt: new Date(now.getTime() - 5 * day).toISOString(),
    completedAt: new Date(now.getTime() - 5 * day + 32 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-session-7',
    sessionCode: 'DEMO07',
    skill: 'FAST',
    templateName: 'Ethical Pushback',
    roundsCompleted: 3,
    sessionTime: 400,
    volumeFlags: 1,
    userEmail: 'alex.chen@techcorp.com',
    createdAt: new Date(now.getTime() - 6 * day).toISOString(),
    completedAt: new Date(now.getTime() - 6 * day + 28 * 60 * 1000).toISOString(),
  },
];

// ============================================
// DEMO ANALYTICS
// ============================================

export const demoStats: DashboardStats = {
  totalSessions: 247,
  totalRounds: 712,
  avgSessionTime: 420,
  totalParticipants: 42,
  volumeFlagsTotal: 23,
  redosTotal: 8,
};

export const demoSkillBreakdown: SkillBreakdown[] = [
  { skill: 'DEAR MAN', count: 120, percentage: 48.6 },
  { skill: 'GIVE', count: 75, percentage: 30.4 },
  { skill: 'FAST', count: 52, percentage: 21.0 },
];

export const demoDailyStats: DailyStats[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(now.getTime() - i * day);
  return {
    date: date.toISOString().split('T')[0],
    session_count: Math.floor(Math.random() * 15) + 5,
    avg_duration: Math.floor(Math.random() * 200) + 300,
    total_rounds: Math.floor(Math.random() * 40) + 15,
    total_volume_flags: Math.floor(Math.random() * 5),
  };
}).reverse();

// ============================================
// DEMO ROUND DATA
// ============================================

export const demoRounds: Record<string, RoundAnalytics[]> = {
  'demo-session-1': [
    {
      round: 1,
      phase: 'setup',
      inputType: 'voice',
      text: 'I noticed that in our last sprint planning, the technical requirements weren\'t fully understood by the product team.',
      responseLength: 145,
      volumeFlag: false,
      startTime: 0,
      endTime: 180,
      duration: 180,
      wasRedone: false,
    },
    {
      round: 2,
      phase: 'practice',
      inputType: 'voice',
      text: 'I feel concerned because when timelines are underestimated, the engineering team ends up working overtime.',
      responseLength: 210,
      volumeFlag: false,
      startTime: 180,
      endTime: 380,
      duration: 200,
      wasRedone: false,
    },
    {
      round: 3,
      phase: 'reflect',
      inputType: 'text',
      text: 'I think that went well. I stayed calm and focused on the facts.',
      responseLength: 85,
      volumeFlag: false,
      startTime: 380,
      endTime: 540,
      duration: 160,
      wasRedone: false,
    },
  ],
  'demo-session-2': [
    {
      round: 1,
      phase: 'setup',
      inputType: 'voice',
      text: 'I wanted to talk about the feedback from last week\'s presentation.',
      responseLength: 120,
      volumeFlag: false,
      startTime: 0,
      endTime: 150,
      duration: 150,
      wasRedone: false,
    },
    {
      round: 2,
      phase: 'practice',
      inputType: 'voice',
      text: 'I can see why you might have felt frustrated with the technical issues.',
      responseLength: 180,
      volumeFlag: true,
      startTime: 150,
      endTime: 340,
      duration: 190,
      wasRedone: false,
    },
    {
      round: 3,
      phase: 'reflect',
      inputType: 'voice',
      text: 'Moving forward, I\'d like to propose we do a dry run before any client presentations.',
      responseLength: 95,
      volumeFlag: false,
      startTime: 340,
      endTime: 480,
      duration: 140,
      wasRedone: false,
    },
  ],
};

// ============================================
// DEMO TRANSCRIPT SAMPLES
// ============================================

export const demoTranscripts: Record<string, string[]> = {
  'demo-session-1': [
    "I noticed that in our last sprint planning, the technical requirements weren't fully understood by the product team. The data migration we discussed would take about three weeks, not the one week that was estimated.",
    "I feel concerned because when timelines are underestimated, the engineering team ends up working overtime and quality suffers. What I need is for us to have a technical review before finalizing sprint commitments.",
    "I think that went well. I stayed calm and focused on the facts. I could have been more specific about the benefits of the technical review process.",
  ],
  'demo-session-2': [
    "I wanted to talk about the feedback from last week's presentation. I know it didn't go as planned.",
    "I can see why you might have felt frustrated with the technical issues. Tell me more about what was most challenging from your perspective. I hear that the demo failing was embarrassing.",
    "Moving forward, I'd like to propose we do a dry run before any client presentations. What would work for you?",
  ],
};

// ============================================
// DEMO MODE HELPERS
// ============================================

/**
 * Check if demo mode is active
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('mediator_demo_mode') === 'true';
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mediator_demo_mode', 'true');
  localStorage.setItem('mediator_demo_access', 'granted');
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('mediator_demo_mode');
}

/**
 * Get demo user for current session
 */
export function getDemoUser() {
  return demoUsers[0];
}

/**
 * Get demo analytics data
 */
export function getDemoAnalytics() {
  return {
    source: 'demo' as const,
    stats: demoStats,
    skillBreakdown: demoSkillBreakdown,
    dailyStats: demoDailyStats,
    recentSessions: demoSessions,
  };
}

/**
 * Get demo session by ID
 */
export function getDemoSession(sessionId: string) {
  const session = demoSessions.find(s => s.id === sessionId);
  if (!session) return null;

  return {
    session,
    rounds: demoRounds[sessionId] || [],
    transcript: demoTranscripts[sessionId] || [],
  };
}

/**
 * Simulate a demo conversation flow
 */
export interface DemoConversationStep {
  phase: 'setup' | 'practice' | 'reflect';
  prompt: string;
  sampleResponse: string;
  skillElements?: string[];
}

export function getDemoConversationFlow(skill: 'DEAR MAN' | 'GIVE' | 'FAST'): DemoConversationStep[] {
  const flows: Record<string, DemoConversationStep[]> = {
    'DEAR MAN': [
      {
        phase: 'setup',
        prompt: "Describe the technical situation in plain terms. What's the core issue or need?",
        sampleResponse: "Our API response times have increased by 40% over the past month. The data shows we're hitting database connection limits during peak hours.",
        skillElements: ['D'],
      },
      {
        phase: 'practice',
        prompt: 'Express why this matters. Make your request. Explain the value clearly.',
        sampleResponse: "I feel concerned because this is impacting user experience and could affect our renewal rates. I'm requesting we allocate two sprints to infrastructure improvements. This would reduce our support tickets by an estimated 30%.",
        skillElements: ['E', 'A', 'R'],
      },
      {
        phase: 'reflect',
        prompt: 'Did they understand? Where could you simplify further?',
        sampleResponse: "I think the business case landed well. I could have simplified the technical explanation even more. I'm open to prioritizing the most critical fixes first if we can't get the full two sprints.",
        skillElements: ['M', 'N'],
      },
    ],
    'GIVE': [
      {
        phase: 'setup',
        prompt: 'Explain the issue gently. No blame—just what happened.',
        sampleResponse: "I wanted to touch base after yesterday's meeting. I noticed things felt a bit tense when we discussed the timeline changes.",
        skillElements: ['G'],
      },
      {
        phase: 'practice',
        prompt: 'Show interest in their view. Validate how they might feel.',
        sampleResponse: "I'm curious about your perspective on the timeline concerns. I can see why having the deadline moved would be frustrating, especially after the work you put into the original plan.",
        skillElements: ['I', 'V'],
      },
      {
        phase: 'reflect',
        prompt: 'Offer a path forward. Keep it easy and respectful.',
        sampleResponse: "No pressure to figure this out right now. Let's grab coffee tomorrow and brainstorm together? I think we can find something that works for everyone.",
        skillElements: ['E'],
      },
    ],
    'FAST': [
      {
        phase: 'setup',
        prompt: 'What boundary do you need to set? Name it clearly.',
        sampleResponse: "I need to establish that I won't be available for non-emergency calls after 6pm. This is important for my family commitments.",
        skillElements: ['F'],
      },
      {
        phase: 'practice',
        prompt: 'State your boundary. No apologies. Be firm and fair.',
        sampleResponse: "I won't be taking calls after 6pm unless it's a true production emergency. This is non-negotiable for me. For urgent matters, I'll respond to Slack messages within an hour.",
        skillElements: ['A', 'S'],
      },
      {
        phase: 'reflect',
        prompt: 'Did you stay true to your values? Were you honest?',
        sampleResponse: "I was direct and honest. I didn't over-apologize. I offered a fair alternative with the Slack option. I feel good about how I handled it.",
        skillElements: ['T'],
      },
    ],
  };

  return flows[skill] || flows['DEAR MAN'];
}
