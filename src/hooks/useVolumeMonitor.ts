'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseVolumeMonitorOptions {
  onHighVolume?: (level: number) => void;
  onVolumeChange?: (level: number) => void;
  highVolumeThreshold?: number;
  sustainedHighVolumeDuration?: number; // ms
}

interface UseVolumeMonitorReturn {
  volumeLevel: number;
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  error: string | null;
}

export function useVolumeMonitor({
  onHighVolume,
  onVolumeChange,
  highVolumeThreshold = 75,
  sustainedHighVolumeDuration = 10000,
}: UseVolumeMonitorOptions = {}): UseVolumeMonitorReturn {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const highVolumeStartRef = useRef<number | null>(null);
  const hasTriggeredHighVolumeRef = useRef(false);

  const processAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume (0-255) and normalize to 0-100
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedVolume = Math.round((average / 255) * 100);

    setVolumeLevel(normalizedVolume);
    onVolumeChange?.(normalizedVolume);

    // Check for sustained high volume
    if (normalizedVolume >= highVolumeThreshold) {
      if (!highVolumeStartRef.current) {
        highVolumeStartRef.current = Date.now();
      } else if (
        !hasTriggeredHighVolumeRef.current &&
        Date.now() - highVolumeStartRef.current >= sustainedHighVolumeDuration
      ) {
        hasTriggeredHighVolumeRef.current = true;
        onHighVolume?.(normalizedVolume);
      }
    } else {
      // Reset if volume drops
      highVolumeStartRef.current = null;
      hasTriggeredHighVolumeRef.current = false;
    }

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [onVolumeChange, onHighVolume, highVolumeThreshold, sustainedHighVolumeDuration]);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsListening(true);

      // Start processing
      processAudio();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(message);
      console.error('Volume monitor error:', err);
    }
  }, [processAudio]);

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
    highVolumeStartRef.current = null;
    hasTriggeredHighVolumeRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    volumeLevel,
    isListening,
    startListening,
    stopListening,
    error,
  };
}
