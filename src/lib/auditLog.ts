// Audit Logging System for B2B Compliance
// Tracks all significant actions for security, compliance, and accountability

export type AuditAction =
  // Session lifecycle
  | 'session:created'
  | 'session:joined'
  | 'session:ended'
  | 'session:reconnected'
  // Observer actions
  | 'observer:joined'
  | 'observer:left'
  | 'observer:settings_updated'
  // Conversation actions
  | 'conversation:started'
  | 'conversation:paused'
  | 'conversation:resumed'
  | 'turn:ended'
  | 'turn:extended'
  // Trigger/alert actions
  | 'trigger:detected'
  | 'volume:escalation'
  | 'breathing:started'
  | 'breathing:completed'
  // Data actions
  | 'transcript:added'
  | 'summary:generated'
  | 'summary:exported'
  | 'note:added'
  // Admin actions
  | 'settings:updated'
  | 'member:invited'
  | 'member:removed'
  | 'role:changed';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditAction;
  sessionId: string | null;
  sessionCode: string | null;
  actorId: string; // Who performed the action
  actorName: string;
  actorRole: 'participant' | 'observer' | 'admin' | 'system';
  targetId?: string; // Who/what was affected
  targetName?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory audit log store (in production, use database)
class AuditLogStore {
  private logs: AuditLogEntry[] = [];
  private maxEntries = 10000;

  add(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.logs.unshift(fullEntry);

    // Trim old entries
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(0, this.maxEntries);
    }

    // Log to console for debugging
    console.log(
      `[AUDIT] ${fullEntry.action} by ${fullEntry.actorName} (${fullEntry.actorRole})`,
      fullEntry.metadata ? JSON.stringify(fullEntry.metadata) : ''
    );

