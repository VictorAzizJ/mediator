// Socket.io server for Mediator real-time sync
// Run with: node server.js

const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const { z } = require('zod');
const Redis = require('ioredis');

// ============================================================================
// AUDIT LOGGING: Track all significant actions for B2B compliance
// ============================================================================

class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxEntries = 10000;
  }

  log(action, data) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action,
      ...data,
    };

    this.logs.unshift(entry);

    // Trim old entries
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(0, this.maxEntries);
    }

    // Console log for debugging (in production, send to logging service)
    console.log(`[AUDIT] ${action}:`, JSON.stringify({
      sessionCode: data.sessionCode,
      actor: data.actorName,
      metadata: data.metadata,
    }));

    return entry;
  }

  getBySession(sessionCode) {
    return this.logs.filter(log => log.sessionCode === sessionCode);
  }

  getRecent(count = 100) {
    return this.logs.slice(0, count);
  }
}

const auditLogger = new AuditLogger();

const httpServer = createServer();

// CORS configuration - allow all origins in development
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : true; // true = allow all origins in development

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ============================================================================
// SESSION STORAGE: Redis with in-memory fallback
// Provides persistence, reconnection support, and horizontal scaling
// ============================================================================

class SessionStore {
  constructor() {
    this.redis = null;
    this.fallbackStore = new Map();
    this.useRedis = false;
    this.SESSION_TTL = 86400; // 24 hours in seconds

    this.initRedis();
  }

  initRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        console.log('✓ Redis connected - using persistent session storage');
        this.useRedis = true;
      });

      this.redis.on('error', (err) => {
        if (this.useRedis) {
          console.warn('Redis error, falling back to in-memory:', err.message);
        }
        this.useRedis = false;
      });

      this.redis.on('close', () => {
        if (this.useRedis) {
          console.warn('Redis connection closed, falling back to in-memory');
        }
        this.useRedis = false;
      });

      // Try to connect
      this.redis.connect().catch(() => {
        console.log('ℹ Redis not available - using in-memory session storage');
        this.useRedis = false;
      });
    } catch (err) {
      console.log('ℹ Redis not configured - using in-memory session storage');
      this.useRedis = false;
    }
  }

  _key(sessionCode) {
    return `mediator:session:${sessionCode}`;
  }

  async get(sessionCode) {
    if (this.useRedis) {
      try {
        const data = await this.redis.get(this._key(sessionCode));
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.warn('Redis get error:', err.message);
        return this.fallbackStore.get(sessionCode) || null;
      }
    }
    return this.fallbackStore.get(sessionCode) || null;
  }

  async set(sessionCode, session) {
    // Always update fallback for immediate access
    this.fallbackStore.set(sessionCode, session);

    if (this.useRedis) {
      try {
        await this.redis.setex(
          this._key(sessionCode),
          this.SESSION_TTL,
          JSON.stringify(session)
        );
      } catch (err) {
        console.warn('Redis set error:', err.message);
      }
    }
  }

  async delete(sessionCode) {
    this.fallbackStore.delete(sessionCode);

    if (this.useRedis) {
      try {
        await this.redis.del(this._key(sessionCode));
      } catch (err) {
        console.warn('Redis delete error:', err.message);
      }
    }
  }

  async updateParticipantSocket(sessionCode, participantId, socketId, isConnected) {
    const session = await this.get(sessionCode);
    if (!session) return null;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.socketId = socketId;
      participant.isConnected = isConnected;
      await this.set(sessionCode, session);
    }
    return session;
  }
}

const sessionStore = new SessionStore();

// ============================================================================
// SECURITY: Zod Validation Schemas
// All socket event payloads are validated before processing
// ============================================================================

const LanguageSchema = z.enum(['en', 'es']).optional().default('en');

const ConversationSettingsSchema = z.object({
  turnDurationSeconds: z.number().min(30).max(600).optional().default(90),
  maxRounds: z.number().min(0).max(100).optional().default(0),
  enableVolumeAlerts: z.boolean().optional().default(true),
  enableBreathingExercise: z.boolean().optional().default(true),
});

const SessionCreateSchema = z.object({
  hostName: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .trim(),
  language: LanguageSchema,
  settings: ConversationSettingsSchema.optional(),
});

