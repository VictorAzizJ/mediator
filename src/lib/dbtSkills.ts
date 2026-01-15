// DBT Interpersonal Effectiveness Skills
// Evidence-based skill definitions and templates for B2B demo

import type { DBTSkill, DBTSkillInfo, SkillBasedTemplate } from '@/types';

// ============================================
// SKILL DEFINITIONS
// ============================================

export const dbtSkillInfo: Record<DBTSkill, DBTSkillInfo> = {
  'DEAR MAN': {
    id: 'DEAR MAN',
    name: 'DEAR MAN',
    focus: 'Assertive Communication',
    summary:
      "DEAR MAN helps you ask for what you need while keeping the relationship intact. It's not about winning—it's about being clear and respectful. You'll describe facts, share feelings, make a request, and explain why it matters. Stay focused, stay confident, and stay open to compromise.",
    acronymBreakdown: [
      { letter: 'D', word: 'Describe', description: 'State the facts objectively' },
      { letter: 'E', word: 'Express', description: 'Share your feelings using "I" statements' },
      { letter: 'A', word: 'Assert', description: 'Ask clearly for what you want' },
      { letter: 'R', word: 'Reinforce', description: 'Explain the benefits of your request' },
      { letter: 'M', word: 'Mindful', description: 'Stay focused, don\'t get derailed' },
      { letter: 'A', word: 'Appear confident', description: 'Use confident tone and posture' },
      { letter: 'N', word: 'Negotiate', description: 'Be willing to give to get' },
    ],
  },

  GIVE: {
    id: 'GIVE',
    name: 'GIVE',
    focus: 'Relationship Maintenance',
    summary:
      "GIVE helps you repair and maintain relationships by focusing on connection over correction. You'll approach the conversation gently, show genuine interest in their experience, validate their feelings (even if you disagree), and keep the tone easy and approachable. The goal is understanding, not winning.",
    acronymBreakdown: [
      { letter: 'G', word: 'Gentle', description: 'No attacks, threats, or judgments' },
      { letter: 'I', word: 'Interested', description: 'Listen actively, ask questions' },
      { letter: 'V', word: 'Validate', description: 'Acknowledge their perspective and feelings' },
      { letter: 'E', word: 'Easy manner', description: 'Use humor if appropriate, be light' },
    ],
  },

  FAST: {
    id: 'FAST',
    name: 'FAST',
    focus: 'Self-Respect & Boundaries',
    summary:
      "FAST helps you set boundaries while keeping your self-respect intact. You'll be fair to both sides, avoid unnecessary apologies, stay true to your values, and speak honestly. Boundaries aren't selfish—they're essential. This skill helps you hold them without guilt.",
    acronymBreakdown: [
      { letter: 'F', word: 'Fair', description: 'Be fair to yourself AND the other person' },
      { letter: 'A', word: 'Apologies', description: "Don't over-apologize for having needs" },
      { letter: 'S', word: 'Stick to values', description: "Don't compromise your integrity" },
      { letter: 'T', word: 'Truthful', description: "Don't exaggerate, minimize, or lie" },
    ],
  },
};

// ============================================
// SKILL-BASED TEMPLATES
// ============================================