    return fullEntry;
  }

  getBySession(sessionCode: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.sessionCode === sessionCode);
  }

  getByActor(actorId: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.actorId === actorId);
  }

  getByAction(action: AuditAction): AuditLogEntry[] {
    return this.logs.filter((log) => log.action === action);
  }

  getRecent(count: number = 100): AuditLogEntry[] {
    return this.logs.slice(0, count);
  }

  getInTimeRange(startTime: number, endTime: number): AuditLogEntry[] {
    return this.logs.filter(
      (log) => log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  clear(): void {
    this.logs = [];
  }

  toJSON(): AuditLogEntry[] {
    return this.logs;
  }
}

// Global audit log store instance
export const auditLog = new AuditLogStore();

// Helper functions for common audit actions
export function logSessionCreated(
  sessionId: string,
  sessionCode: string,
  hostId: string,
  hostName: string,
  ipAddress?: string
): AuditLogEntry {
  return auditLog.add({
    action: 'session:created',
    sessionId,
    sessionCode,
    actorId: hostId,
    actorName: hostName,
    actorRole: 'participant',
    ipAddress,
  });
}

export function logSessionJoined(
  sessionId: string,
  sessionCode: string,
  participantId: string,
  participantName: string,
  ipAddress?: string
): AuditLogEntry {
  return auditLog.add({
    action: 'session:joined',
    sessionId,
    sessionCode,
    actorId: participantId,
    actorName: participantName,
    actorRole: 'participant',
    ipAddress,
  });
}

export function logObserverJoined(
  sessionId: string,
  sessionCode: string,
  observerId: string,
  observerName: string,
  ipAddress?: string
): AuditLogEntry {
  return auditLog.add({
    action: 'observer:joined',
    sessionId,
    sessionCode,
    actorId: observerId,
    actorName: observerName,
    actorRole: 'observer',
    ipAddress,
  });
}

export function logConversationStarted(
  sessionId: string,
  sessionCode: string,
  participantIds: string[]
): AuditLogEntry {
  return auditLog.add({
    action: 'conversation:started',
    sessionId,
    sessionCode,
    actorId: 'system',
    actorName: 'System',
    actorRole: 'system',
    metadata: { participantIds },
  });
}

export function logConversationPaused(
  sessionId: string,
  sessionCode: string,
  participantId: string,
  participantName: string,
  reason: string
): AuditLogEntry {
  return auditLog.add({
    action: 'conversation:paused',
    sessionId,
    sessionCode,
    actorId: participantId,
    actorName: participantName,
    actorRole: 'participant',
    metadata: { reason },
  });
}

export function logTurnEnded(
  sessionId: string,
  sessionCode: string,
  speakerId: string,
  speakerName: string,
  durationSeconds: number
): AuditLogEntry {
  return auditLog.add({
    action: 'turn:ended',
    sessionId,
    sessionCode,
    actorId: speakerId,
    actorName: speakerName,
    actorRole: 'participant',
    metadata: { durationSeconds },
  });
}

export function logTriggerDetected(
  sessionId: string,
  sessionCode: string,
  triggerType: string,
  severity: 'low' | 'medium' | 'high'
): AuditLogEntry {
  return auditLog.add({
    action: 'trigger:detected',
    sessionId,
    sessionCode,
    actorId: 'system',
    actorName: 'System',
    actorRole: 'system',
    metadata: { triggerType, severity },
  });
}

export function logSummaryExported(
  sessionId: string,
  sessionCode: string,
  exporterId: string,
  exporterName: string,
  exporterRole: 'participant' | 'observer' | 'admin',
  format: 'pdf' | 'json'
): AuditLogEntry {
  return auditLog.add({
    action: 'summary:exported',
    sessionId,
    sessionCode,
    actorId: exporterId,
    actorName: exporterName,
    actorRole: exporterRole,
    metadata: { format },
  });
}

export function logSettingsUpdated(
  adminId: string,
  adminName: string,
  settingName: string,
  oldValue: unknown,
  newValue: unknown
): AuditLogEntry {
  return auditLog.add({
    action: 'settings:updated',
    sessionId: null,
    sessionCode: null,
    actorId: adminId,
    actorName: adminName,
    actorRole: 'admin',
    metadata: { settingName, oldValue, newValue },
  });
}

// Format audit log for display
export function formatAuditEntry(entry: AuditLogEntry): string {
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleTimeString();
  const dateStr = date.toLocaleDateString();

  const actionDescriptions: Record<AuditAction, string> = {
    'session:created': 'created a session',
    'session:joined': 'joined the session',
    'session:ended': 'ended the session',
    'session:reconnected': 'reconnected to the session',
    'observer:joined': 'joined as an observer',
    'observer:left': 'left observer mode',
    'observer:settings_updated': 'updated observer settings',
    'conversation:started': 'started the conversation',
    'conversation:paused': 'paused the conversation',
    'conversation:resumed': 'resumed the conversation',
    'turn:ended': 'ended their turn',
    'turn:extended': 'extended the turn',
    'trigger:detected': 'trigger word detected',
    'volume:escalation': 'volume escalation detected',
    'breathing:started': 'started breathing exercise',
    'breathing:completed': 'completed breathing exercise',
    'transcript:added': 'added to transcript',
    'summary:generated': 'generated summary',
    'summary:exported': 'exported summary',
    'note:added': 'added a private note',
    'settings:updated': 'updated settings',
    'member:invited': 'invited a member',
    'member:removed': 'removed a member',
    'role:changed': 'changed a role',
  };

  return `[${dateStr} ${timeStr}] ${entry.actorName} ${actionDescriptions[entry.action]}${
    entry.sessionCode ? ` in session ${entry.sessionCode}` : ''
  }`;
}

// Export audit log to JSON
export function exportAuditLog(
  sessionCode?: string,
  startTime?: number,
  endTime?: number
): string {
  let logs = auditLog.toJSON();

  if (sessionCode) {
    logs = logs.filter((log) => log.sessionCode === sessionCode);
  }

  if (startTime && endTime) {
    logs = logs.filter(
      (log) => log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  return JSON.stringify(logs, null, 2);
}
