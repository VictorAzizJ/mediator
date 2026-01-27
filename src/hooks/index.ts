export { useSocket, useCurrentParticipant } from './useSocket';
export { useVolumeMonitor } from './useVolumeMonitor';
export { useVoiceActivityDetection } from './useVoiceActivityDetection';
export { useSessionAnalytics } from './useSessionAnalytics';
export { useSpeechRecognition } from './useSpeechRecognition';
export { useAI } from './useAI';

// Enhanced VAD & Transcription (P0 features)
export { useSileroVAD, audioToWav } from './useSileroVAD';
export {
  useDeepgramTranscription,
  combineTranscripts,
  groupBySpeaker,
  type TranscriptSegment,
  type TranscriptWord,
} from './useDeepgramTranscription';

// Authentication (P0 features)
export {
  useAuth,
  getSessionToken,
  isUserAuthenticated,
  type AuthUser,
} from './useAuth';

// Skill Element Detection (P1 features)
export {
  useSkillElementDetector,
  formatCoverageString,
  type SkillElement,
  type SkillCoverage,
} from './useSkillElementDetector';

// Admin Dashboard Data (P1 features)
export {
  useAdminDashboard,
  formatDuration,
  formatRelativeDate,
  type DashboardStats,
  type SkillBreakdown,
  type DailyStats,
  type SessionSummary,
  type AdminAnalytics,
  type SessionsResponse,
} from './useAdminDashboard';

// Export Functionality (P2 features)
export { useExport } from './useExport';