export const skillBasedTemplates: SkillBasedTemplate[] = [
  // DEAR MAN - Conflict with a Team Member
  {
    id: 'dear-man-conflict',
    name: 'Conflict with a Team Member',
    description:
      'Address workplace disagreements where you need to assert your needs clearly—such as pushback on workload, credit disputes, or behavioral concerns. Common in manager-report dynamics or peer-to-peer friction.',
    skill: 'DEAR MAN',
    category: 'conflict',
    estimatedDuration: 15,
    turnDuration: 90,
    maxRounds: 3,
    skillSummary: dbtSkillInfo['DEAR MAN'].summary,
    rounds: [
      {
        phase: 'setup',
        prompt: 'Describe what happened. Stick to facts only.',
        coachingNote: 'Focus on observable events. What did you see or hear?',
      },
      {
        phase: 'practice',
        prompt: 'Share how you feel. Say what you need. Explain why it helps.',
        coachingNote: 'Use "I feel..." and "I need..." statements. End with the benefit.',
      },
      {
        phase: 'reflect',
        prompt: 'How did that feel? Was there room to negotiate?',
        coachingNote: 'Rate your confidence 1-5. Consider what you might adjust next time.',
      },
    ],
    tags: ['conflict', 'assertiveness', 'team', 'workplace'],
  },

  // DEAR MAN - Requesting Resources
  {
    id: 'dear-man-resources',
    name: 'Requesting Resources or Support',
    description:
      'Make a clear case for additional resources, budget, headcount, or support from leadership. Use when you need to advocate for your team or project needs.',
    skill: 'DEAR MAN',
    category: 'feedback',
    estimatedDuration: 15,
    turnDuration: 90,
    maxRounds: 3,
    skillSummary: dbtSkillInfo['DEAR MAN'].summary,
    rounds: [
      {
        phase: 'setup',
        prompt: 'Describe the current situation and what you need.',
        coachingNote: 'Be specific about the gap between current state and what\'s needed.',
      },
      {
        phase: 'practice',
        prompt: 'Express why this matters. Assert your request. Reinforce the value.',
        coachingNote: 'Connect the request to business outcomes or team wellbeing.',
      },
      {
        phase: 'reflect',
        prompt: 'Did you stay focused? What alternatives could you offer?',
        coachingNote: 'Negotiation is part of DEAR MAN. Think of your Plan B.',
      },
    ],
    tags: ['resources', 'leadership', 'advocacy', 'assertiveness'],
  },

  // GIVE - Client Relationship Repair
  {
    id: 'give-client-repair',
    name: 'Client Relationship Repair',
    description:
      'Rebuild trust when a professional relationship has been strained—missed expectations, communication breakdowns, or service failures. Common in account management and client success.',
    skill: 'GIVE',
    category: 'relationship',
    estimatedDuration: 15,
    turnDuration: 90,
    maxRounds: 3,
    skillSummary: dbtSkillInfo['GIVE'].summary,
    rounds: [
      {
        phase: 'setup',
        prompt: 'Explain the issue gently. No blame—just what happened.',
        coachingNote: 'Use a soft tone. Imagine speaking to someone you care about.',
      },
      {
        phase: 'practice',
        prompt: 'Show interest in their view. Validate how they might feel.',
        coachingNote: 'Try: "I can see why that would be frustrating..." or "Help me understand..."',
      },
      {
        phase: 'reflect',
        prompt: 'Offer a path forward. Keep it easy and respectful.',
        coachingNote: 'End with collaboration: "What would work for you?"',
      },
    ],
    tags: ['client', 'relationship', 'repair', 'trust'],
  },

  // GIVE - Team Morale Recovery
  {
    id: 'give-team-morale',
    name: 'Team Morale Recovery',
    description:
      'Address low team morale, disappointment after a setback, or tension following organizational changes. Focus on reconnection and acknowledgment.',
    skill: 'GIVE',
    category: 'relationship',
    estimatedDuration: 15,
    turnDuration: 90,
    maxRounds: 3,
    skillSummary: dbtSkillInfo['GIVE'].summary,
    rounds: [
      {
        phase: 'setup',
        prompt: 'Acknowledge what the team has been through. Be gentle.',
        coachingNote: 'Don\'t minimize or rush past the difficulty.',
      },
      {
        phase: 'practice',
        prompt: 'Ask what they need. Validate their experience.',
        coachingNote: 'Listen more than you speak. Show genuine curiosity.',
      },
      {
        phase: 'reflect',
        prompt: 'What can you commit to? Keep the tone hopeful but honest.',
        coachingNote: 'An easy manner doesn\'t mean dismissing concerns—it means staying approachable.',
      },
    ],
    tags: ['team', 'morale', 'leadership', 'support'],
  },

  // FAST - Boundary Setting
  {
    id: 'fast-boundary',
    name: 'Boundary Setting',
    description:
      'Set or maintain professional boundaries—declining unreasonable requests, protecting personal time, or upholding ethical standards. For high-pressure environments with scope creep or boundary violations.',
    skill: 'FAST',
    category: 'boundary',
    estimatedDuration: 12,
    turnDuration: 60,
    maxRounds: 3,
    skillSummary: dbtSkillInfo['FAST'].summary,
    rounds: [
      {
        phase: 'setup',
        prompt: 'What boundary do you need to set? Name it clearly.',
        coachingNote: 'Be specific. "I need to leave by 6pm" is clearer than "I need more balance."',
      },
      {
        phase: 'practice',
        prompt: 'State your boundary. No apologies. Be firm and fair.',
        coachingNote: 'Resist softening. "I won\'t be available" not "I\'m so sorry but I might not..."',
      },
      {
        phase: 'reflect',
        prompt: 'Did you stay true to your values? Were you honest?',
        coachingNote: 'Self-respect check: Would you be proud of how you handled this?',
      },
    ],
    tags: ['boundary', 'self-respect', 'values', 'assertiveness'],
  },

  // FAST - Ethical Pushback
  {
    id: 'fast-ethical',
    name: 'Ethical Pushback',
    description:
      'Push back on requests that conflict with your values or professional ethics. Use when asked to do something you\'re not comfortable with.',
    skill: 'FAST',
    category: 'boundary',
    estimatedDuration: 12,
    turnDuration: 60,
    maxRounds: 3,
    skillSummary: dbtSkillInfo['FAST'].summary,
    rounds: [
      {
        phase: 'setup',
        prompt: 'What are you being asked to do? What value does it conflict with?',
        coachingNote: 'Name your values explicitly. They are your anchor.',
      },
      {
        phase: 'practice',
        prompt: 'State your position truthfully. Be fair but firm.',
        coachingNote: 'You can disagree without being disagreeable. Stay grounded.',
      },
      {
        phase: 'reflect',
        prompt: 'Did you compromise your integrity? What would you do differently?',
        coachingNote: 'FAST is about long-term self-respect, not short-term comfort.',
      },
    ],
    tags: ['ethics', 'values', 'pushback', 'integrity'],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSkillInfo(skill: DBTSkill): DBTSkillInfo {
  return dbtSkillInfo[skill];
}

export function getTemplatesBySkill(skill: DBTSkill): SkillBasedTemplate[] {
  return skillBasedTemplates.filter((t) => t.skill === skill);
}

export function getTemplatesByCategory(
  category: SkillBasedTemplate['category']
): SkillBasedTemplate[] {
  return skillBasedTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): SkillBasedTemplate | undefined {
  return skillBasedTemplates.find((t) => t.id === id);
}

export function searchTemplates(query: string): SkillBasedTemplate[] {
  const lowerQuery = query.toLowerCase();
  return skillBasedTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.skill.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.includes(lowerQuery))
  );
}

export function getCategories(): { id: SkillBasedTemplate['category']; label: string }[] {
  return [
    { id: 'conflict', label: 'Conflict Resolution' },
    { id: 'relationship', label: 'Relationship Repair' },
    { id: 'boundary', label: 'Boundary Setting' },
    { id: 'feedback', label: 'Feedback & Requests' },
  ];
}

export function getSkillCategories(): { id: DBTSkill; label: string; focus: string }[] {
  return [
    { id: 'DEAR MAN', label: 'DEAR MAN', focus: 'Assertive Communication' },
    { id: 'GIVE', label: 'GIVE', focus: 'Relationship Maintenance' },
    { id: 'FAST', label: 'FAST', focus: 'Self-Respect & Boundaries' },
  ];
}
