'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DeepgramClient,
  DeepgramResult,
  createDeepgramClient,
} from '@/lib/deepgram';
import type { TranscriptionSegment } from '@/types';

interface UseTranscriptionOptions {
  onSegment?: (segment: TranscriptionSegment) => void;
  onError?: (error: Error) => void;
  participantNames?: Map<number, string>;
}

interface UseTranscriptionReturn {
  isActive: boolean;
  isConnecting: boolean;
  segments: TranscriptionSegment[];
  currentSegment: TranscriptionSegment | null;
  error: string | null;
  startTranscription: () => Promise<void>;
  stopTranscription: () => void;
  clearSegments: () => void;
}

export function useTranscription(
  options: UseTranscriptionOptions = {}
): UseTranscriptionReturn {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<TranscriptionSegment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<DeepgramClient | null>(null);
  const segmentIdRef = useRef(0);
  const participantNamesRef = useRef(options.participantNames || new Map<number, string>());

  // Update participant names when they change
  useEffect(() => {
    if (options.participantNames) {
      participantNamesRef.current = options.participantNames;
    }
  }, [options.participantNames]);

  const handleTranscript = useCallback(
    (result: DeepgramResult) => {
      const alternative = result.channel.alternatives[0];
      if (!alternative || !alternative.transcript.trim()) return;

      // Determine speaker from words (diarization)
      const speakerCounts = new Map<number, number>();
      for (const word of alternative.words) {
        if (word.speaker !== undefined) {
          speakerCounts.set(
            word.speaker,
            (speakerCounts.get(word.speaker) || 0) + 1
          );
        }
      }

      // Most common speaker in this segment
      let dominantSpeaker = 0;
      let maxCount = 0;
      speakerCounts.forEach((count, speaker) => {
        if (count > maxCount) {
          maxCount = count;
          dominantSpeaker = speaker;
        }
      });

      const segment: TranscriptionSegment = {
        id: `seg-${segmentIdRef.current++}`,
        text: alternative.transcript,
        words: alternative.words.map((w) => ({
          word: w.punctuated_word || w.word,
          start: w.start,
          end: w.end,
          confidence: w.confidence,
          speaker: w.speaker,
        })),
        speaker: dominantSpeaker,
        speakerName: participantNamesRef.current.get(dominantSpeaker),
        start: result.start,
        end: result.start + result.duration,
        isFinal: result.is_final,
        confidence: alternative.confidence,
      };

      if (result.is_final) {
        setSegments((prev) => [...prev, segment]);
        setCurrentSegment(null);
        options.onSegment?.(segment);
      } else {
        setCurrentSegment(segment);
      }
    },
    [options]
  );

  const startTranscription = useCallback(async () => {
    if (isActive || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const client = await createDeepgramClient({
        onTranscript: handleTranscript,
        onOpen: () => {
          setIsActive(true);
          setIsConnecting(false);
        },
        onClose: () => {
          setIsActive(false);
          clientRef.current = null;
        },
        onError: (err) => {
          setError(err.message);
          setIsActive(false);
          setIsConnecting(false);
          options.onError?.(err);
        },
      });

      if (!client) {
        setError('Transcription service not available');
        setIsConnecting(false);
        return;
      }

      clientRef.current = client;
      await client.connect();
      await client.startRecording();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setIsConnecting(false);
      options.onError?.(error);
    }
  }, [isActive, isConnecting, handleTranscript, options]);

  const stopTranscription = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    setIsActive(false);
    setCurrentSegment(null);
  }, []);

  const clearSegments = useCallback(() => {
    setSegments([]);
    setCurrentSegment(null);
    segmentIdRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    isActive,
    isConnecting,
    segments,
    currentSegment,
    error,
    startTranscription,
    stopTranscription,
    clearSegments,
  };
}
