'use client';

import { useCallback, useState } from 'react';
import { detectTriggersLocal, generateReflectionPromptLocal, generateSummaryLocal } from '@/lib/ai';
import type {
  TriggerDetection,
  ReflectionPrompt,
  ConversationSummary,
  TranscriptEntry,
  Participant,
} from '@/types';

interface UseAIReturn {
  isProcessing: boolean;
  error: string | null;
  detectTriggers: (text: string, customTriggers?: string[]) => Promise<TriggerDetection>;
  generateReflectionPrompt: (
    speakerName: string,
    listenerName: string,
    listenerId: string,
    transcriptSegment: string
  ) => Promise<ReflectionPrompt>;
  generateSummary: (
    transcript: TranscriptEntry[],
    participants: Participant[],
    intentions: { participantId: string; intention: string }[]
  ) => Promise<ConversationSummary>;
}

export function useAI(): UseAIReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectTriggers = useCallback(async (
    text: string,
    customTriggers: string[] = []
  ): Promise<TriggerDetection> => {
    // Always do local detection first (instant feedback)
    const localResult = detectTriggersLocal(text);

    // If local detection found something, return it immediately
    if (localResult.detected) {
      return localResult;
    }

    // Try API for nuanced detection
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/ai/trigger-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, customTriggers }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Trigger detection API error:', err);
      // Return local result on error
      return localResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateReflectionPrompt = useCallback(async (
    speakerName: string,
    listenerName: string,
    listenerId: string,
    transcriptSegment: string
  ): Promise<ReflectionPrompt> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/ai/reflection-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speakerName,
          listenerName,
          listenerId,
          transcriptSegment,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Reflection prompt API error:', err);
      // Fall back to local generation
      const localPrompt = generateReflectionPromptLocal(
        speakerName,
        listenerName,
        transcriptSegment
      );
      return {
        ...localPrompt,
        forParticipantId: listenerId,
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateSummary = useCallback(async (
    transcript: TranscriptEntry[],
    participants: Participant[],
    intentions: { participantId: string; intention: string }[]
  ): Promise<ConversationSummary> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, participants, intentions }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Summarization API error:', err);
      // Fall back to local generation
      return generateSummaryLocal(transcript, participants, intentions);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    detectTriggers,
    generateReflectionPrompt,
    generateSummary,
  };
}
