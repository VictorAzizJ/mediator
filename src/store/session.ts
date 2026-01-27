'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  SessionState,
  SessionActions,
  Participant,
  TranscriptEntry,
  ReflectionPrompt,
  TriggerDetection,
  ConversationSummary,
  TriggerWord,
  PauseReason,
  ConversationSettings,
  ObserverSettings,
  ConversationMode,
} from '@/types';

const defaultSettings: ConversationSettings = {
  turnDurationSeconds: 90,
  maxRounds: 0, // 0 = unlimited
  enableVolumeAlerts: true,
  enableBreathingExercise: true,
  conversationMode: 'rounds',
};

const defaultObserverSettings: ObserverSettings = {
  canViewTranscript: true,
  canViewSpeakingTime: true,
  canViewTriggerAlerts: true,
  canExportData: true,
};

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const initialState: SessionState = {
  sessionId: '',
  sessionCode: '',
  phase: 'setup',
  participants: [],
  observers: [],
  currentParticipantId: null,
  currentSpeakerId: null,
  roundNumber: 0,
  turnTimeSeconds: 90,
  turnStartedAt: null,
  settings: defaultSettings,
  observerSettings: defaultObserverSettings,
  transcript: [],
  currentReflectionPrompt: null,
  pauseReason: null,
  volumeLevel: 0,
  customTriggers: [],
  summary: null,
  intentions: [],
  speakingTime: [],
  isObserverMode: false,
  selectedSkillTemplate: null,
  skillLearningComplete: false,
};

export const useSessionStore = create<SessionState & SessionActions>((set, get) => ({
  ...initialState,

  // Setup actions
  createSession: (hostName: string, language: 'en' | 'es') => {
    const sessionId = uuidv4();
    const sessionCode = generateSessionCode();
    const hostId = uuidv4();

    const host: Participant = {
      id: hostId,
      name: hostName,
      role: 'speaker',
      isConnected: true,
      language,
    };

    set({
      sessionId,
      sessionCode,
      phase: 'connecting',
      participants: [host],
    });
  },

  joinSession: (code: string, guestName: string, language: 'en' | 'es') => {
    const guestId = uuidv4();
    const guest: Participant = {
      id: guestId,
      name: guestName,
      role: 'listener',
      isConnected: true,
      language,
    };

    set((state) => ({
      participants: [...state.participants, guest],
      phase: 'pre-conversation',
    }));
  },

  joinAsObserver: (code: string, observerName: string) => {
    const observerId = uuidv4();
    const observer: Participant = {
      id: observerId,
      name: observerName,
      role: 'observer',
      isConnected: true,
      language: 'en',
      isObserver: true,
    };

    set((state) => ({
      observers: [...state.observers, observer],
      currentParticipantId: observerId,
      isObserverMode: true,
    }));
  },

  setIntention: (participantId: string, intention: string) => {
    set((state) => ({
      intentions: [
        ...state.intentions.filter((i) => i.participantId !== participantId),
        { participantId, intention },
      ],
    }));
  },

  addCustomTrigger: (trigger: TriggerWord) => {
    set((state) => ({
      customTriggers: [...state.customTriggers, trigger],
    }));
  },

  updateObserverSettings: (settings: Partial<ObserverSettings>) => {
    set((state) => ({
      observerSettings: {
        ...state.observerSettings,
        ...settings,
      },
    }));
  },

  // Phase transitions
  startPreConversation: () => {
    set({ phase: 'pre-conversation' });
  },

  startBreathing: () => {
    set({ phase: 'breathing' });
  },

  startConversation: () => {
    const { participants, settings } = get();
    const firstSpeaker = participants[0];

    set({
      phase: 'active',
      roundNumber: 1,
      currentSpeakerId: firstSpeaker?.id || null,
      turnStartedAt: Date.now(),
      turnTimeSeconds: settings.turnDurationSeconds,
    });
  },

  pauseConversation: (reason: PauseReason) => {
    set({
      phase: 'paused',
      pauseReason: reason,
      turnStartedAt: null,
    });
  },

  resumeConversation: () => {
    set({
      phase: 'active',
      pauseReason: null,
      turnStartedAt: Date.now(),
    });
  },

  startClosing: () => {
    set({ phase: 'closing' });
  },

  endConversation: () => {
    set({ phase: 'summary' });
  },

  // Turn management
  startTurn: (participantId: string) => {
    const { settings } = get();
    set((state) => ({
      currentSpeakerId: participantId,
      turnStartedAt: Date.now(),
      // Reset turn duration to base setting at start of each turn
      turnTimeSeconds: settings.turnDurationSeconds,
      participants: state.participants.map((p) => ({
        ...p,
        role: p.isObserver ? 'observer' : (p.id === participantId ? 'speaker' : 'listener'),
      })),
    }));
  },

  endTurn: () => {
    const { participants, currentSpeakerId, roundNumber, settings } = get();
    const currentIndex = participants.findIndex((p) => p.id === currentSpeakerId);
    const nextIndex = (currentIndex + 1) % participants.length;
    const nextSpeaker = participants[nextIndex];

    // Increment round when we cycle back to first speaker
    const newRound = nextIndex === 0 ? roundNumber + 1 : roundNumber;

    set({
      phase: 'reflection',
      currentSpeakerId: nextSpeaker?.id || null,
      roundNumber: newRound,
      turnStartedAt: null,
      // Reset turn duration to base setting for next turn
      turnTimeSeconds: settings.turnDurationSeconds,
    });
  },

  extendTurn: (seconds: number) => {
    set((state) => ({
      turnTimeSeconds: state.turnTimeSeconds + seconds,
    }));
  },

  passTurn: () => {
    get().endTurn();
  },

  // Transcript
  addTranscriptEntry: (entry: Omit<TranscriptEntry, 'id' | 'timestamp' | 'roundNumber'>) => {
    const { roundNumber } = get();
    const fullEntry: TranscriptEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: Date.now(),
      roundNumber,
    };

    set((state) => ({
      transcript: [...state.transcript, fullEntry],
    }));
  },

  // Prompts & Triggers
  setReflectionPrompt: (prompt: ReflectionPrompt) => {
    set({
      currentReflectionPrompt: prompt,
      phase: 'reflection',
    });
  },

  dismissReflectionPrompt: () => {
    const { settings } = get();
    set({
      currentReflectionPrompt: null,
      phase: 'active',
      turnStartedAt: Date.now(),
      turnTimeSeconds: settings.turnDurationSeconds,
    });
  },

  handleTriggerDetection: (detection: TriggerDetection) => {
    if (detection.detected && detection.severity !== 'low') {
      set({
        phase: 'paused',
        pauseReason: 'trigger-detected',
      });
    }
  },

  // Volume
  updateVolumeLevel: (level: number) => {
    const { phase } = get();
    set({ volumeLevel: level });

    // Auto-pause if volume is high for extended period
    if (level > 80 && phase === 'active') {
      // This would be handled by a separate volume monitoring hook
    }
  },

  // Summary
  setSummary: (summary: ConversationSummary) => {
    set({ summary, phase: 'ended' });
  },

  addPrivateNote: (participantId: string, note: string) => {
    set((state) => {
      if (!state.summary) return state;

      return {
        summary: {
          ...state.summary,
          privateNotes: [
            ...state.summary.privateNotes,
            { participantId, note },
          ],
        },
      };
    });
  },

  // Sync
  syncState: (newState: Partial<SessionState>) => {
    set((state) => ({ ...state, ...newState }));
  },

  resetSession: () => {
    set(initialState);
  },
}));
