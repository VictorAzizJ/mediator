'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseVolumeMonitorOptions {
  onHighVolume?: (level: number) => void;
  onVolumeChange?: (level: number) => void;
  onAudioChunk?: (chunk: Blob) => void;
  highVolumeThreshold?: number;
  sustainedHighVolumeDuration?: number; // ms
  recordingIntervalMs?: number; // interval for recording chunks (default 1000ms)
}

interface UseVolumeMonitorReturn {
  volumeLevel: number;
  isListening: boolean;
  isRecording: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  getRecordedAudio: () => Blob | null;
  downloadRecording: (filename?: string) => void;
  error: string | null;
}

export function useVolumeMonitor({
  onHighVolume,
  onVolumeChange,
  onAudioChunk,
  highVolumeThreshold = 75,
  sustainedHighVolumeDuration = 10000,
  recordingIntervalMs = 1000,
}: UseVolumeMonitorOptions = {}): UseVolumeMonitorReturn {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const highVolumeStartRef = useRef<number | null>(null);
  const hasTriggeredHighVolumeRef = useRef(false);

  // MediaRecorder refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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

      // Initialize MediaRecorder for audio recording
      // Determine supported MIME type for WebM
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });

      // Clear any previous recorded chunks
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Append chunk to our accumulated recording
          recordedChunksRef.current.push(event.data);
          console.log(`Audio chunk recorded: ${event.data.size} bytes, total chunks: ${recordedChunksRef.current.length}`);
          
          // Call the onAudioChunk callback if provided
          onAudioChunk?.(event.data);
        }
      };

      recorder.onstart = () => {
        console.log('MediaRecorder started - recording audio');
        setIsRecording(true);
      };

      recorder.onstop = () => {
        console.log('MediaRecorder stopped');
        setIsRecording(false);
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
      };

      mediaRecorderRef.current = recorder;

      // Start recording with 1 second intervals (timeslice in ms)
      recorder.start(recordingIntervalMs);

      setIsListening(true);

      // Start processing volume
      processAudio();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(message);
      console.error('Volume monitor error:', err);
    }
  }, [processAudio, recordingIntervalMs, onAudioChunk]);

  const stopListening = useCallback(() => {
    console.log('Stopping audio monitoring and recording');

    // Stop MediaRecorder first
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

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
    setIsRecording(false);
    setVolumeLevel(0);
    highVolumeStartRef.current = null;
    hasTriggeredHighVolumeRef.current = false;
  }, []);

  // Get the complete recorded audio as a single Blob
  const getRecordedAudio = useCallback((): Blob | null => {
    if (recordedChunksRef.current.length === 0) {
      return null;
    }

    // Combine all chunks into a single WebM blob
    const mimeType = recordedChunksRef.current[0]?.type || 'audio/webm';
    return new Blob(recordedChunksRef.current, { type: mimeType });
  }, []);

  // Download the recorded audio as a WebM file
  const downloadRecording = useCallback((filename: string = 'demo') => {
    const audioBlob = getRecordedAudio();
    if (!audioBlob) {
      console.warn('No audio recorded yet');
      return;
    }

    // Create download link
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`Downloaded recording: ${filename}.webm (${audioBlob.size} bytes)`);
  }, [getRecordedAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    volumeLevel,
    isListening,
    isRecording,
    startListening,
    stopListening,
    getRecordedAudio,
    downloadRecording,
    error,
  };
}
