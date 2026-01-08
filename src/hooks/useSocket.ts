'use client';

import { useEffect, useCallback, useRef } from 'react';
import { initializeSocket, disconnectSocket, getSocket, emitEvent } from '@/lib/socket';
import { useSessionStore } from '@/store/session';
import type { SessionState, Participant, ConversationSettings } from '@/types';

interface UseSocketReturn {
  isConnected: boolean;
  createSession: (hostName: string, language: 'en' | 'es', settings: ConversationSettings) => void;
  joinSession: (code: string, guestName: string, language: 'en' | 'es') => void;
  joinAsObserver: (code: string, observerName: string) => void;
  reconnectSession: (sessionCode: string, participantId: string) => void;
  syncState: (data: Partial<SessionState>) => void;
  endTurn: () => void;
  extendTurn: (seconds: number) => void;
  requestPause: (reason: string) => void;
  resumeFromPause: () => void;
  startBreathing: () => void;
  completeBreathing: () => void;
  dismissReflection: () => void;
  endConversation: () => void;
  addTranscriptEntry: (participantId: string, participantName: string, text: string) => void;
  updateObserverSettings: (settings: Partial<import('@/types').ObserverSettings>) => void;
}

export function useSocket(): UseSocketReturn {
  const isConnectedRef = useRef(false);
  const participantIdRef = useRef<string | null>(null);

  const {
    syncState: storeSyncState,
    phase,
  } = useSessionStore();

  // Initialize socket and set up listeners
  useEffect(() => {
    const socket = initializeSocket();

    const handleConnect = () => {
      isConnectedRef.current = true;
    };

    const handleDisconnect = () => {
      isConnectedRef.current = false;
    };

    const handleSessionCreated = (data: {
      sessionId: string;
      sessionCode: string;
      participantId: string;
      participants: Participant[];
      settings?: ConversationSettings;
      turnTimeSeconds?: number;
    }) => {
      participantIdRef.current = data.participantId;
      storeSyncState({
        sessionId: data.sessionId,
        sessionCode: data.sessionCode,
        currentParticipantId: data.participantId,
        participants: data.participants,
        phase: 'connecting',
        ...(data.settings && { settings: data.settings }),
        ...(data.turnTimeSeconds && { turnTimeSeconds: data.turnTimeSeconds }),
      });
    };

    const handleSessionJoined = (data: {
      participantId: string;
      participants: Participant[];
      sessionId: string;
      settings?: ConversationSettings;
      turnTimeSeconds?: number;
    }) => {
      participantIdRef.current = data.participantId;
      storeSyncState({
        sessionId: data.sessionId,
        participants: data.participants,
        currentParticipantId: data.participantId,
        phase: 'pre-conversation',
        ...(data.settings && { settings: data.settings }),
        ...(data.turnTimeSeconds && { turnTimeSeconds: data.turnTimeSeconds }),
      });
    };

    const handleSessionUpdated = (data: Partial<SessionState>) => {
      // If server sends turnStartedAt, convert to local time to avoid clock skew
      if (data.turnStartedAt) {
        // Use client's current time as the turn start
        data.turnStartedAt = Date.now();
      }
      storeSyncState(data);
    };

    const handleSessionError = (message: string) => {
      console.error('Session error:', message);
      // Could add toast notification here
    };

    const handleParticipantDisconnected = (participantId: string) => {
      console.log('Participant disconnected:', participantId);
      // Could update UI to show disconnection status
    };

    const handleSessionReconnected = (data: {
      session: SessionState;
      participantId: string;
    }) => {
      participantIdRef.current = data.participantId;
      // Restore full session state
      storeSyncState({
        ...data.session,
        currentParticipantId: data.participantId,
      });
      console.log('Session reconnected successfully');
    };

    const handleParticipantReconnected = (participantId: string) => {
      console.log('Participant reconnected:', participantId);
      // Could update UI to show reconnection status
    };

    const handleObserverJoined = (data: {
      sessionId: string;
      phase: SessionState['phase'];
      participants: Participant[];
      observers: Participant[];
      observerId: string;
      observerSettings: SessionState['observerSettings'];
      roundNumber: number;
      currentSpeakerId: string | null;
      turnStartedAt: number | null;
      turnTimeSeconds: number;
      isObserverMode: boolean;
      transcript?: SessionState['transcript'];
      speakingTime?: SessionState['speakingTime'];
    }) => {
      participantIdRef.current = data.observerId;
      storeSyncState({
        sessionId: data.sessionId,
        phase: data.phase,
        participants: data.participants,
        observers: data.observers,
        currentParticipantId: data.observerId,
        observerSettings: data.observerSettings,
        roundNumber: data.roundNumber,
        currentSpeakerId: data.currentSpeakerId,
        turnStartedAt: data.turnStartedAt,
        turnTimeSeconds: data.turnTimeSeconds,
        isObserverMode: true,
        ...(data.transcript && { transcript: data.transcript }),
        ...(data.speakingTime && { speakingTime: data.speakingTime }),
      });
    };

    const handleObserverConnected = (data: {
      observerId: string;
      observerName: string;
      observerCount: number;
    }) => {
      console.log('Observer connected:', data.observerName, `(${data.observerCount} total)`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('session:created', handleSessionCreated);
    socket.on('session:joined', handleSessionJoined);
    socket.on('session:updated', handleSessionUpdated);
    socket.on('session:error', handleSessionError);
    socket.on('session:reconnected', handleSessionReconnected);
    socket.on('participant:disconnected', handleParticipantDisconnected);
    socket.on('participant:reconnected', handleParticipantReconnected);
    socket.on('observer:joined', handleObserverJoined);
    socket.on('observer:connected', handleObserverConnected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('session:created', handleSessionCreated);
      socket.off('session:joined', handleSessionJoined);
      socket.off('session:updated', handleSessionUpdated);
      socket.off('session:error', handleSessionError);
      socket.off('session:reconnected', handleSessionReconnected);
      socket.off('participant:disconnected', handleParticipantDisconnected);
      socket.off('participant:reconnected', handleParticipantReconnected);
      socket.off('observer:joined', handleObserverJoined);
      socket.off('observer:connected', handleObserverConnected);
      disconnectSocket();
    };
  }, [storeSyncState]);

  const createSession = useCallback((hostName: string, language: 'en' | 'es', settings: ConversationSettings) => {
    emitEvent('session:create', { hostName, language, settings });
  }, []);

  const joinSession = useCallback((code: string, guestName: string, language: 'en' | 'es') => {
    emitEvent('session:join', { code: code.toUpperCase(), guestName, language });
  }, []);

  const joinAsObserver = useCallback((code: string, observerName: string) => {
    emitEvent('observer:join', { code: code.toUpperCase(), observerName });
  }, []);

  const reconnectSession = useCallback((sessionCode: string, participantId: string) => {
    emitEvent('session:reconnect', { sessionCode: sessionCode.toUpperCase(), participantId });
  }, []);

  const syncState = useCallback((data: Partial<SessionState>) => {
    emitEvent('session:sync', data);
    storeSyncState(data);
  }, [storeSyncState]);

  const endTurn = useCallback(() => {
    emitEvent('turn:end');
  }, []);

  const extendTurn = useCallback((seconds: number) => {
    emitEvent('turn:extend', seconds);
  }, []);

  const requestPause = useCallback((reason: string) => {
    emitEvent('pause:request', reason);
  }, []);

  const resumeFromPause = useCallback(() => {
    emitEvent('pause:resume');
  }, []);

  const startBreathing = useCallback(() => {
    emitEvent('breathing:start');
  }, []);

  const completeBreathing = useCallback(() => {
    emitEvent('breathing:complete');
  }, []);

  const dismissReflection = useCallback(() => {
    emitEvent('reflection:dismiss');
  }, []);

  const endConversation = useCallback(() => {
    emitEvent('conversation:end');
  }, []);

  const addTranscriptEntry = useCallback(
    (participantId: string, participantName: string, text: string) => {
      emitEvent('transcript:add', { participantId, participantName, text });
    },
    []
  );

  const updateObserverSettings = useCallback(
    (settings: Partial<import('@/types').ObserverSettings>) => {
      emitEvent('observer:settings', settings);
    },
    []
  );

  return {
    isConnected: isConnectedRef.current,
    createSession,
    joinSession,
    joinAsObserver,
    reconnectSession,
    syncState,
    endTurn,
    extendTurn,
    requestPause,
    resumeFromPause,
    startBreathing,
    completeBreathing,
    dismissReflection,
    endConversation,
    addTranscriptEntry,
    updateObserverSettings,
  };
}

// Hook to get current participant
export function useCurrentParticipant(): Participant | null {
  const participants = useSessionStore((state) => state.participants);
  const currentParticipantId = useSessionStore((state) => state.currentParticipantId);

  if (!currentParticipantId) return null;
  return participants.find((p) => p.id === currentParticipantId) || null;
}
