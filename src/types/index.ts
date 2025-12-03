// Core types for Mediator application

export type ParticipantRole = 'speaker' | 'listener';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  isConnected: boolean;
  language: 'en' | 'es';
}

export interface TriggerWord {
  pattern: string;
  category: 'blame' | 'dismissal' | 'contempt' | 'stonewalling' | 'catastrophizing';
  severity: 'low' | 'medium' | 'high';
}

export interface TranscriptEntry {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: number;
  roundNumber: number;
}

export interface ReflectionPrompt {
  id: string;
  text: string;
  forParticipantId: string;
  inResponseTo: string;
  dismissed: boolean;
}

export interface TriggerDetection {
  detected: boolean;
  patternType: string | null;
  severity: 'low' | 'medium' | 'high';
  suggestedIntervention: string;
  originalText: string;
}

export interface ConversationSummary {
  id: string;
  createdAt: number;
  topicsDiscussed: string[];
  participantExpressions: {
    participantId: string;
    participantName: string;
    summary: string;
  }[];
  agreements: string[];
  openQuestions: string[];
  privateNotes: {
    participantId: string;
    note: string;
  }[];
}

export type SessionPhase =
  | 'setup'           // Initial setup, entering names and preferences
  | 'connecting'      // Waiting for other participant to join
  | 'pre-conversation' // Setting intentions, custom triggers
  | 'breathing'       // Synced breathing before starting
  | 'active'          // Conversation in progress
  | 'paused'          // Temporary pause (trigger detected, volume escalation)
  | 'reflection'      // Showing reflection prompt
  | 'closing'         // Final round
  | 'summary'         // Generating and reviewing summary
  | 'ended';          // Conversation complete

export type PauseReason =
  | 'trigger-detected'
  | 'volume-escalation'
  | 'user-requested'
  | 'breathing-exercise';

export interface SessionState {
  sessionId: string;
  sessionCode: string;
  phase: SessionPhase;
  participants: Participant[];
  currentSpeakerId: string | null;
  roundNumber: number;
  turnTimeSeconds: number;
  turnStartedAt: number | null;
  transcript: TranscriptEntry[];
  currentReflectionPrompt: ReflectionPrompt | null;
  pauseReason: PauseReason | null;
  volumeLevel: number; // 0-100
  customTriggers: TriggerWord[];
  summary: ConversationSummary | null;
  intentions: {
    participantId: string;
    intention: string;
  }[];
}

export interface SessionActions {
  // Setup actions
  createSession: (hostName: string, language: 'en' | 'es') => void;
  joinSession: (code: string, guestName: string, language: 'en' | 'es') => void;
  setIntention: (participantId: string, intention: string) => void;
  addCustomTrigger: (trigger: TriggerWord) => void;

  // Phase transitions
  startPreConversation: () => void;
  startBreathing: () => void;
  startConversation: () => void;
  pauseConversation: (reason: PauseReason) => void;
  resumeConversation: () => void;
  startClosing: () => void;
  endConversation: () => void;

  // Turn management
  startTurn: (participantId: string) => void;
  endTurn: () => void;
  extendTurn: (seconds: number) => void;
  passTurn: () => void;

  // Transcript
  addTranscriptEntry: (entry: Omit<TranscriptEntry, 'id' | 'timestamp' | 'roundNumber'>) => void;

  // Prompts & Triggers
  setReflectionPrompt: (prompt: ReflectionPrompt) => void;
  dismissReflectionPrompt: () => void;
  handleTriggerDetection: (detection: TriggerDetection) => void;

  // Volume
  updateVolumeLevel: (level: number) => void;

  // Summary
  setSummary: (summary: ConversationSummary) => void;
  addPrivateNote: (participantId: string, note: string) => void;

  // Sync
  syncState: (state: Partial<SessionState>) => void;
  resetSession: () => void;
}
