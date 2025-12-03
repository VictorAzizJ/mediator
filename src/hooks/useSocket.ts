'use client';

import { useEffect, useCallback, useRef } from 'react';
import { initializeSocket, disconnectSocket, getSocket, emitEvent } from '@/lib/socket';
import { useSessionStore } from '@/store/session';
import type { SessionState, Participant } from '@/types';

interface UseSocketReturn {
  isConnected: boolean;
  createSession: (hostName: string, language: 'en' | 'es') => void;
  joinSession: (code: string, guestName: string, language: 'en' | 'es') => void;
  syncState: (data: Partial<SessionState>) => void;
  endTurn: () => void;
  extendTurn: (seconds: number) => void;
  requestPause: (reason: string) => void;
  resumeFromPause: () => void;
  startBreathing: () => void;
  completeBreathing: () => void;
  dismissReflection: () => void;
  addTranscriptEntry: (participantId: string, participantName: string, text: string) => void;
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
    }) => {
      participantIdRef.current = data.participantId;
      storeSyncState({
        sessionId: data.sessionId,
        sessionCode: data.sessionCode,
        phase: 'connecting',
      });
    };

    const handleSessionJoined = (data: {
      participantId: string;
      participants: Participant[];
      sessionId: string;
    }) => {
      participantIdRef.current = data.participantId;
      storeSyncState({
        sessionId: data.sessionId,
        participants: data.participants,
        phase: 'pre-conversation',
      });
    };

    const handleSessionUpdated = (data: Partial<SessionState>) => {
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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('session:created', handleSessionCreated);
    socket.on('session:joined', handleSessionJoined);
    socket.on('session:updated', handleSessionUpdated);
    socket.on('session:error', handleSessionError);
    socket.on('participant:disconnected', handleParticipantDisconnected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('session:created', handleSessionCreated);
      socket.off('session:joined', handleSessionJoined);
      socket.off('session:updated', handleSessionUpdated);
      socket.off('session:error', handleSessionError);
      socket.off('participant:disconnected', handleParticipantDisconnected);
      disconnectSocket();
    };
  }, [storeSyncState]);

  const createSession = useCallback((hostName: string, language: 'en' | 'es') => {
    emitEvent('session:create', { hostName, language });
  }, []);

  const joinSession = useCallback((code: string, guestName: string, language: 'en' | 'es') => {
    emitEvent('session:join', { code: code.toUpperCase(), guestName, language });
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

  const addTranscriptEntry = useCallback(
    (participantId: string, participantName: string, text: string) => {
      emitEvent('transcript:add', { participantId, participantName, text });
    },
    []
  );

  return {
    isConnected: isConnectedRef.current,
    createSession,
    joinSession,
    syncState,
    endTurn,
    extendTurn,
    requestPause,
    resumeFromPause,
    startBreathing,
    completeBreathing,
    dismissReflection,
    addTranscriptEntry,
  };
}

// Hook to get current participant
export function useCurrentParticipant(): Participant | null {
  const participants = useSessionStore((state) => state.participants);
  // In a real app, we'd store the participantId in localStorage or context
  // For now, return the first participant as the "current" one in demo mode
  return participants[0] || null;
}