const SessionJoinSchema = z.object({
  code: z.string()
    .length(6, 'Session code must be 6 characters')
    .regex(/^[A-Z0-9]+$/i, 'Invalid session code format'),
  guestName: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .trim(),
  language: LanguageSchema,
});

const IntentionSchema = z.object({
  participantId: z.string().uuid(),
  intention: z.string().max(1000),
});

const SessionSyncSchema = z.object({
  volumeLevel: z.number().min(0).max(100).optional(),
  currentReflectionPrompt: z.string().max(1000).optional(),
  privateNotes: z.string().max(5000).optional(),
  intentions: z.array(IntentionSchema).optional(),
  readyParticipants: z.array(z.string().uuid()).optional(),
}).strict(); // Reject any fields not in schema

const TranscriptAddSchema = z.object({
  participantId: z.string().uuid('Invalid participant ID'),
  participantName: z.string().min(1).max(50),
  text: z.string().min(1).max(10000), // Limit transcript entry size
});

const PauseReasonSchema = z.string().max(200).optional();

const SessionReconnectSchema = z.object({
  sessionCode: z.string()
    .length(6, 'Session code must be 6 characters')
    .regex(/^[A-Z0-9]+$/i, 'Invalid session code format'),
  participantId: z.string().uuid('Invalid participant ID'),
});

const ObserverJoinSchema = z.object({
  code: z.string()
    .length(6, 'Session code must be 6 characters')
    .regex(/^[A-Z0-9]+$/i, 'Invalid session code format'),
  observerName: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .trim(),
});

const ObserverSettingsSchema = z.object({
  canViewTranscript: z.boolean().optional(),
  canViewSpeakingTime: z.boolean().optional(),
  canViewTriggerAlerts: z.boolean().optional(),
  canExportData: z.boolean().optional(),
});

/**
 * Validate socket event data with Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
function validateEvent(schema, data, eventName) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Zod v4 uses .issues, v3 uses .errors
      const issues = err.issues || err.errors || [];
      console.warn(`Validation failed for ${eventName}:`, issues);
      return {
        success: false,
        error: issues.map(e => e.message).join(', ') || 'Validation failed'
      };
    }
    throw err;
  }
}

// ============================================================================
// SECURITY: Rate Limiting for Socket.io
// Prevents brute-force attacks on session:join
// ============================================================================

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute window
    this.maxAttempts = options.maxAttempts || 10; // Max attempts per window
    this.attempts = new Map(); // IP -> { count, resetTime }

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request should be allowed
   * @param {string} identifier - Usually IP address or socket ID
   * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
   */
  check(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetIn: this.windowMs
      };
    }

    if (record.count >= this.maxAttempts) {
      // Rate limited
      return {
        allowed: false,
        remaining: 0,
        resetIn: record.resetTime - now
      };
    }

    // Increment and allow
    record.count++;
    return {
      allowed: true,
      remaining: this.maxAttempts - record.count,
      resetIn: record.resetTime - now
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.attempts) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Rate limiter for session join attempts (prevent brute-force)
const joinRateLimiter = new RateLimiter({
  windowMs: 60000,    // 1 minute
  maxAttempts: 10,    // 10 attempts per minute per IP
});

// Rate limiter for session creation (prevent spam)
const createRateLimiter = new RateLimiter({
  windowMs: 60000,    // 1 minute
  maxAttempts: 5,     // 5 sessions per minute per IP
});

/**
 * Get client IP from socket
 */
