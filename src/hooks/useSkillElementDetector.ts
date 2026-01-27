'use client';

import { useState, useCallback, useMemo } from 'react';
import type { DBTSkill } from '@/types';

export interface SkillElement {
  letter: string;
  word: string;
  detected: boolean;
  confidence: number;
  matchedPhrases: string[];
}

export interface SkillCoverage {
  skill: DBTSkill;
  elements: SkillElement[];
  overallCoverage: number; // 0-100%
  missingElements: string[];
  coachingTip: string | null;
}

// Pattern matchers for each skill element
// These use keyword matching - in production, could be enhanced with LLM

const DEAR_MAN_PATTERNS: Record<string, { keywords: string[]; phrases: RegExp[] }> = {
  D: {
    keywords: ['noticed', 'observed', 'saw', 'happened', 'situation', 'fact', 'when', 'the data shows', 'looking at'],
    phrases: [
      /I (noticed|observed|saw) that/i,
      /the (situation|facts?|data) (is|are|shows?)/i,
      /what happened was/i,
      /looking at the/i,
    ],
  },
  E: {
    keywords: ['I feel', 'I am', 'I\'m feeling', 'concerned', 'worried', 'frustrated', 'excited', 'hopeful', 'disappointed'],
    phrases: [
      /I (feel|am|'m) (feeling )?(concerned|worried|frustrated|excited|hopeful|disappointed|anxious|stressed)/i,
      /this makes me feel/i,
      /I've been feeling/i,
      /my concern is/i,
    ],
  },
  A: {
    keywords: ['I need', 'I want', 'I\'d like', 'I am asking', 'I request', 'would you', 'could you', 'please'],
    phrases: [
      /I (need|want|'d like|would like|am asking)/i,
      /(would|could) you (please)?/i,
      /I('m| am) (requesting|asking)/i,
      /what I need is/i,
    ],
  },
  R: {
    keywords: ['because', 'this would help', 'the benefit', 'it would mean', 'this matters because', 'important because'],
    phrases: [
      /this would (help|benefit|allow|enable)/i,
      /the benefit (is|would be)/i,
      /it would mean/i,
      /this (matters|is important) because/i,
      /if we do this,? (then|we)/i,
    ],
  },
  M: {
    keywords: ['let\'s focus', 'back to', 'the main point', 'staying on track', 'as I was saying'],
    phrases: [
      /let's (focus|stay|get back)/i,
      /(back to|returning to) (the|my|our)/i,
      /the (main|key) (point|issue|topic)/i,
    ],
  },
  A2: { // Appear confident
    keywords: ['I believe', 'I\'m confident', 'I know', 'I\'m certain', 'clearly', 'definitely'],
    phrases: [
      /I (believe|'m confident|know|'m certain)/i,
      /(clearly|definitely|certainly)/i,
      /I('m| am) sure/i,
    ],
  },
  N: {
    keywords: ['alternatively', 'what if', 'we could', 'another option', 'compromise', 'meet in the middle', 'flexible'],
    phrases: [
      /(alternatively|what if|perhaps)/i,
      /(another|one) option/i,
      /we could (also|try)/i,
      /(meet|somewhere) in the middle/i,
      /I('m| am) (open|flexible|willing)/i,
    ],
  },
};

const GIVE_PATTERNS: Record<string, { keywords: string[]; phrases: RegExp[] }> = {
  G: {
    keywords: ['I understand', 'I appreciate', 'thank you', 'I see', 'I hear you', 'respect'],
    phrases: [
      /I (understand|appreciate|see|hear you|respect)/i,
      /thank you for/i,
      /I don't mean to/i,
      /no judgment/i,
    ],
  },
  I: {
    keywords: ['tell me more', 'what do you', 'how do you', 'can you help me understand', 'I\'m curious'],
    phrases: [
      /tell me (more|about)/i,
      /(what|how) do you (think|feel|see)/i,
      /can you help me understand/i,
      /I('m| am) (curious|interested)/i,
      /what's your (take|perspective|view)/i,
    ],
  },
  V: {
    keywords: ['that makes sense', 'I can see why', 'that\'s understandable', 'your point is valid', 'I get it'],
    phrases: [
      /that (makes sense|'s understandable|must be)/i,
      /I can see (why|how|that)/i,
      /your (point|perspective|feeling) is/i,
      /I (get|understand) (it|that|why)/i,
      /anyone (would|might) feel/i,
    ],
  },
  E: {
    keywords: ['no worries', 'it\'s okay', 'we can figure this out', 'let\'s', 'together'],
    phrases: [
      /no (worries|pressure|rush)/i,
      /it's (okay|alright|fine)/i,
      /we can (figure|work) (this|it) out/i,
      /let's (see|try|work on)/i,
      /(together|as a team)/i,
    ],
  },
};

const FAST_PATTERNS: Record<string, { keywords: string[]; phrases: RegExp[] }> = {
  F: {
    keywords: ['fair', 'both sides', 'your needs', 'my needs', 'balance', 'equally'],
    phrases: [
      /to be fair/i,
      /(both|all) (sides|perspectives|needs)/i,
      /your needs (and|as well as) (my|mine)/i,
      /(balanced|equal)/i,
      /I want to be fair/i,
    ],
  },
  A: {
    keywords: ['I won\'t apologize', 'this is my position', 'I stand by', 'I\'m not sorry for'],
    phrases: [
      /I (won't|will not) apologize for/i,
      /this is (my|a valid) (position|stance)/i,
      /I (stand|stood) by/i,
      /I('m| am) not sorry for/i,
      /no apologies/i,
    ],
  },
  S: {
    keywords: ['my values', 'important to me', 'I believe in', 'my principles', 'integrity', 'non-negotiable'],
    phrases: [
      /my (values|principles|beliefs)/i,
      /(important|matters) to me/i,
      /I believe in/i,
      /my integrity/i,
      /(this is )?non-negotiable/i,
    ],
  },
  T: {
    keywords: ['honestly', 'truthfully', 'the truth is', 'to be honest', 'frankly'],
    phrases: [
      /(honestly|truthfully|frankly)/i,
      /the truth is/i,
      /to be (honest|frank)/i,
      /I('m| am) being (honest|straight|direct)/i,
      /let me be (clear|direct|honest)/i,
    ],
  },
};

// Coaching tips for missing elements
const COACHING_TIPS: Record<DBTSkill, Record<string, string>> = {
  'DEAR MAN': {
    D: 'Try describing the specific situation or facts objectively.',
    E: 'Express how you feel about this using "I feel..." statements.',
    A: 'Make your request clear - what exactly do you need?',
    R: 'Explain why your request matters - what are the benefits?',
    M: 'Stay focused on your main point if the conversation drifts.',
    A2: 'Speak with confidence - you have valid needs.',
    N: 'Consider offering alternatives or showing flexibility.',
  },
  GIVE: {
    G: 'Keep your tone gentle - avoid blame or judgment.',
    I: 'Show interest by asking questions about their perspective.',
    V: 'Validate their feelings - even if you disagree with their view.',
    E: 'Keep the conversation light and approachable.',
  },
  FAST: {
    F: 'Consider both sides - be fair to yourself AND them.',
    A: 'Don\'t over-apologize for having valid needs.',
    S: 'Stay true to your values - what matters most to you?',
    T: 'Be honest and direct about your position.',
  },
};

/**
 * Skill Element Detector Hook
 *
 * Analyzes text to detect which DBT skill elements are being used.
 * Provides real-time feedback on skill coverage.
 */
export function useSkillElementDetector(skill: DBTSkill | null) {
  const [coverage, setCoverage] = useState<SkillCoverage | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Get patterns for the current skill
  const patterns = useMemo(() => {
    if (!skill) return null;
    switch (skill) {
      case 'DEAR MAN':
        return DEAR_MAN_PATTERNS;
      case 'GIVE':
        return GIVE_PATTERNS;
      case 'FAST':
        return FAST_PATTERNS;
      default:
        return null;
    }
  }, [skill]);

  // Get element info for the current skill
  const elementInfo = useMemo(() => {
    if (!skill) return [];
    switch (skill) {
      case 'DEAR MAN':
        return [
          { letter: 'D', word: 'Describe' },
          { letter: 'E', word: 'Express' },
          { letter: 'A', word: 'Assert' },
          { letter: 'R', word: 'Reinforce' },
          { letter: 'M', word: 'Mindful' },
          { letter: 'A', word: 'Appear confident', key: 'A2' },
          { letter: 'N', word: 'Negotiate' },
        ];
      case 'GIVE':
        return [
          { letter: 'G', word: 'Gentle' },
          { letter: 'I', word: 'Interested' },
          { letter: 'V', word: 'Validate' },
          { letter: 'E', word: 'Easy manner' },
        ];
      case 'FAST':
        return [
          { letter: 'F', word: 'Fair' },
          { letter: 'A', word: 'Apologies' },
          { letter: 'S', word: 'Stick to values' },
          { letter: 'T', word: 'Truthful' },
        ];
      default:
        return [];
    }
  }, [skill]);

  /**
   * Analyze text for skill elements
   */
  const analyzeText = useCallback(
    (text: string) => {
      if (!skill || !patterns) return;

      // Combine with history for cumulative analysis
      const allText = [...history, text].join(' ');

      const elements: SkillElement[] = elementInfo.map((info) => {
        const key = info.key || info.letter;
        const pattern = patterns[key];
        if (!pattern) {
          return {
            letter: info.letter,
            word: info.word,
            detected: false,
            confidence: 0,
            matchedPhrases: [],
          };
        }

        let confidence = 0;
        const matchedPhrases: string[] = [];

        // Check keywords
        const lowerText = allText.toLowerCase();
        for (const keyword of pattern.keywords) {
          if (lowerText.includes(keyword.toLowerCase())) {
            confidence += 0.3;
            matchedPhrases.push(keyword);
          }
        }

        // Check phrases (higher weight)
        for (const phrase of pattern.phrases) {
          const match = allText.match(phrase);
          if (match) {
            confidence += 0.5;
            matchedPhrases.push(match[0]);
          }
        }

        // Cap at 1.0
        confidence = Math.min(confidence, 1);

        return {
          letter: info.letter,
          word: info.word,
          detected: confidence >= 0.3,
          confidence,
          matchedPhrases: [...new Set(matchedPhrases)],
        };
      });

      // Calculate overall coverage
      const detectedCount = elements.filter((e) => e.detected).length;
      const overallCoverage = Math.round((detectedCount / elements.length) * 100);

      // Find missing elements
      const missingElements = elements
        .filter((e) => !e.detected)
        .map((e) => e.letter);

      // Get coaching tip for first missing element
      const coachingTip =
        missingElements.length > 0 && skill
          ? COACHING_TIPS[skill]?.[missingElements[0]] || null
          : null;

      setCoverage({
        skill,
        elements,
        overallCoverage,
        missingElements,
        coachingTip,
      });
    },
    [skill, patterns, elementInfo, history]
  );

  /**
   * Add text to history for cumulative tracking
   */
  const addToHistory = useCallback((text: string) => {
    setHistory((prev) => [...prev, text]);
  }, []);

  /**
   * Reset the detector
   */
  const reset = useCallback(() => {
    setCoverage(null);
    setHistory([]);
  }, []);

  return {
    coverage,
    analyzeText,
    addToHistory,
    reset,
    elementInfo,
  };
}

/**
 * Get a simple string representation of skill coverage
 */
export function formatCoverageString(coverage: SkillCoverage): string {
  return coverage.elements
    .map((e) => (e.detected ? e.letter : '_'))
    .join(' ');
}
