'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { SpeakerDetectionSettings } from '@/types';

// Types for @ricky0123/vad-web
interface MicVADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audio: Float32Array) => void;
  onVADMisfire?: () => void;
  positiveSpeechThreshold?: number;
  negativeSpeechThreshold?: number;
  minSpeechFrames?: number;
  preSpeechPadFrames?: number;
  redemptionFrames?: number;
}

interface MicVAD {
  start: () => void;
  pause: () => void;
  destroy: () => void;
  listening: boolean;
}

interface UseSileroVADOptions {
  settings: SpeakerDetectionSettings;
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioData: Float32Array) => void;
  onSpeechAudio?: (audioData: Float32Array) => void;
  onTurnShouldEnd?: () => void;
  enabled?: boolean;
}

interface UseSileroVADReturn {
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  speakingDurationMs: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTurn: () => void;
  error: string | null;
}

const DEFAULT_SETTINGS: SpeakerDetectionSettings = {
  silenceThresholdMs: 2000,
  minSpeakingDurationMs: 3000,
  maxTurnDurationMs: 180000,
  enableAutoPrompts: true,
};

/**
 * Silero VAD Hook - ML-based Voice Activity Detection
 *
 * Uses the Silero VAD model (ONNX) running in WebAssembly for
 * high-accuracy speech detection with low false positives.
 *
 * Advantages over threshold-based VAD:
 * - 96%+ accuracy in detecting speech vs noise
 * - Works well in noisy environments
 * - Handles pauses within speech naturally
 * - Low latency (~100ms)
 */
export function useSileroVAD({
  settings = DEFAULT_SETTINGS,
  onSpeechStart,
  onSpeechEnd,
  onSpeechAudio,
  onTurnShouldEnd,
  enabled = true,
}: UseSileroVADOptions): UseSileroVADReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingDurationMs, setSpeakingDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const vadRef = useRef<MicVAD | null>(null);
  const speakingStartRef = useRef<number | null>(null);
  const turnStartRef = useRef<number | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const turnEndTriggeredRef = useRef(false);

  const resetTurn = useCallback(() => {
    setSpeakingDurationMs(0);
    speakingStartRef.current = null;
    turnStartRef.current = Date.now();
    turnEndTriggeredRef.current = false;
  }, []);

  const handleSpeechStart = useCallback(() => {
    setIsSpeaking(true);
    speakingStartRef.current = Date.now();

    if (!turnStartRef.current) {
      turnStartRef.current = Date.now();
    }

    // Start tracking speaking duration
    speakingIntervalRef.current = setInterval(() => {
      if (speakingStartRef.current) {
        setSpeakingDurationMs(Date.now() - speakingStartRef.current);
      }
    }, 100);

    onSpeechStart?.();
  }, [onSpeechStart]);

  const handleSpeechEnd = useCallback((audioData: Float32Array) => {
    setIsSpeaking(false);

    // Clear the interval
    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = null;
    }

    // Calculate final speaking duration
    const finalDuration = speakingStartRef.current
      ? Date.now() - speakingStartRef.current
      : 0;
    setSpeakingDurationMs(finalDuration);

    // Notify listeners with the audio data
    onSpeechEnd?.(audioData);
    onSpeechAudio?.(audioData);

    // Check if turn should end (met minimum speaking requirement)
    if (
      finalDuration >= settings.minSpeakingDurationMs &&
      !turnEndTriggeredRef.current
    ) {
      // Wait for silence threshold before ending turn
      setTimeout(() => {
        if (!turnEndTriggeredRef.current && !vadRef.current?.listening) {
          return; // VAD was stopped
        }
        // If still not speaking after silence threshold, end turn
        turnEndTriggeredRef.current = true;
        onTurnShouldEnd?.();
      }, settings.silenceThresholdMs);
    }

    // Check max turn duration
    if (
      turnStartRef.current &&
      Date.now() - turnStartRef.current >= settings.maxTurnDurationMs &&
      !turnEndTriggeredRef.current
    ) {
      turnEndTriggeredRef.current = true;
      onTurnShouldEnd?.();
    }
  }, [
    settings.silenceThresholdMs,
    settings.minSpeakingDurationMs,
    settings.maxTurnDurationMs,
    onSpeechEnd,
    onSpeechAudio,
    onTurnShouldEnd,
  ]);

  const startListening = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dynamically import vad-web (it's a large WASM module)
      const vad = await import('@ricky0123/vad-web');

      // Create the VAD instance
      const micVAD = await vad.MicVAD.new({
        onSpeechStart: handleSpeechStart,
        onSpeechEnd: handleSpeechEnd,
        // Silero VAD specific settings (using milliseconds)
        positiveSpeechThreshold: 0.8, // Higher = more confident speech detection
        negativeSpeechThreshold: 0.35, // Lower = more sensitive to speech end
        minSpeechMs: 250, // Minimum milliseconds to count as speech
        preSpeechPadMs: 300, // Milliseconds to include before speech
        redemptionMs: 500, // Milliseconds of silence allowed within speech
      });

      vadRef.current = micVAD;
      micVAD.start();

      setIsListening(true);
      setIsLoading(false);
      resetTurn();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize Silero VAD';
      setError(message);
      setIsLoading(false);
      console.error('Silero VAD error:', err);

      // Fallback hint
      if (message.includes('getUserMedia')) {
        setError('Microphone access denied. Please allow microphone access and try again.');
      }
    }
  }, [enabled, handleSpeechStart, handleSpeechEnd, resetTurn]);

  const stopListening = useCallback(() => {
    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = null;
    }

    if (vadRef.current) {
      vadRef.current.pause();
      vadRef.current.destroy();
      vadRef.current = null;
    }

    setIsListening(false);
    setIsSpeaking(false);
    setSpeakingDurationMs(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSpeaking,
    isListening,
    isLoading,
    speakingDurationMs,
    startListening,
    stopListening,
    resetTurn,
    error,
  };
}

/**
 * Helper to convert Float32Array audio to WAV blob for playback/upload
 */
export function audioToWav(audioData: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + audioData.length * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + audioData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, audioData.length * 2, true);

  // Convert float samples to 16-bit PCM
  const offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