function getClientIP(socket) {
  return socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || socket.handshake.address
    || socket.id;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  let currentSessionCode = null;
  let currentParticipantId = null;

  // Create a new session
  socket.on('session:create', async (rawData) => {
    // Rate limiting check
    const clientIP = getClientIP(socket);
    const rateCheck = createRateLimiter.check(clientIP);
    if (!rateCheck.allowed) {
      socket.emit('session:error', `Too many session creation attempts. Try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`);
      console.warn(`Rate limited session:create from ${clientIP}`);
      return;
    }

    // Validate input with Zod
    const validation = validateEvent(SessionCreateSchema, rawData, 'session:create');
    if (!validation.success) {
      socket.emit('session:error', `Invalid input: ${validation.error}`);
      return;
    }

    const { hostName, language, settings: rawSettings } = validation.data;
    const sessionCode = generateSessionCode();
    const sessionId = generateId();
    const participantId = generateId();

    // Apply default settings if not provided
    const settings = {
      turnDurationSeconds: rawSettings?.turnDurationSeconds ?? 90,
      maxRounds: rawSettings?.maxRounds ?? 0,
      enableVolumeAlerts: rawSettings?.enableVolumeAlerts ?? true,
      enableBreathingExercise: rawSettings?.enableBreathingExercise ?? true,
    };

    const session = {
      sessionId,
      sessionCode,
      phase: 'connecting',
      participants: [
        {
          id: participantId,
          name: hostName,
          role: 'speaker',
          isConnected: true,
          language,
          socketId: socket.id,
        },
      ],
      observers: [],
      observerSettings: {
        canViewTranscript: true,
        canViewSpeakingTime: true,
        canViewTriggerAlerts: true,
        canExportData: true,
      },
      currentSpeakerId: null,
      roundNumber: 0,
      turnTimeSeconds: settings.turnDurationSeconds,
      turnStartedAt: null,
      settings,
      transcript: [],
      intentions: [],
      volumeLevel: 0,
      createdAt: Date.now(),
    };

    await sessionStore.set(sessionCode, session);
    socket.join(sessionCode);
    currentSessionCode = sessionCode;
    currentParticipantId = participantId;

    socket.emit('session:created', {
      sessionId,
      sessionCode,
      participantId,
      participants: session.participants.map(sanitizeParticipant),
      settings,
      turnTimeSeconds: settings.turnDurationSeconds,
    });

    // Audit log
    auditLogger.log('session:created', {
      sessionId,
      sessionCode,
      actorId: participantId,
      actorName: hostName,
      actorRole: 'participant',
      ipAddress: getClientIP(socket),
    });

    console.log('Session created:', sessionCode);
  });

  // Join existing session
  socket.on('session:join', async (rawData) => {
    // Rate limiting check - critical for preventing brute-force attacks
    const clientIP = getClientIP(socket);
    const rateCheck = joinRateLimiter.check(clientIP);
    if (!rateCheck.allowed) {
      socket.emit('session:error', `Too many join attempts. Try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`);
      console.warn(`Rate limited session:join from ${clientIP}`);
      return;
    }

    // Validate input with Zod
    const validation = validateEvent(SessionJoinSchema, rawData, 'session:join');
    if (!validation.success) {
      socket.emit('session:error', `Invalid input: ${validation.error}`);
      return;
    }

    const { code, guestName, language } = validation.data;
    const normalizedCode = code.toUpperCase();
    const session = await sessionStore.get(normalizedCode);

    if (!session) {
      socket.emit('session:error', 'Session not found. Please check the code.');
      return;
    }

    if (session.participants.length >= 2) {
      socket.emit('session:error', 'Session is full.');
      return;
    }

    const participantId = generateId();
    const guest = {
      id: participantId,
      name: guestName,
      role: 'listener',
      isConnected: true,
      language,
      socketId: socket.id,
    };

    session.participants.push(guest);
    session.phase = 'pre-conversation';

    await sessionStore.set(normalizedCode, session);
    socket.join(normalizedCode);
    currentSessionCode = normalizedCode;
    currentParticipantId = participantId;

    // Notify the joiner
    socket.emit('session:joined', {
      participantId,
      participants: session.participants.map(sanitizeParticipant),
      sessionId: session.sessionId,
      settings: session.settings,
      turnTimeSeconds: session.turnTimeSeconds,
    });

    // Notify all in session
    io.to(normalizedCode).emit('session:updated', {
      phase: session.phase,
      participants: session.participants.map(sanitizeParticipant),
      settings: session.settings,
      turnTimeSeconds: session.turnTimeSeconds,
    });

    // Audit log
    auditLogger.log('session:joined', {
      sessionId: session.sessionId,
      sessionCode: normalizedCode,
      actorId: participantId,
      actorName: guestName,
      actorRole: 'participant',
      ipAddress: getClientIP(socket),
    });

    console.log('Participant joined:', normalizedCode, guestName);
  });

  // Reconnect to existing session (after page refresh or disconnect)
  socket.on('session:reconnect', async (rawData) => {
    // Validate input
    const validation = validateEvent(SessionReconnectSchema, rawData, 'session:reconnect');
    if (!validation.success) {
      socket.emit('session:error', `Invalid reconnection data: ${validation.error}`);
      return;
    }

    const { sessionCode, participantId } = validation.data;
    const normalizedCode = sessionCode.toUpperCase();
    const session = await sessionStore.get(normalizedCode);

    if (!session) {
      socket.emit('session:error', 'Session no longer exists.');
      return;
    }

    // Find the participant
    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) {
      socket.emit('session:error', 'You are not a participant in this session.');
      return;
    }

    // Update participant's socket and connection status
    participant.socketId = socket.id;
    participant.isConnected = true;
    await sessionStore.set(normalizedCode, session);

    socket.join(normalizedCode);
    currentSessionCode = normalizedCode;
    currentParticipantId = participantId;

    // Send full session state to reconnecting client
    socket.emit('session:reconnected', {
      session: {
        ...session,
        participants: session.participants.map(sanitizeParticipant),
      },
      participantId,
    });

    // Notify other participants
    socket.to(normalizedCode).emit('participant:reconnected', participantId);

    console.log('Participant reconnected:', normalizedCode, participant.name);
  });

  // Join as observer (B2B feature)
  socket.on('observer:join', async (rawData) => {
    // Rate limiting check
    const clientIP = getClientIP(socket);
    const rateCheck = joinRateLimiter.check(clientIP);
    if (!rateCheck.allowed) {
      socket.emit('session:error', `Too many join attempts. Try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`);
      return;
    }

    // Validate input
    const validation = validateEvent(ObserverJoinSchema, rawData, 'observer:join');
    if (!validation.success) {
      socket.emit('session:error', `Invalid input: ${validation.error}`);
      return;
    }

    const { code, observerName } = validation.data;
    const normalizedCode = code.toUpperCase();
    const session = await sessionStore.get(normalizedCode);

    if (!session) {
      socket.emit('session:error', 'Session not found. Please check the code.');
      return;
    }

    // Initialize observers array if not exists (for backwards compatibility)
    if (!session.observers) {
      session.observers = [];
    }

    // Limit number of observers (prevent abuse)
    if (session.observers.length >= 5) {
      socket.emit('session:error', 'Maximum number of observers reached.');
      return;
    }

    const observerId = generateId();
    const observer = {
      id: observerId,
      name: observerName,
      role: 'observer',
      isConnected: true,
      language: 'en',
      isObserver: true,
      socketId: socket.id,
    };

    session.observers.push(observer);
    await sessionStore.set(normalizedCode, session);

    socket.join(normalizedCode);
    currentSessionCode = normalizedCode;
    currentParticipantId = observerId;

    // Send session state to observer (respecting observerSettings)
    const observerView = {
      sessionId: session.sessionId,
      phase: session.phase,
      participants: session.participants.map(sanitizeParticipant),
      observers: session.observers.map(sanitizeParticipant),
      observerId,
      observerSettings: session.observerSettings,
      roundNumber: session.roundNumber,
      currentSpeakerId: session.currentSpeakerId,
      turnStartedAt: session.turnStartedAt,
      turnTimeSeconds: session.turnTimeSeconds,
      isObserverMode: true,
    };

    // Include optional data based on settings
    if (session.observerSettings?.canViewTranscript) {
      observerView.transcript = session.transcript;
    }
    if (session.observerSettings?.canViewSpeakingTime) {
      observerView.speakingTime = session.speakingTime || [];
    }

    socket.emit('observer:joined', observerView);

    // Notify participants that an observer joined (optional - can be silent)
    socket.to(normalizedCode).emit('observer:connected', {
      observerId,
      observerName,
      observerCount: session.observers.length,
    });

    // Audit log
    auditLogger.log('observer:joined', {
      sessionId: session.sessionId,
      sessionCode: normalizedCode,
      actorId: observerId,
      actorName: observerName,
      actorRole: 'observer',
      ipAddress: getClientIP(socket),
    });

    console.log('Observer joined:', normalizedCode, observerName);
  });

  // Update observer settings (host only)
  socket.on('observer:settings', async (rawData) => {
    if (!currentSessionCode || !currentParticipantId) return;

    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Only the host (first participant) can update observer settings
    const isHost = session.participants[0]?.id === currentParticipantId;
    if (!isHost) {
      socket.emit('session:error', 'Only the host can update observer settings.');
      return;
    }

    // Validate settings
    const validation = validateEvent(ObserverSettingsSchema, rawData, 'observer:settings');
    if (!validation.success) {
      return;
    }

    session.observerSettings = {
      ...session.observerSettings,
      ...validation.data,
    };

    await sessionStore.set(currentSessionCode, session);

    // Notify all observers of settings change
    io.to(currentSessionCode).emit('session:updated', {
      observerSettings: session.observerSettings,
    });

    console.log('Observer settings updated:', currentSessionCode);
  });

  // Sync session state
  // Security: Zod schema validation + field whitelist
  socket.on('session:sync', async (rawData) => {
    if (!currentSessionCode) return;

    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Validate with Zod schema (strict mode rejects unknown fields)
    const validation = validateEvent(SessionSyncSchema, rawData, 'session:sync');
    if (!validation.success) {
      // Don't emit error for sync - just ignore invalid data
      console.warn('session:sync validation failed:', validation.error);
      return;
    }

    const sanitizedData = validation.data;

    // Only proceed if there's valid data to sync
    if (Object.keys(sanitizedData).length === 0) {
      return;
    }

    // Safe merge with validated fields only
    Object.assign(session, sanitizedData);
    await sessionStore.set(currentSessionCode, session);

    // Broadcast only the validated data to participants
    socket.to(currentSessionCode).emit('session:updated', sanitizedData);
  });

  // Turn ended - switch to next speaker immediately
  socket.on('turn:end', async () => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Calculate speaking time for the ending turn
    if (session.turnStartedAt && session.currentSpeakerId) {
      const turnDuration = Math.floor((Date.now() - session.turnStartedAt) / 1000);

      // Initialize speakingTime array if not exists
      if (!session.speakingTime) {
        session.speakingTime = [];
      }

      // Find or create record for current speaker
      const existingRecord = session.speakingTime.find(
        (r) => r.participantId === session.currentSpeakerId
      );

      if (existingRecord) {
        existingRecord.totalSeconds += turnDuration;
        existingRecord.turnCount += 1;
      } else {
        session.speakingTime.push({
          participantId: session.currentSpeakerId,
          totalSeconds: turnDuration,
          turnCount: 1,
        });
      }
    }

    const currentIndex = session.participants.findIndex(
      (p) => p.id === session.currentSpeakerId
    );
    const nextIndex = (currentIndex + 1) % session.participants.length;
    const nextSpeaker = session.participants[nextIndex];

    // Increment round when cycling back to first speaker
    if (nextIndex === 0) {
      session.roundNumber++;
    }

    // Check if max rounds reached (settings.maxRounds > 0 means there's a limit)
    const maxRounds = session.settings?.maxRounds || 0;
    if (maxRounds > 0 && session.roundNumber > maxRounds) {
      // End the conversation
      session.phase = 'ended';
      session.turnStartedAt = null;
      await sessionStore.set(currentSessionCode, session);

      io.to(currentSessionCode).emit('session:updated', {
        phase: 'ended',
        turnStartedAt: null,
        roundNumber: session.roundNumber,
        speakingTime: session.speakingTime,
      });

      console.log(`Max rounds (${maxRounds}) reached, ending conversation`);
      return;
    }

    // Switch to next speaker and start their turn immediately
    session.currentSpeakerId = nextSpeaker?.id || null;
    session.turnStartedAt = Date.now(); // Start the timer immediately
    session.phase = 'active'; // Stay in active phase

    // Update roles
    session.participants = session.participants.map((p) => ({
      ...p,
      role: p.id === session.currentSpeakerId ? 'speaker' : 'listener',
    }));

    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      phase: session.phase,
      currentSpeakerId: session.currentSpeakerId,
      roundNumber: session.roundNumber,
      turnStartedAt: session.turnStartedAt,
      participants: session.participants.map(sanitizeParticipant),
      speakingTime: session.speakingTime,
    });

    console.log(`Turn switched to ${nextSpeaker?.name}, round ${session.roundNumber}`);
  });

  // Add transcript entry
  socket.on('transcript:add', async (rawData) => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Validate input
    const validation = validateEvent(TranscriptAddSchema, rawData, 'transcript:add');
    if (!validation.success) {
      socket.emit('session:error', `Invalid transcript entry: ${validation.error}`);
      return;
    }

    const { participantId, participantName, text } = validation.data;

    // Verify participant is in this session
    const isParticipant = session.participants.some(p => p.id === participantId);
    if (!isParticipant) {
      console.warn('transcript:add from non-participant:', participantId);
      return;
    }

    const entry = {
      id: generateId(),
      participantId,
      participantName,
      text,
      timestamp: Date.now(),
      roundNumber: session.roundNumber,
    };

    session.transcript.push(entry);
    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      transcript: session.transcript,
    });
  });

  // Pause request
  socket.on('pause:request', async (rawReason) => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Validate reason string
    const validation = validateEvent(PauseReasonSchema, rawReason, 'pause:request');
    const reason = validation.success ? validation.data : null;

    session.phase = 'paused';
    session.pauseReason = reason;
    session.turnStartedAt = null;
    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'paused',
      pauseReason: reason,
      turnStartedAt: null,
    });

    // Audit log
    const participant = session.participants.find(p => p.id === currentParticipantId);
    auditLogger.log('conversation:paused', {
      sessionId: session.sessionId,
      sessionCode: currentSessionCode,
      actorId: currentParticipantId,
      actorName: participant?.name || 'Unknown',
      actorRole: 'participant',
      metadata: { reason },
    });
  });

  // Resume from pause
  socket.on('pause:resume', async () => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    session.phase = 'active';
    session.pauseReason = null;
    session.turnStartedAt = Date.now();
    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'active',
      pauseReason: null,
      turnStartedAt: session.turnStartedAt,
    });
  });

  // Breathing exercise start - waits for BOTH participants to be ready
  socket.on('breathing:start', async () => {
    if (!currentSessionCode || !currentParticipantId) return;

    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Initialize readyParticipants if not exists
    if (!session.readyParticipants) {
      session.readyParticipants = [];
    }

    // Mark this participant as ready
    if (!session.readyParticipants.includes(currentParticipantId)) {
      session.readyParticipants.push(currentParticipantId);
    }

    await sessionStore.set(currentSessionCode, session);

    // Notify all participants about ready status
    io.to(currentSessionCode).emit('session:updated', {
      readyParticipants: session.readyParticipants,
    });

    // Check if ALL participants are ready (need at least 2)
    if (session.participants.length >= 2 &&
        session.readyParticipants.length >= session.participants.length) {

      // Check if breathing exercise is disabled - skip directly to active
      if (session.settings?.enableBreathingExercise === false) {
        session.phase = 'active';
        session.roundNumber = 1;
        session.currentSpeakerId = session.participants[0]?.id || null;
        session.turnStartedAt = Date.now();

        session.participants = session.participants.map((p, i) => ({
          ...p,
          role: i === 0 ? 'speaker' : 'listener',
        }));

        // Clear the tracking arrays
        session.readyParticipants = [];

        await sessionStore.set(currentSessionCode, session);

        io.to(currentSessionCode).emit('session:updated', {
          phase: 'active',
          roundNumber: session.roundNumber,
          currentSpeakerId: session.currentSpeakerId,
          turnStartedAt: session.turnStartedAt,
          participants: session.participants.map(sanitizeParticipant),
        });

        console.log('Breathing disabled, starting conversation directly');
        return;
      }

      // Everyone is ready - start breathing
      session.phase = 'breathing';
      await sessionStore.set(currentSessionCode, session);

      io.to(currentSessionCode).emit('session:updated', {
        phase: 'breathing',
      });

      console.log('All participants ready, starting breathing exercise');
    } else {
      console.log(`Waiting for participants: ${session.readyParticipants.length}/${session.participants.length} ready`);
    }
  });

  // Breathing complete - waits for BOTH participants
  socket.on('breathing:complete', async () => {
    if (!currentSessionCode || !currentParticipantId) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Initialize breathingComplete if not exists
    if (!session.breathingComplete) {
      session.breathingComplete = [];
    }

    // Mark this participant as done with breathing
    if (!session.breathingComplete.includes(currentParticipantId)) {
      session.breathingComplete.push(currentParticipantId);
    }

    await sessionStore.set(currentSessionCode, session);

    // Check if ALL participants are done with breathing
    if (session.participants.length >= 2 &&
        session.breathingComplete.length >= session.participants.length) {

      // Everyone is done - start the conversation
      session.phase = 'active';
      session.roundNumber = 1;
      session.currentSpeakerId = session.participants[0]?.id || null;
      session.turnStartedAt = Date.now();

      session.participants = session.participants.map((p, i) => ({
        ...p,
        role: i === 0 ? 'speaker' : 'listener',
      }));

      // Clear the tracking arrays
      session.readyParticipants = [];
      session.breathingComplete = [];

      await sessionStore.set(currentSessionCode, session);

      io.to(currentSessionCode).emit('session:updated', {
        phase: 'active',
        roundNumber: session.roundNumber,
        currentSpeakerId: session.currentSpeakerId,
        turnStartedAt: session.turnStartedAt,
        participants: session.participants.map(sanitizeParticipant),
      });

      console.log('All participants completed breathing, starting conversation');
    } else {
      console.log(`Waiting for breathing: ${session.breathingComplete.length}/${session.participants.length} complete`);
    }
  });

  // Reflection dismissed
  socket.on('reflection:dismiss', async () => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    session.phase = 'active';
    session.turnStartedAt = Date.now();
    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'active',
      turnStartedAt: session.turnStartedAt,
      currentReflectionPrompt: null,
    });
  });

  // End the conversation
  socket.on('conversation:end', async () => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    session.phase = 'ended';
    session.turnStartedAt = null;
    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'ended',
      turnStartedAt: null,
    });

    // Audit log
    auditLogger.log('session:ended', {
      sessionId: session.sessionId,
      sessionCode: currentSessionCode,
      actorId: currentParticipantId || 'system',
      actorName: session.participants.find(p => p.id === currentParticipantId)?.name || 'System',
      actorRole: currentParticipantId ? 'participant' : 'system',
      metadata: {
        roundsCompleted: session.roundNumber,
        transcriptEntries: session.transcript?.length || 0,
        speakingTime: session.speakingTime,
      },
    });

    console.log('Conversation ended:', currentSessionCode);
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    if (currentSessionCode) {
      const session = await sessionStore.get(currentSessionCode);
      if (session) {
        const participant = session.participants.find(
          (p) => p.socketId === socket.id
        );

        if (participant) {
          participant.isConnected = false;
          await sessionStore.set(currentSessionCode, session);

          io.to(currentSessionCode).emit('participant:disconnected', participant.id);

          // Clean up session if both participants disconnected
          const allDisconnected = session.participants.every((p) => !p.isConnected);
          if (allDisconnected) {
            const sessionCodeToClean = currentSessionCode;
            setTimeout(async () => {
              const currentSession = await sessionStore.get(sessionCodeToClean);
              if (currentSession) {
                const stillAllDisconnected = currentSession.participants.every(
                  (p) => !p.isConnected
                );
                if (stillAllDisconnected) {
                  await sessionStore.delete(sessionCodeToClean);
                  console.log('Session cleaned up:', sessionCodeToClean);
                }
              }
            }, 60000); // 1 minute grace period
          }
        }
      }
    }
  });
});

// Utility functions

/**
 * Generate cryptographically secure session code
 * Uses crypto.randomBytes instead of Math.random for unpredictability
 * Security fix: Prevents session code guessing/brute-force attacks
 */
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

/**
 * Generate cryptographically secure unique ID
 * Uses crypto.randomUUID for guaranteed uniqueness and unpredictability
 * Security fix: Prevents participant ID prediction/forgery
 */
function generateId() {
  return crypto.randomUUID();
}

function sanitizeParticipant(p) {
  const { socketId, ...rest } = p;
  return rest;
}

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
