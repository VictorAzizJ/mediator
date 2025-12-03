// AI integration utilities for Mediator
// These functions are designed to be called from API routes

import type { TriggerDetection, ReflectionPrompt, ConversationSummary, TranscriptEntry, Participant } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// System message for all Mediator AI interactions
const MEDIATOR_SYSTEM_MESSAGE = `You are a compassionate conversation facilitator embedded in Mediator, a tool helping families have difficult conversations. Your role is to:

- Never take sides or assign blame
- Use trauma-informed, emotionally validating language
- Recognize that both participants are doing something brave
- Avoid clinical/therapeutic language—use warm, accessible words
- Honor cultural differences in communication styles
- Prioritize emotional safety over "resolution"

You will receive conversation segments and respond with specific outputs as requested. Never provide therapy advice or diagnoses.`;

// Trigger word patterns for local detection (fast, no API call needed)
const TRIGGER_PATTERNS = [
  { regex: /you always/gi, category: 'blame' as const, severity: 'medium' as const },
  { regex: /you never/gi, category: 'blame' as const, severity: 'medium' as const },
  { regex: /you made me/gi, category: 'blame' as const, severity: 'high' as const },
  { regex: /it's your fault/gi, category: 'blame' as const, severity: 'high' as const },
  { regex: /whatever/gi, category: 'dismissal' as const, severity: 'low' as const },
  { regex: /i don't care/gi, category: 'dismissal' as const, severity: 'medium' as const },
  { regex: /fine\.?$/gi, category: 'dismissal' as const, severity: 'low' as const },
  { regex: /i'm done/gi, category: 'stonewalling' as const, severity: 'medium' as const },
  { regex: /there's no point/gi, category: 'stonewalling' as const, severity: 'medium' as const },
  { regex: /why bother/gi, category: 'stonewalling' as const, severity: 'medium' as const },
  { regex: /nothing ever changes/gi, category: 'catastrophizing' as const, severity: 'medium' as const },
  { regex: /this always happens/gi, category: 'catastrophizing' as const, severity: 'medium' as const },
  { regex: /you're just like/gi, category: 'contempt' as const, severity: 'high' as const },
];

// Suggested reframes for common trigger patterns
const REFRAME_SUGGESTIONS: Record<string, string> = {
  'you always': "I've noticed a pattern that concerns me...",
  'you never': "I feel like I haven't been getting...",
  'you made me': "When that happened, I felt...",
  "it's your fault": "I'm struggling with the outcome of...",
  'whatever': "I need a moment to collect my thoughts...",
  "i don't care": "I'm feeling overwhelmed right now...",
  "i'm done": "I need a break before we continue...",
  "there's no point": "I'm feeling discouraged because...",
  'nothing ever changes': "I've been hoping for change in...",
  'this always happens': "This situation feels familiar, and it brings up...",
};

/**
 * Local trigger detection (no API call, instant)
 */
export function detectTriggersLocal(text: string): TriggerDetection {
  const normalizedText = text.toLowerCase();

  for (const pattern of TRIGGER_PATTERNS) {
    if (pattern.regex.test(normalizedText)) {
      // Find the matching phrase for reframe suggestion
      const match = normalizedText.match(pattern.regex);
      const matchedPhrase = match ? match[0].toLowerCase() : '';

      // Find reframe suggestion
      let suggestedReframe = '';
      for (const [trigger, reframe] of Object.entries(REFRAME_SUGGESTIONS)) {
        if (matchedPhrase.includes(trigger)) {
          suggestedReframe = reframe;
          break;
        }
      }

      return {
        detected: true,
        patternType: pattern.category,
        severity: pattern.severity,
        suggestedIntervention: suggestedReframe ||
          "Let's pause and try expressing this differently.",
        originalText: text,
      };
    }
  }

  return {
    detected: false,
    patternType: null,
    severity: 'low',
    suggestedIntervention: '',
    originalText: text,
  };
}

/**
 * Generate a reflection prompt based on what was just said
 */
export function generateReflectionPromptLocal(
  speakerName: string,
  listenerName: string,
  spokenText: string
): ReflectionPrompt {
  // Template-based reflection prompts
  const templates = [
    `What feeling might be underneath what ${speakerName} just shared?`,
    `Before responding, consider: what might ${speakerName} need from you right now?`,
    `Take a moment to reflect: what matters most to ${speakerName} in what they said?`,
    `What would it feel like to be in ${speakerName}'s position right now?`,
    `What's one thing you heard that you want ${speakerName} to know you understood?`,
  ];

  // Select a template based on content analysis
  let selectedTemplate = templates[0];

  // If the speech mentioned feelings, ask about needs
  if (/feel|felt|feeling|hurt|sad|angry|frustrated|worried/i.test(spokenText)) {
    selectedTemplate = `What might ${speakerName} need from you that's different from what you've been offering?`;
  }

  // If the speech was about actions/events, ask about feelings
  if (/did|happened|when you|last time|yesterday|always do/i.test(spokenText)) {
    selectedTemplate = templates[0];
  }

  // If the speech mentioned wants/needs, ask about perspective
  if (/want|need|wish|hope|just want/i.test(spokenText)) {
    selectedTemplate = `What might make it hard for ${speakerName} to get what they're asking for?`;
  }

  return {
    id: uuidv4(),
    text: selectedTemplate,
    forParticipantId: '', // Will be filled in by caller
    inResponseTo: spokenText.substring(0, 100),
    dismissed: false,
  };
}

/**
 * Generate a conversation summary (template-based for demo)
 */
export function generateSummaryLocal(
  transcript: TranscriptEntry[],
  participants: Participant[],
  intentions: { participantId: string; intention: string }[]
): ConversationSummary {
  // Extract topics from transcript
  const allText = transcript.map((t) => t.text).join(' ');
  const topics: string[] = [];

  // Simple topic extraction based on keywords
  if (/communicat|talk|listen|hear/i.test(allText)) {
    topics.push('Communication patterns that haven\'t been working');
  }
  if (/space|time|alone|breathe/i.test(allText)) {
    topics.push('Need for personal space and boundaries');
  }
  if (/worry|concern|scared|afraid/i.test(allText)) {
    topics.push('Underlying worries and concerns');
  }
  if (/love|care|support|there for/i.test(allText)) {
    topics.push('Expressions of care and support');
  }
  if (/change|different|better|improve/i.test(allText)) {
    topics.push('Hopes for change going forward');
  }

  // Default topics if none detected
  if (topics.length === 0) {
    topics.push(
      'Feelings that have been difficult to express',
      'Understanding each other\'s perspectives',
      'Ways to move forward together'
    );
  }

  // Generate participant expressions
  const participantExpressions = participants.map((p) => {
    const theirEntries = transcript.filter((t) => t.participantId === p.id);
    const intention = intentions.find((i) => i.participantId === p.id);

    let summary = '';
    if (theirEntries.length > 0) {
      const hasEmotionalContent = theirEntries.some((e) =>
        /feel|felt|feeling|hurt|sad|angry|worried|scared|love|care/i.test(e.text)
      );
      const hasRequestContent = theirEntries.some((e) =>
        /want|need|wish|hope|please|would you/i.test(e.text)
      );

      if (hasEmotionalContent && hasRequestContent) {
        summary = `${p.name} shared their feelings and expressed what they need going forward.`;
      } else if (hasEmotionalContent) {
        summary = `${p.name} opened up about how they've been feeling.`;
      } else if (hasRequestContent) {
        summary = `${p.name} expressed what they're hoping for.`;
      } else {
        summary = `${p.name} shared their perspective on the situation.`;
      }

      if (intention) {
        summary += ` Their intention was for the other person to understand: "${intention.intention}"`;
      }
    } else {
      summary = `${p.name} participated in the conversation.`;
    }

    return {
      participantId: p.id,
      participantName: p.name,
      summary,
    };
  });

  // Generate agreements (template-based)
  const agreements: string[] = [];
  if (/try|will|going to|promise|commit/i.test(allText)) {
    agreements.push('Both agreed to approach future conversations with more patience');
  }
  if (/listen|hear|understand/i.test(allText)) {
    agreements.push('Commitment to listen without immediately trying to fix things');
  }

  // Generate open questions
  const openQuestions: string[] = [];
  if (/how|what if|when|why/i.test(allText)) {
    openQuestions.push('How to rebuild trust and connection');
  }
  openQuestions.push('Topics to revisit when both feel ready');

  return {
    id: uuidv4(),
    createdAt: Date.now(),
    topicsDiscussed: topics,
    participantExpressions,
    agreements,
    openQuestions,
    privateNotes: [],
  };
}

// API endpoint request types for when using Claude API
export interface TriggerDetectionRequest {
  text: string;
  customTriggers?: string[];
}

export interface ReflectionPromptRequest {
  speakerName: string;
  listenerName: string;
  transcriptSegment: string;
}

export interface SummarizationRequest {
  transcript: TranscriptEntry[];
  participants: Participant[];
  intentions: { participantId: string; intention: string }[];
}
