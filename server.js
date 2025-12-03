// Socket.io server for Mediator real-time sync
// Run with: node server.js

const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
  },
});

// In-memory session storage (use Redis in production)
const sessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  let currentSessionCode = null;
  let currentParticipantId = null;

  // Create a new session
  socket.on('session:create', ({ hostName, language }) => {
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
    };

    sessions.set(sessionCode, session);
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
  socket.on('session:join', ({ code, guestName, language }) => {
    const session = sessions.get(code.toUpperCase());

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

    socket.join(code.toUpperCase());
    currentSessionCode = code.toUpperCase();
    currentParticipantId = participantId;

    // Notify the joiner
    socket.emit('session:joined', {
      participantId,
      participants: session.participants.map(sanitizeParticipant),
      sessionId: session.sessionId,
    });

    // Notify all in session
    io.to(code.toUpperCase()).emit('session:updated', {
      phase: session.phase,
      participants: session.participants.map(sanitizeParticipant),
    });

    console.log('Participant joined:', code, guestName);
  });

  // Sync session state
  socket.on('session:sync', (data) => {
    if (!currentSessionCode) return;

    const session = sessions.get(currentSessionCode);
    if (!session) return;

    // Merge state updates
    Object.assign(session, data);

    // Broadcast to all participants
    socket.to(currentSessionCode).emit('session:updated', data);
  });

  // Turn ended
  socket.on('turn:end', () => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
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

    io.to(currentSessionCode).emit('session:updated', {
      phase: session.phase,
      currentSpeakerId: session.currentSpeakerId,
      roundNumber: session.roundNumber,
      turnStartedAt: session.turnStartedAt,
      participants: session.participants.map(sanitizeParticipant),
    });
  });

  // Add transcript entry
  socket.on('transcript:add', ({ participantId, participantName, text }) => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session) return;

    const entry = {
      id: generateId(),
      participantId,
      participantName,
      text,
      timestamp: Date.now(),
      roundNumber: session.roundNumber,
    };

    session.transcript.push(entry);

    io.to(currentSessionCode).emit('session:updated', {
      transcript: session.transcript,
    });
  });

  // Pause request
  socket.on('pause:request', (reason) => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session) return;

    session.phase = 'paused';
    session.pauseReason = reason;
    session.turnStartedAt = null;

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'paused',
      pauseReason: reason,
      turnStartedAt: null,
    });
  });

  // Resume from pause
  socket.on('pause:resume', () => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session) return;

    session.phase = 'active';
    session.pauseReason = null;
    session.turnStartedAt = Date.now();

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'active',
      pauseReason: null,
      turnStartedAt: session.turnStartedAt,
    });
  });

  // Breathing exercise start
  socket.on('breathing:start', () => {
    if (!currentSessionCode) return;

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'breathing',
    });
  });

  // Breathing complete
  socket.on('breathing:complete', () => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
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

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'active',
      roundNumber: session.roundNumber,
      currentSpeakerId: session.currentSpeakerId,
      turnStartedAt: session.turnStartedAt,
      participants: session.participants.map(sanitizeParticipant),
    });
  });

  // Reflection dismissed
  socket.on('reflection:dismiss', () => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session) return;

    session.phase = 'active';
    session.turnStartedAt = Date.now();

    io.to(currentSessionCode).emit('session:updated', {
      phase: 'active',
      turnStartedAt: session.turnStartedAt,
      currentReflectionPrompt: null,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    if (currentSessionCode) {
      const session = sessions.get(currentSessionCode);
      if (session) {
        const participant = session.participants.find(
          (p) => p.socketId === socket.id
        );

        if (participant) {
          participant.isConnected = false;

          io.to(currentSessionCode).emit('participant:disconnected', participant.id);

          // Clean up session if both participants disconnected
          const allDisconnected = session.participants.every((p) => !p.isConnected);
          if (allDisconnected) {
            setTimeout(() => {
              const currentSession = sessions.get(currentSessionCode);
              if (currentSession) {
                const stillAllDisconnected = currentSession.participants.every(
                  (p) => !p.isConnected
                );
                if (stillAllDisconnected) {
                  sessions.delete(currentSessionCode);
                  console.log('Session cleaned up:', currentSessionCode);
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
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function sanitizeParticipant(p) {
  const { socketId, ...rest } = p;
  return rest;
}

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
