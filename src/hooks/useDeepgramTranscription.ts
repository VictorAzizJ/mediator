'use client';

import { useCallback, useRef, useState } from 'react';

export interface TranscriptSegment {
  id: string;
  text: string;
  speaker: number;
  isFinal: boolean;
  confidence: number;
  startTime: number;
  endTime: number;
  words: TranscriptWord[];
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number;
}

interface UseDeepgramOptions {
  onTranscript?: (segment: TranscriptSegment) => void;
  onFinalTranscript?: (segment: TranscriptSegment) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
  language?: string;
  model?: 'nova-2' | 'nova' | 'enhanced' | 'base';
  enablePunctuation?: boolean;
  enableDiarization?: boolean;
  enableSmartFormat?: boolean;
}

interface UseDeepgramReturn {
  isConnected: boolean;
  isConnecting: boolean;
  startTranscription: () => Promise<void>;
  stopTranscription: () => void;
  sendAudio: (audioData: ArrayBuffer | Float32Array) => void;
  transcripts: TranscriptSegment[];
  currentInterim: string;
  error: string | null;
}

/**
 * Deepgram Real-time Transcription Hook
 *
 * Connects to Deepgram's WebSocket API for live speech-to-text.
 * Features:
 * - Real-time transcription with <500ms latency
 * - Speaker diarization (identifies different speakers)
 * - Punctuation and smart formatting
 * - Interim results for live display
 */
export function useDeepgramTranscription({
  onTranscript,
  onFinalTranscript,
  onError,
  onConnectionChange,
  language = 'en',
  model = 'nova-2',
  enablePunctuation = true,
  enableDiarization = true,
  enableSmartFormat = true,
}: UseDeepgramOptions = {}): UseDeepgramReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [currentInterim, setCurrentInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const segmentIdRef = useRef(0);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      // Handle transcription results
      if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
        const alternative = data.channel.alternatives[0];
        const transcript = alternative.transcript;

        if (!transcript) return;

        const segment: TranscriptSegment = {
          id: `seg-${segmentIdRef.current++}`,
          text: transcript,
          speaker: data.channel.speaker ?? 0,
          isFinal: data.is_final,
          confidence: alternative.confidence || 0,
          startTime: data.start || 0,
          endTime: (data.start || 0) + (data.duration || 0),
          words: alternative.words?.map((w: {
            word: string;
            start: number;
            end: number;
            confidence: number;
            speaker?: number;
          }) => ({
            word: w.word,
            start: w.start,
            end: w.end,
            confidence: w.confidence,
            speaker: w.speaker ?? 0,
          })) || [],
        };

        if (data.is_final) {
          setTranscripts(prev => [...prev, segment]);
          setCurrentInterim('');
          onFinalTranscript?.(segment);
        } else {
          setCurrentInterim(transcript);
        }

        onTranscript?.(segment);
      }

      // Handle metadata
      if (data.type === 'Metadata') {
        console.log('Deepgram metadata:', data);
      }

      // Handle errors from Deepgram
      if (data.type === 'Error') {
        console.error('Deepgram error:', data);
        setError(data.description || 'Deepgram error');
        onError?.(new Error(data.description || 'Deepgram error'));
      }
    } catch (err) {
      console.error('Error parsing Deepgram message:', err);
    }
  }, [onTranscript, onFinalTranscript, onError]);

  const startTranscription = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Get temporary API key from our backend
      const tokenResponse = await fetch('/api/transcription/token', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to get transcription token');
      }

      const { key, url } = await tokenResponse.json();

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Build WebSocket URL with options
      const params = new URLSearchParams({
        model,
        language,
        punctuate: enablePunctuation.toString(),
        diarize: enableDiarization.toString(),
        smart_format: enableSmartFormat.toString(),
        encoding: 'linear16',
        sample_rate: '16000',
        channels: '1',
        interim_results: 'true',
        utterance_end_ms: '1000',
      });

      // Connect to Deepgram
      const wsUrl = url || `wss://api.deepgram.com/v1/listen?${params.toString()}`;
      const socket = new WebSocket(wsUrl, ['token', key]);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Deepgram WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        onConnectionChange?.(true);

        // Start sending audio
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            // Convert to ArrayBuffer and send
            const arrayBuffer = await event.data.arrayBuffer();
            socket.send(arrayBuffer);
          }
        };

        mediaRecorder.start(250); // Send chunks every 250ms
        mediaRecorderRef.current = mediaRecorder;
      };

      socket.onmessage = handleMessage;

      socket.onerror = (event) => {
        console.error('Deepgram WebSocket error:', event);
        setError('WebSocket connection error');
        onError?.(new Error('WebSocket connection error'));
      };

      socket.onclose = (event) => {
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        onConnectionChange?.(false);

        if (event.code !== 1000) {
          setError(`Connection closed: ${event.reason || 'Unknown reason'}`);
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start transcription';
      setError(message);
      setIsConnecting(false);
      onError?.(err instanceof Error ? err : new Error(message));
      console.error('Transcription error:', err);
    }
  }, [
    isConnected,
    isConnecting,
    model,
    language,
    enablePunctuation,
    enableDiarization,
    enableSmartFormat,
    handleMessage,
    onConnectionChange,
    onError,
  ]);

  const stopTranscription = useCallback(() => {
    // Stop media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close(1000, 'User stopped transcription');
      socketRef.current = null;
    }

    setIsConnected(false);
    setCurrentInterim('');
  }, []);

  const sendAudio = useCallback((audioData: ArrayBuffer | Float32Array) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (audioData instanceof Float32Array) {
      // Convert Float32Array to Int16Array (PCM)
      const int16 = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
      socketRef.current.send(int16.buffer);
    } else {
      socketRef.current.send(audioData);
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    startTranscription,
    stopTranscription,
    sendAudio,
    transcripts,
    currentInterim,
    error,
  };
}

/**
 * Combine transcripts into a full conversation transcript
 */
export function combineTranscripts(segments: TranscriptSegment[]): string {
  return segments
    .filter(s => s.isFinal)
    .map(s => s.text)
    .join(' ')
    .trim();
}

/**
 * Group transcripts by speaker for display
 */
export function groupBySpeaker(segments: TranscriptSegment[]): Array<{
  speaker: number;
  text: string;
  startTime: number;
  endTime: number;
}> {
  const groups: Array<{
    speaker: number;
    text: string;
    startTime: number;
    endTime: number;
  }> = [];

  let currentGroup: typeof groups[0] | null = null;

  for (const segment of segments.filter(s => s.isFinal)) {
    if (!currentGroup || currentGroup.speaker !== segment.speaker) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        speaker: segment.speaker,
        text: segment.text,
        startTime: segment.startTime,
        endTime: segment.endTime,
      };
    } else {
      currentGroup.text += ' ' + segment.text;
      currentGroup.endTime = segment.endTime;
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}
