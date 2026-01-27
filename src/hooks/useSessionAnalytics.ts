'use client';

import { useState, useCallback, useRef } from 'react';
import type { RoundAnalytics, RoundPhase, InputType, DBTSkill } from '@/types';

interface UseSessionAnalyticsOptions {
  skillUsed?: DBTSkill | null;
  templateId?: string;
  templateName?: string;
  totalRounds?: number;
}

interface UseSessionAnalyticsReturn {
  rounds: RoundAnalytics[];
  currentRound: number;
  volumeFlags: number;
  voiceRounds: number;
  textRounds: number;
  startRound: (phase: RoundPhase, inputType: InputType) => void;
  endRound: (text: string) => void;
  flagVolumeAlert: () => void;
  markRoundRedone: () => void;
  resetAnalytics: () => void;
}

export function useSessionAnalytics({
  skillUsed = null,
  templateId,
  templateName,
  totalRounds = 3,
}: UseSessionAnalyticsOptions = {}): UseSessionAnalyticsReturn {
  const [rounds, setRounds] = useState<RoundAnalytics[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  const roundStartTimeRef = useRef<number>(0);
  const currentInputTypeRef = useRef<InputType>('text');
  const currentPhaseRef = useRef<RoundPhase>('setup');
  const volumeFlaggedRef = useRef(false);

  const startRound = useCallback((phase: RoundPhase, inputType: InputType) => {
    const roundNum = rounds.length + 1;
    setCurrentRound(roundNum);
    roundStartTimeRef.current = Date.now();
    currentInputTypeRef.current = inputType;
    currentPhaseRef.current = phase;
    volumeFlaggedRef.current = false;
  }, [rounds.length]);

  const endRound = useCallback((text: string) => {
    const endTime = Date.now();
    const startTime = roundStartTimeRef.current || endTime;
    const duration = Math.round((endTime - startTime) / 1000);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const roundAnalytics: RoundAnalytics = {
      round: currentRound,
      phase: currentPhaseRef.current,
      inputType: currentInputTypeRef.current,
      text,
      responseLength: wordCount,
      volumeFlag: volumeFlaggedRef.current,
      startTime,
      endTime,
      duration,
      wasRedone: false,
    };

    setRounds((prev) => [...prev, roundAnalytics]);
  }, [currentRound]);

  const flagVolumeAlert = useCallback(() => {
    volumeFlaggedRef.current = true;
  }, []);

  const markRoundRedone = useCallback(() => {
    setRounds((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        wasRedone: true,
      };
      return updated;
    });
  }, []);

  const resetAnalytics = useCallback(() => {
    setRounds([]);
    setCurrentRound(0);
    roundStartTimeRef.current = 0;
    volumeFlaggedRef.current = false;
  }, []);

  // Computed values
  const volumeFlags = rounds.filter((r) => r.volumeFlag).length;
  const voiceRounds = rounds.filter((r) => r.inputType === 'voice').length;
  const textRounds = rounds.filter((r) => r.inputType === 'text').length;

  return {
    rounds,
    currentRound,
    volumeFlags,
    voiceRounds,
    textRounds,
    startRound,
    endRound,
    flagVolumeAlert,
    markRoundRedone,
    resetAnalytics,
  };
}
