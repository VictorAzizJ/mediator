// Socket.io server for Mediator real-time sync
// Run with: node server.js

const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const { z } = require('zod');
const Redis = require('ioredis');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
    methods: ['GET', 'POST'],
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

const SessionCreateSchema = z.object({
  hostName: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .trim(),
  language: LanguageSchema,
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

const SessionSyncSchema = z.object({
  volumeLevel: z.number().min(0).max(100).optional(),
  currentReflectionPrompt: z.string().max(1000).optional(),
  privateNotes: z.string().max(5000).optional(),
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
      console.warn(`Validation failed for ${eventName}:`, err.errors);
      return {
        success: false,
        error: err.errors.map(e => e.message).join(', ')
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

    const { hostName, language } = validation.data;
    const sessionCode = generateSessionCode();
    const sessionId = generateId();
    const participantId = generateId();

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
      currentSpeakerId: null,
      roundNumber: 0,
      turnTimeSeconds: 90,
      turnStartedAt: null,
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
    });

    // Notify all in session
    io.to(normalizedCode).emit('session:updated', {
      phase: session.phase,
      participants: session.participants.map(sanitizeParticipant),
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

  // Turn ended
  socket.on('turn:end', async () => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    const currentIndex = session.participants.findIndex(
      (p) => p.id === session.currentSpeakerId
    );
    const nextIndex = (currentIndex + 1) % session.participants.length;
    const nextSpeaker = session.participants[nextIndex];

    session.currentSpeakerId = nextSpeaker?.id || null;
    session.turnStartedAt = null;
    session.phase = 'reflection';

    if (nextIndex === 0) {
      session.roundNumber++;
    }

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
    });
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

  // Breathing exercise start
  socket.on('breathing:start', async () => {
    if (!currentSessionCode) return;

    const session = await sessionStore.get(currentSessionCode);
    if (session) {
      session.phase = 'breathing';
      await sessionStore.set(currentSessionCode, session);
    }

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'breathing',
    });
  });

  // Breathing complete
  socket.on('breathing:complete', async () => {
    if (!currentSessionCode) return;
    const session = await sessionStore.get(currentSessionCode);
    if (!session) return;

    // Start the conversation after breathing
    session.phase = 'active';
    session.roundNumber = 1;
    session.currentSpeakerId = session.participants[0]?.id || null;
    session.turnStartedAt = Date.now();

    session.participants = session.participants.map((p, i) => ({
      ...p,
      role: i === 0 ? 'speaker' : 'listener',
    }));

    await sessionStore.set(currentSessionCode, session);

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'active',
      roundNumber: session.roundNumber,
      currentSpeakerId: session.currentSpeakerId,
      turnStartedAt: session.turnStartedAt,
      participants: session.participants.map(sanitizeParticipant),
    });
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
