'use client';

import { io, Socket } from 'socket.io-client';
import type { SessionState, ConversationSettings, ObserverSettings } from '@/types';

let socket: Socket | null = null;

export interface SocketEvents {
  // Client -> Server
  'session:create': (data: { hostName: string; language: string; settings?: ConversationSettings }) => void;
  'session:join': (data: { code: string; guestName: string; language: string }) => void;
  'session:reconnect': (data: { sessionCode: string; participantId: string }) => void;
  'session:sync': (data: Partial<SessionState>) => void;
  'observer:join': (data: { code: string; observerName: string }) => void;
  'observer:settings': (settings: Partial<ObserverSettings>) => void;
  'turn:end': () => void;
  'turn:extend': (seconds: number) => void;
  'transcript:add': (data: { participantId: string; participantName: string; text: string }) => void;
  'pause:request': (reason: string) => void;
  'pause:resume': () => void;
  'breathing:start': () => void;
  'breathing:complete': () => void;
  'reflection:dismiss': () => void;
  'conversation:end': () => void;

  // Server -> Client
  'session:created': (data: { sessionId: string; sessionCode: string; participantId: string }) => void;
  'session:joined': (data: { participantId: string; participants: SessionState['participants'] }) => void;
  'session:reconnected': (data: { session: SessionState; participantId: string }) => void;
  'session:updated': (data: Partial<SessionState>) => void;
  'session:error': (message: string) => void;
  'observer:joined': (data: unknown) => void;
  'observer:connected': (data: { observerId: string; observerName: string; observerCount: number }) => void;
  'participant:connected': (data: { participantId: string; name: string }) => void;
  'participant:disconnected': (participantId: string) => void;
  'participant:reconnected': (participantId: string) => void;
}

export function getSocket(): Socket | null {
  return socket;
}

export function initializeSocket(serverUrl?: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const url = serverUrl || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  socket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Typed emit helper
export function emitEvent<K extends keyof SocketEvents>(
  event: K,
  ...args: Parameters<SocketEvents[K]>
): void {
  if (socket?.connected) {
    socket.emit(event, ...args);
  } else {
    console.warn('Socket not connected, cannot emit:', event);
  }
}

// Typed listener helper
export function onEvent<K extends keyof SocketEvents>(
  event: K,
  callback: SocketEvents[K]
): () => void {
  if (socket) {
    socket.on(event as string, callback as (...args: unknown[]) => void);
    return () => socket?.off(event as string, callback as (...args: unknown[]) => void);
  }
  return () => {};
}
