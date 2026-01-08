// Manager Check-in Templates for B2B
// Pre-defined conversation structures for common workplace scenarios

export interface CheckInTemplate {
  id: string;
  name: string;
  description: string;
  category: 'one-on-one' | 'conflict' | 'performance' | 'team' | 'feedback';
  estimatedDuration: number; // in minutes
  turnDuration: number; // in seconds
  maxRounds: number; // 0 = unlimited
  prompts: {
    opening: string;
    reflectionPrompts: string[];
    closingPrompts: string[];
  };
  intentions: {
    participant1: string;
    participant2: string;
  };
  tags: string[];
}

export const checkInTemplates: CheckInTemplate[] = [
  // Weekly 1-on-1
  {
    id: 'weekly-1on1',
    name: 'Weekly 1-on-1',
    description: 'Regular check-in between manager and direct report to discuss progress, blockers, and support needed.',
    category: 'one-on-one',
    estimatedDuration: 30,
    turnDuration: 90,
    maxRounds: 6,
    prompts: {
      opening: 'Take a moment to think about what you want to get out of this conversation.',
      reflectionPrompts: [
        'What has been your biggest win this week?',
        'What challenges are you currently facing?',
        'How can I better support you?',
        'Is there anything you need to be successful?',
      ],
      closingPrompts: [
        'What are your priorities for next week?',
        'Is there anything else on your mind?',
      ],
    },
    intentions: {
      participant1: 'I want to understand how my team member is doing and offer support',
      participant2: 'I want to share my progress and ask for help where I need it',
    },
    tags: ['recurring', 'check-in', 'support'],
  },

  // Conflict Resolution
  {
    id: 'conflict-resolution',
    name: 'Conflict Resolution',
    description: 'Structured conversation to address and resolve workplace conflicts between two parties.',
    category: 'conflict',
    estimatedDuration: 45,
    turnDuration: 120,
    maxRounds: 8,
    prompts: {
      opening: 'This is a safe space for both of you to share your perspectives. The goal is understanding, not winning.',
      reflectionPrompts: [
        'How did this situation make you feel?',
        'What do you think the other person was experiencing?',
        'What would a good resolution look like for you?',
        'What are you willing to do differently?',
      ],
      closingPrompts: [
        'What agreements can we make going forward?',
        'How will we know if this is working?',
      ],
    },
    intentions: {
      participant1: 'I want to understand the other perspective and find common ground',
      participant2: 'I want to be heard and work toward a resolution',
    },
    tags: ['conflict', 'mediation', 'resolution'],
  },

  // Performance Check-in
  {
    id: 'performance-review',
    name: 'Performance Check-in',
    description: 'Semi-annual or quarterly performance discussion focused on growth, achievements, and development.',
    category: 'performance',
    estimatedDuration: 45,
    turnDuration: 120,
    maxRounds: 6,
    prompts: {
      opening: 'Let\'s reflect on your performance and growth. This is a conversation, not an evaluation.',
      reflectionPrompts: [
        'What accomplishments are you most proud of?',
        'What skills have you developed?',
        'Where would you like to grow?',
        'What feedback do you have for me as your manager?',
      ],
      closingPrompts: [
        'What goals would you like to set for the next period?',
        'What support do you need to achieve these goals?',
      ],
    },
    intentions: {
      participant1: 'I want to recognize achievements and support growth',
      participant2: 'I want to reflect on my progress and set meaningful goals',
    },
    tags: ['performance', 'growth', 'goals'],
  },

  // Stay Interview
  {
    id: 'stay-interview',
    name: 'Stay Interview',
    description: 'Proactive conversation to understand what keeps an employee engaged and what might cause them to leave.',
    category: 'one-on-one',
    estimatedDuration: 30,
    turnDuration: 90,
    maxRounds: 6,
    prompts: {
      opening: 'I value you as a team member and want to understand what makes work meaningful for you.',
      reflectionPrompts: [
        'What do you look forward to at work?',
        'What do you dread or find frustrating?',
        'What would make your job more satisfying?',
        'What might tempt you to leave?',
      ],
      closingPrompts: [
        'What can I do to make you feel more valued?',
        'What changes would have the biggest impact?',
      ],
    },
    intentions: {
      participant1: 'I want to understand what motivates and retains my team member',
      participant2: 'I want to share honest feedback about my work experience',
    },
    tags: ['retention', 'engagement', 'feedback'],
  },

  // Project Retrospective
  {
    id: 'project-retro',
    name: 'Project Retrospective',
    description: 'Team reflection on a completed project to identify what worked well and what could improve.',
    category: 'team',
    estimatedDuration: 60,
    turnDuration: 90,
    maxRounds: 10,
    prompts: {
      opening: 'Let\'s reflect on this project with an open mind. Every perspective is valuable.',
      reflectionPrompts: [
        'What went well that we should continue doing?',
        'What didn\'t go as planned?',
        'What would you do differently next time?',
        'What did you learn?',
      ],
      closingPrompts: [
        'What specific actions should we take?',
        'How do we hold ourselves accountable?',
      ],
    },
    intentions: {
      participant1: 'I want to learn from our experience and improve our processes',
      participant2: 'I want to share my observations and contribute to our growth',
    },
    tags: ['retrospective', 'learning', 'improvement'],
  },

  // Feedback Exchange
  {
    id: 'feedback-exchange',
    name: 'Feedback Exchange',
    description: 'Structured peer-to-peer feedback session for mutual growth and understanding.',
    category: 'feedback',
    estimatedDuration: 30,
    turnDuration: 90,
    maxRounds: 6,
    prompts: {
      opening: 'This is an opportunity for honest, constructive feedback in both directions.',
      reflectionPrompts: [
        'What do you appreciate about working with me?',
        'What could I do better?',
        'How can we improve our collaboration?',
      ],
      closingPrompts: [
        'What is one thing we each commit to improving?',
        'When should we check in on our progress?',
      ],
    },
    intentions: {
      participant1: 'I want to give and receive constructive feedback',
      participant2: 'I want to grow through honest peer feedback',
    },
    tags: ['feedback', 'peer', 'growth'],
  },

  // Career Development
  {
    id: 'career-development',
    name: 'Career Development',
    description: 'Discussion focused on long-term career goals, aspirations, and development planning.',
    category: 'one-on-one',
    estimatedDuration: 45,
    turnDuration: 120,
    maxRounds: 6,
    prompts: {
      opening: 'Let\'s talk about where you want to go in your career and how I can help you get there.',
      reflectionPrompts: [
        'Where do you see yourself in 2-3 years?',
        'What skills or experiences do you want to develop?',
        'What kind of work energizes you?',
        'What obstacles do you see to reaching your goals?',
      ],
      closingPrompts: [
        'What is the next step in your development?',
        'What opportunities should I look for to help you grow?',
      ],
    },
    intentions: {
      participant1: 'I want to understand and support your career aspirations',
      participant2: 'I want to share my goals and get guidance on my path',
    },
    tags: ['career', 'development', 'growth'],
  },

  // Onboarding Check-in
  {
    id: 'onboarding-checkin',
    name: 'Onboarding Check-in',
    description: 'Regular check-in during the first 90 days to ensure successful onboarding.',
    category: 'one-on-one',
    estimatedDuration: 30,
    turnDuration: 90,
    maxRounds: 6,
    prompts: {
      opening: 'I want to make sure you\'re getting what you need to be successful here.',
      reflectionPrompts: [
        'What has been the most helpful part of your onboarding?',
        'What has been confusing or unclear?',
        'What questions do you have about our team or company?',
        'What do you need more of?',
      ],
      closingPrompts: [
        'What would help you feel more confident in your role?',
        'Is there anyone you would like to meet or learn from?',
      ],
    },
    intentions: {
      participant1: 'I want to ensure a successful onboarding experience',
      participant2: 'I want to share what I need to succeed in my new role',
    },
    tags: ['onboarding', 'new-hire', 'support'],
  },

  // Return from Leave
  {
    id: 'return-from-leave',
    name: 'Return from Leave',
    description: 'Supportive check-in for employees returning from extended leave (parental, medical, sabbatical).',
    category: 'one-on-one',
    estimatedDuration: 30,
    turnDuration: 120,
    maxRounds: 4,
    prompts: {
      opening: 'Welcome back. Let\'s talk about how to make your return as smooth as possible.',
      reflectionPrompts: [
        'How are you feeling about being back?',
        'What concerns do you have about the transition?',
        'What changes have you noticed since returning?',
      ],
      closingPrompts: [
        'What flexibility or support do you need?',
        'How often should we check in during your transition?',
      ],
    },
    intentions: {
      participant1: 'I want to support a smooth transition back to work',
      participant2: 'I want to share my needs and concerns about returning',
    },
    tags: ['leave', 'transition', 'support'],
  },

  // Difficult Conversation
  {
    id: 'difficult-conversation',
    name: 'Difficult Conversation',
    description: 'Framework for addressing sensitive topics like underperformance, behavior issues, or layoffs.',
    category: 'feedback',
    estimatedDuration: 30,
    turnDuration: 120,
    maxRounds: 4,
    prompts: {
      opening: 'I need to share something important with you. I want to be direct but also give you space to respond.',
      reflectionPrompts: [
        'How are you processing what I\'ve shared?',
        'What questions do you have?',
        'What is your perspective on this situation?',
      ],
      closingPrompts: [
        'What do you need from me going forward?',
        'What are our next steps?',
      ],
    },
    intentions: {
      participant1: 'I want to address this issue clearly while respecting dignity',
      participant2: 'I want to understand the situation and respond thoughtfully',
    },
    tags: ['difficult', 'sensitive', 'direct'],
  },
];

// Helper functions
export function getTemplatesByCategory(category: CheckInTemplate['category']): CheckInTemplate[] {
  return checkInTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): CheckInTemplate | undefined {
  return checkInTemplates.find((t) => t.id === id);
}

export function searchTemplates(query: string): CheckInTemplate[] {
  const lowerQuery = query.toLowerCase();
  return checkInTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.includes(lowerQuery))
  );
}

export function getCategories(): { id: CheckInTemplate['category']; label: string }[] {
  return [
    { id: 'one-on-one', label: '1-on-1 Meetings' },
    { id: 'conflict', label: 'Conflict Resolution' },
    { id: 'performance', label: 'Performance' },
    { id: 'team', label: 'Team' },
    { id: 'feedback', label: 'Feedback' },
  ];
}
