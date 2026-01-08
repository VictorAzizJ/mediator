// Analytics calculations and conversation health scoring
// These functions calculate metrics from session data

import type {
  ConversationMetrics,
  ParticipantMetrics,
  ConversationHealthScore,
  CoachingInsight,
  SpeakingTimeRecord,
  TranscriptEntry,
  Participant,
} from '@/types';

// ============================================
// CONVERSATION HEALTH SCORING
// ============================================

export function calculateHealthScore(
  metrics: ConversationMetrics,
  participantMetrics: ParticipantMetrics[]
): ConversationHealthScore {
  // Communication Balance (0-100)
  // Perfect balance = 0.5, score decreases as it moves away
  const balanceDeviation = Math.abs(metrics.speakingBalance - 0.5);
  const communicationBalance = Math.round((1 - balanceDeviation * 2) * 100);

  // Emotional Regulation (0-100)
  // Based on pause usage, trigger count, volume spikes
  const totalTriggers = metrics.triggerCount;
  const totalPauses = metrics.pauseCount;
  const totalVolumeSpikes = participantMetrics.reduce(
    (sum, p) => sum + p.volumeSpikes,
    0
  );

  // Better score if pauses were used relative to triggers
  const regulationRatio =
    totalTriggers > 0 ? Math.min(totalPauses / totalTriggers, 1) : 1;
  const volumePenalty = Math.min(totalVolumeSpikes * 5, 30);
  const emotionalRegulation = Math.max(
    0,
    Math.round(regulationRatio * 100 - volumePenalty)
  );

  // Engagement Depth (0-100)
  // Based on turn count, average turn duration, reflection engagement
  const avgTurnDuration = metrics.averageTurnDuration;
  const reflectionEngagement =
    metrics.reflectionPromptsShown > 0
      ? metrics.reflectionPromptsEngaged / metrics.reflectionPromptsShown
      : 1;

  // Ideal turn duration is 60-120 seconds
  const durationScore =
    avgTurnDuration >= 60 && avgTurnDuration <= 120
      ? 100
      : avgTurnDuration < 60
        ? (avgTurnDuration / 60) * 100
        : Math.max(0, 100 - (avgTurnDuration - 120) * 0.5);

  const engagementDepth = Math.round(
    durationScore * 0.6 + reflectionEngagement * 100 * 0.4
  );

  // Safety Indicator (0-100)
  // Based on completion, trigger severity, interruptions
  const completionBonus = metrics.endReason === 'completed' ? 20 : 0;
  const triggerPenalty = Math.min(totalTriggers * 10, 40);
  const interruptionPenalty = Math.min(metrics.interruptionCount * 5, 30);
  const safetyIndicator = Math.max(
    0,
    Math.round(80 + completionBonus - triggerPenalty - interruptionPenalty)
  );

  // Overall (weighted average)
  const overall = Math.round(
    communicationBalance * 0.25 +
      emotionalRegulation * 0.3 +
      engagementDepth * 0.2 +
      safetyIndicator * 0.25
  );

  return {
    overall,
    communicationBalance,
    emotionalRegulation,
    engagementDepth,
    safetyIndicator,
  };
}

// ============================================
// METRICS CALCULATION
// ============================================

export function calculateConversationMetrics(
  sessionId: string,
  startedAt: number,
  endedAt: number,
  speakingTime: SpeakingTimeRecord[],
  transcript: TranscriptEntry[],
  pauseCount: number,
  triggerCount: number,
  agreementCount: number,
  reflectionPromptsShown: number,
  reflectionPromptsEngaged: number,
  endReason: 'completed' | 'ended_early' | 'disconnected'
): ConversationMetrics {
  const duration = Math.floor((endedAt - startedAt) / 1000);

  // Calculate speaking balance
  const totalSpeakingTime = speakingTime.reduce(
    (sum, r) => sum + r.totalSeconds,
    0
  );
  const speakingBalance =
    speakingTime.length >= 2 && totalSpeakingTime > 0
      ? speakingTime[0].totalSeconds / totalSpeakingTime
      : 0.5;

  // Calculate average turn duration
  const totalTurns = speakingTime.reduce((sum, r) => sum + r.turnCount, 0);
  const averageTurnDuration =
    totalTurns > 0 ? Math.round(totalSpeakingTime / totalTurns) : 0;

  // Count interruptions (simplified: speaker changes before natural end)
  const interruptionCount = Math.max(0, totalTurns - speakingTime.length * 2);

  // Count breathing exercises from transcript/events
  const breathingExercisesCompleted = 1; // Default, would be tracked in session

  return {
    sessionId,
    startedAt,
    endedAt,
    duration,
    speakingBalance,
    interruptionCount,
    averageTurnDuration,
    pauseCount,
    triggerCount,
    breathingExercisesCompleted,
    endReason,
    agreementsMade: agreementCount,
    reflectionPromptsShown,
    reflectionPromptsEngaged,
  };
}

