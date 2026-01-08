// Core types for Mediator application

export type ParticipantRole = 'speaker' | 'listener' | 'observer';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  isConnected: boolean;
  language: 'en' | 'es';
  isObserver?: boolean;
}

export interface ObserverSettings {
  canViewTranscript: boolean;
  canViewSpeakingTime: boolean;
  canViewTriggerAlerts: boolean;
  canExportData: boolean;
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

export interface ConversationSettings {
  turnDurationSeconds: number;  // Default: 90
  maxRounds: number;            // 0 = unlimited
  enableVolumeAlerts: boolean;  // Default: true
  enableBreathingExercise: boolean; // Default: true
}

export interface SpeakingTimeRecord {
  participantId: string;
  totalSeconds: number;
  turnCount: number;
}

export interface SessionState {
  sessionId: string;
  sessionCode: string;
  phase: SessionPhase;
  participants: Participant[];
  observers: Participant[];
  currentParticipantId: string | null; // The local user's participant ID
  currentSpeakerId: string | null;
  roundNumber: number;
  turnTimeSeconds: number;
  turnStartedAt: number | null;
  settings: ConversationSettings;
  observerSettings: ObserverSettings;
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
  speakingTime: SpeakingTimeRecord[];
  isObserverMode: boolean;
}

export interface SessionActions {
  // Setup actions
  createSession: (hostName: string, language: 'en' | 'es') => void;
  joinSession: (code: string, guestName: string, language: 'en' | 'es') => void;
  joinAsObserver: (code: string, observerName: string) => void;
  setIntention: (participantId: string, intention: string) => void;
  addCustomTrigger: (trigger: TriggerWord) => void;
  updateObserverSettings: (settings: Partial<ObserverSettings>) => void;

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

// ============================================
// TRANSCRIPTION TYPES
// ============================================

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface TranscriptionSegment {
  id: string;
  text: string;
  words: TranscriptionWord[];
  speaker: number;
  speakerName?: string;
  start: number;
  end: number;
  isFinal: boolean;
  confidence: number;
}

export interface TranscriptionState {
  isActive: boolean;
  segments: TranscriptionSegment[];
  currentSegment: TranscriptionSegment | null;
  speakers: Map<number, string>; // speaker ID -> participant name
  error: string | null;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface ConversationMetrics {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  duration: number;

  // Aggregate metrics
  speakingBalance: number;        // 0-1, where 0.5 is perfectly balanced
  interruptionCount: number;
  averageTurnDuration: number;
  pauseCount: number;
  triggerCount: number;
  breathingExercisesCompleted: number;

  // Outcome
  endReason: 'completed' | 'ended_early' | 'disconnected';
  agreementsMade: number;
  reflectionPromptsShown: number;
  reflectionPromptsEngaged: number;
}

export interface ParticipantMetrics {
  participantId: string;
  participantName: string;
  role: 'host' | 'guest';

  // Speaking
  totalSpeakingTime: number;
  turnCount: number;
  averageTurnDuration: number;
  longestTurn: number;

  // Behavior
  interruptionsMade: number;
  interruptionsReceived: number;
  pausesRequested: number;
  breathingExercisesCompleted: number;

  // Triggers
  triggersDetected: number;
  triggerTypes: Record<string, number>;

  // Volume
  averageVolume: number;
  volumeSpikes: number;
  volumeVariance: number;
}

export interface ConversationHealthScore {
  overall: number;              // 0-100
  communicationBalance: number; // 0-100
  emotionalRegulation: number;  // 0-100
  engagementDepth: number;      // 0-100
  safetyIndicator: number;      // 0-100
}

export interface TeamHealthScore {
  teamId: string;
  teamName: string;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: number;
  periodEnd: number;

  // Composite scores (0-100)
  overallHealth: number;
  communicationBalance: number;
  emotionalRegulation: number;
  engagementDepth: number;

  // Trends
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;

  // Aggregated stats
  sessionCount: number;
  averageDuration: number;
  completionRate: number;
  activeParticipants: number;
}

export interface AnalyticsDashboardData {
  userMetrics: ParticipantMetrics[];
  recentSessions: ConversationMetrics[];
  healthScore: ConversationHealthScore;
  trends: {
    date: string;
    score: number;
    sessions: number;
  }[];
  insights: CoachingInsight[];
}

export interface CoachingInsight {
  id: string;
  type: 'strength' | 'opportunity' | 'tip';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

// ============================================
// AUDIT & COMPLIANCE TYPES
// ============================================

export type AuditAction =
  | 'session:create'
  | 'session:join'
  | 'session:end'
  | 'session:reconnect'
  | 'turn:end'
  | 'turn:extend'
  | 'pause:request'
  | 'pause:resume'
  | 'trigger:detected'
  | 'breathing:start'
  | 'breathing:complete'
  | 'summary:generate'
  | 'summary:export'
  | 'observer:join'
  | 'observer:settings_update'
  | 'analytics:view'
  | 'analytics:export';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditAction;
  sessionId: string | null;
  sessionCode: string | null;
  actorId: string;
  actorName: string;
  actorRole: 'participant' | 'observer' | 'admin' | 'system';
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}
