'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { SpeakerDetectionSettings } from '@/types';

interface UseVADOptions {
  settings: SpeakerDetectionSettings;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onSilenceDetected?: (silenceDurationMs: number) => void;
  onTurnShouldEnd?: () => void;
  enabled?: boolean;
}

interface UseVADReturn {
  isSpeaking: boolean;
  silenceDurationMs: number;
  speakingDurationMs: number;
  volumeLevel: number;
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTurn: () => void;
  error: string | null;
}

const DEFAULT_SETTINGS: SpeakerDetectionSettings = {
  silenceThresholdMs: 2000,
  minSpeakingDurationMs: 3000,
  maxTurnDurationMs: 180000, // 3 minutes
  enableAutoPrompts: true,
};

export function useVoiceActivityDetection({
  settings = DEFAULT_SETTINGS,
  onSpeakingStart,
  onSpeakingEnd,
  onSilenceDetected,
  onTurnShouldEnd,
  enabled = true,
}: UseVADOptions): UseVADReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceDurationMs, setSilenceDurationMs] = useState(0);
  const [speakingDurationMs, setSpeakingDurationMs] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Refs for timing
  const silenceStartRef = useRef<number | null>(null);
  const speakingStartRef = useRef<number | null>(null);
  const turnStartRef = useRef<number | null>(null);
  const wasSpeakingRef = useRef(false);
  const turnEndTriggeredRef = useRef(false);

  // Voice activity threshold (adjust based on environment)
  const VOICE_THRESHOLD = 15; // Volume level that counts as "speaking"
  const SMOOTHING_FACTOR = 0.3; // For smoothing volume changes

  const smoothedVolumeRef = useRef(0);

  const resetTurn = useCallback(() => {
    setSilenceDurationMs(0);
    setSpeakingDurationMs(0);
    silenceStartRef.current = null;
    speakingStartRef.current = null;
    turnStartRef.current = Date.now();
    turnEndTriggeredRef.current = false;
    wasSpeakingRef.current = false;
  }, []);

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !enabled) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume (0-255) and normalize to 0-100
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedVolume = Math.round((average / 255) * 100);

    // Apply smoothing to reduce jitter
    smoothedVolumeRef.current =
      smoothedVolumeRef.current * (1 - SMOOTHING_FACTOR) +
      normalizedVolume * SMOOTHING_FACTOR;

    const smoothedVolume = Math.round(smoothedVolumeRef.current);
    setVolumeLevel(smoothedVolume);

    const now = Date.now();
    const currentlySpeaking = smoothedVolume >= VOICE_THRESHOLD;

    // Track speaking state changes
    if (currentlySpeaking && !wasSpeakingRef.current) {
      // Started speaking
      wasSpeakingRef.current = true;
      silenceStartRef.current = null;
      setSilenceDurationMs(0);

      if (!speakingStartRef.current) {
        speakingStartRef.current = now;
        if (!turnStartRef.current) {
          turnStartRef.current = now;
        }
        onSpeakingStart?.();
      }
      setIsSpeaking(true);
    } else if (!currentlySpeaking && wasSpeakingRef.current) {
      // Stopped speaking - start silence timer
      wasSpeakingRef.current = false;

      if (!silenceStartRef.current) {
        silenceStartRef.current = now;
      }
    }

    // Update speaking duration
    if (speakingStartRef.current && wasSpeakingRef.current) {
      const duration = now - speakingStartRef.current;
      setSpeakingDurationMs(duration);
    }

    // Track silence duration
    if (silenceStartRef.current && !wasSpeakingRef.current) {
      const silenceDuration = now - silenceStartRef.current;
      setSilenceDurationMs(silenceDuration);
      onSilenceDetected?.(silenceDuration);

      // Check if silence threshold reached (turn should end)
      if (
        silenceDuration >= settings.silenceThresholdMs &&
        speakingDurationMs >= settings.minSpeakingDurationMs &&
        !turnEndTriggeredRef.current
      ) {
        turnEndTriggeredRef.current = true;
        setIsSpeaking(false);
        onSpeakingEnd?.();
        onTurnShouldEnd?.();
      }
    }

    // Check max turn duration
    if (
      turnStartRef.current &&
      now - turnStartRef.current >= settings.maxTurnDurationMs &&
      !turnEndTriggeredRef.current
    ) {
      turnEndTriggeredRef.current = true;
      setIsSpeaking(false);
      onSpeakingEnd?.();
      onTurnShouldEnd?.();
    }

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [
    enabled,
    settings.silenceThresholdMs,
    settings.minSpeakingDurationMs,
    settings.maxTurnDurationMs,
    speakingDurationMs,
    onSpeakingStart,
    onSpeakingEnd,
    onSilenceDetected,
    onTurnShouldEnd,
  ]);

  const startListening = useCallback(async () => {
    if (!enabled) return;

    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsListening(true);
      resetTurn();

      processAudio();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(message);
      console.error('VAD error:', err);
    }
  }, [enabled, processAudio, resetTurn]);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setVolumeLevel(0);
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSpeaking,
    silenceDurationMs,
    speakingDurationMs,
    volumeLevel,
    isListening,
    startListening,
    stopListening,
    resetTurn,
    error,
  };
}