export function calculateParticipantMetrics(
  participant: Participant,
  speakingRecord: SpeakingTimeRecord | undefined,
  transcript: TranscriptEntry[],
  triggersDetected: number,
  pausesRequested: number,
  volumeData: { average: number; spikes: number; variance: number }
): ParticipantMetrics {
  const participantTranscript = transcript.filter(
    (t) => t.participantId === participant.id
  );

  // Calculate turn durations
  const turnDurations: number[] = [];
  let lastTurnEnd = 0;

  for (let i = 0; i < participantTranscript.length; i++) {
    const entry = participantTranscript[i];
    if (i > 0) {
      const prevEntry = participantTranscript[i - 1];
      turnDurations.push(
        Math.floor((entry.timestamp - prevEntry.timestamp) / 1000)
      );
    }
  }

  const averageTurnDuration =
    turnDurations.length > 0
      ? Math.round(
          turnDurations.reduce((a, b) => a + b, 0) / turnDurations.length
        )
      : 0;
  const longestTurn =
    turnDurations.length > 0 ? Math.max(...turnDurations) : 0;

  return {
    participantId: participant.id,
    participantName: participant.name,
    role: participant.role === 'speaker' ? 'host' : 'guest',
    totalSpeakingTime: speakingRecord?.totalSeconds || 0,
    turnCount: speakingRecord?.turnCount || 0,
    averageTurnDuration,
    longestTurn,
    interruptionsMade: 0, // Would need more sophisticated tracking
    interruptionsReceived: 0,
    pausesRequested,
    breathingExercisesCompleted: 1,
    triggersDetected,
    triggerTypes: {}, // Would aggregate by type
    averageVolume: volumeData.average,
    volumeSpikes: volumeData.spikes,
    volumeVariance: volumeData.variance,
  };
}

// ============================================
// COACHING INSIGHTS
// ============================================

export function generateCoachingInsights(
  metrics: ConversationMetrics,
  participantMetrics: ParticipantMetrics[],
  healthScore: ConversationHealthScore
): CoachingInsight[] {
  const insights: CoachingInsight[] = [];

  // Speaking balance insight
  if (healthScore.communicationBalance >= 80) {
    insights.push({
      id: 'balance-strength',
      type: 'strength',
      title: 'Great Balance',
      description:
        'You maintained a healthy speaking balance, allowing both voices to be heard equally.',
      actionable: false,
      priority: 'medium',
    });
  } else if (healthScore.communicationBalance < 60) {
    const dominantSpeaker = participantMetrics.reduce((a, b) =>
      a.totalSpeakingTime > b.totalSpeakingTime ? a : b
    );
    insights.push({
      id: 'balance-opportunity',
      type: 'opportunity',
      title: 'Speaking Balance',
      description: `Try asking more open-ended questions to encourage more balanced participation.`,
      actionable: true,
      priority: 'high',
    });
  }

  // Emotional regulation insight
  if (metrics.pauseCount > 0 && metrics.triggerCount > 0) {
    insights.push({
      id: 'pause-usage',
      type: 'strength',
      title: 'Self-Regulation',
      description: `You used ${metrics.pauseCount} pause(s) during challenging moments. This shows great emotional awareness.`,
      actionable: false,
      priority: 'medium',
    });
  }

  // Engagement insight
  if (metrics.averageTurnDuration >= 60 && metrics.averageTurnDuration <= 90) {
    insights.push({
      id: 'turn-duration-strength',
      type: 'strength',
      title: 'Thoughtful Responses',
      description:
        'Your average turn duration was ideal for meaningful exchange.',
      actionable: false,
      priority: 'low',
    });
  } else if (metrics.averageTurnDuration < 30) {
    insights.push({
      id: 'turn-duration-tip',
      type: 'tip',
      title: 'Take Your Time',
      description:
        'Short responses can feel dismissive. Try to elaborate on your thoughts.',
      actionable: true,
      priority: 'medium',
    });
  }

  // Completion insight
  if (metrics.endReason === 'completed') {
    insights.push({
      id: 'completion-strength',
      type: 'strength',
      title: 'Full Conversation',
      description:
        'You completed the entire conversation structure. This shows commitment to the process.',
      actionable: false,
      priority: 'low',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights;
}

// ============================================
// TREND ANALYSIS
// ============================================

export function calculateTrend(
  scores: number[]
): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable';

  const recentAvg =
    scores.slice(-3).reduce((a, b) => a + b, 0) /
    Math.min(scores.length, 3);
  const olderAvg =
    scores.slice(0, -3).reduce((a, b) => a + b, 0) /
    Math.max(scores.length - 3, 1);

  const diff = recentAvg - olderAvg;

  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

export function calculateTrendPercentage(scores: number[]): number {
  if (scores.length < 2) return 0;

  const first = scores[0];
  const last = scores[scores.length - 1];

  if (first === 0) return last > 0 ? 100 : 0;

  return Math.round(((last - first) / first) * 100);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--color-safe-green)';
  if (score >= 60) return 'var(--color-safe-amber)';
  return 'var(--color-alert-red)';
}

export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '↑';
    case 'declining':
      return '↓';
    default:
      return '→';
  }
}
