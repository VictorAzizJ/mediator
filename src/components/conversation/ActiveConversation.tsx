'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/session';
import { useVolumeMonitor } from '@/hooks/useVolumeMonitor';
import { getSocket } from '@/lib/socket';
import { Timer } from '@/components/ui/Timer';
import { VolumeIndicator } from '@/components/ui/VolumeIndicator';
import { ParticipantCard } from '@/components/ui/ParticipantCard';
import { ReflectionPrompt } from '@/components/ui/ReflectionPrompt';
import { PauseOverlay } from '@/components/ui/PauseOverlay';
import { SpeakingTimeCompact } from '@/components/ui/SpeakingTimeBar';
import { RoundPromptCompact } from '@/components/skill/RoundPromptDisplay';
import { SkillReferenceCard } from '@/components/skill/SkillReferenceCard';

interface ActiveConversationProps {
  currentUserId: string;
  onEndTurn: () => void;
  onExtendTurn: (seconds: number) => void;
  onRequestPause: () => void;
  onResume: () => void;
  onDismissReflection: () => void;
  onStartBreathing: () => void;
  onEndConversation: () => void;
}

export function ActiveConversation({
  currentUserId,
  onEndTurn,
  onExtendTurn,
  onRequestPause,
  onResume,
  onDismissReflection,
  onStartBreathing,
  onEndConversation,
}: ActiveConversationProps) {
  const {
    sessionCode,
    participants,
    currentSpeakerId,
    turnTimeSeconds,
    turnStartedAt,
    phase,
    pauseReason,
    currentReflectionPrompt,
    roundNumber,
    speakingTime,
    syncState,
    selectedSkillTemplate,
  } = useSessionStore();

  // Get current round prompt if using skill template
  const currentRoundPrompt = selectedSkillTemplate?.rounds[roundNumber - 1] || null;
  const isSkillBased = !!selectedSkillTemplate;

  // Track recorded audio chunks count and bytes sent
  const [chunksRecorded, setChunksRecorded] = useState(0);
  const [bytesSent, setBytesSent] = useState(0);
  const [streamingStatus, setStreamingStatus] = useState<'idle' | 'streaming' | 'error'>('idle');
  
  // Track if we've set up socket listeners
  const socketListenersSetup = useRef(false);

  // ============================================================================
  // BROADCAST CHANNEL: Turn-based recording leadership
  // The current speaker's window becomes the recording leader
  // ============================================================================
  
  // Unique ID for this window/tab - includes the user ID for turn-based coordination
  const windowIdRef = useRef<string>(`window_${currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const [isRecordingLeader, setIsRecordingLeader] = useState(false);
  
  // Track if it's this user's turn to speak
  const isMyTurn = currentSpeakerId === currentUserId;
  
  // Track the previous speaker to detect turn changes
  const prevSpeakerIdRef = useRef<string | null>(null);

  // Initialize broadcast channel for cross-tab coordination
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionCode) return;

    const channelName = `mediator_audio_${sessionCode}`;
    const channel = new BroadcastChannel(channelName);
    broadcastChannelRef.current = channel;

    const windowId = windowIdRef.current;

    // Handle messages from other tabs
    channel.onmessage = (event) => {
      const { type, speakerId, senderId } = event.data;

      switch (type) {
        case 'TURN_STARTED':
          // Another user's turn started
          if (speakerId !== currentUserId) {
            // Not our turn, release leadership if we had it
            if (isRecordingLeader) {
              setIsRecordingLeader(false);
              console.log(`Audio recording: Turn changed to ${speakerId}, releasing leadership`);
            }
          }
          break;

        case 'LEADER_CLAIMED':
          // Another tab for the same user claimed leadership
          if (speakerId === currentUserId && senderId !== windowId) {
            // Another tab for our user claimed, we defer
            setIsRecordingLeader(false);
            console.log(`Audio recording: Another tab for user ${currentUserId} is recording`);
          }
          break;

        case 'LEADER_RELEASED':
          // A tab released leadership - only relevant if it's our turn
          if (isMyTurn && !isRecordingLeader) {
            // Claim leadership since it's our turn
            claimLeadership();
          }
          break;
      }
    };

    // Function to claim leadership
    const claimLeadership = () => {
      channel.postMessage({
        type: 'LEADER_CLAIMED',
        speakerId: currentUserId,
        senderId: windowId,
        timestamp: Date.now(),
      });
      setIsRecordingLeader(true);
      console.log(`Audio recording: This tab is now recording for user ${currentUserId}`);
    };

    // Clean up on unmount
    return () => {
      if (isRecordingLeader) {
        channel.postMessage({
          type: 'LEADER_RELEASED',
          speakerId: currentUserId,
          senderId: windowId,
          timestamp: Date.now(),
        });
      }
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [sessionCode, currentUserId, isRecordingLeader, isMyTurn]);

  // Handle turn changes - claim or release leadership based on whose turn it is
  useEffect(() => {
    const channel = broadcastChannelRef.current;
    if (!channel || phase !== 'active') return;

    const turnChanged = prevSpeakerIdRef.current !== currentSpeakerId;
    prevSpeakerIdRef.current = currentSpeakerId;

    if (isMyTurn) {
      // It's our turn - claim leadership if we don't have it
      if (!isRecordingLeader) {
        channel.postMessage({
          type: 'TURN_STARTED',
          speakerId: currentUserId,
          senderId: windowIdRef.current,
          timestamp: Date.now(),
        });
        
        // Small delay to let other tabs release, then claim
        setTimeout(() => {
          channel.postMessage({
            type: 'LEADER_CLAIMED',
            speakerId: currentUserId,
            senderId: windowIdRef.current,
            timestamp: Date.now(),
          });
          setIsRecordingLeader(true);
          console.log(`Audio recording: Turn started - this tab is now recording for ${currentUserId}`);
        }, 50);
      }
    } else if (turnChanged && isRecordingLeader) {
      // Turn changed and it's no longer our turn - release leadership
      channel.postMessage({
        type: 'LEADER_RELEASED',
        speakerId: currentUserId,
        senderId: windowIdRef.current,
        timestamp: Date.now(),
      });
      setIsRecordingLeader(false);
      console.log(`Audio recording: Turn ended - releasing leadership`);
    }
  }, [currentSpeakerId, currentUserId, isMyTurn, isRecordingLeader, phase]);

  // Release leadership when conversation ends
  useEffect(() => {
    if ((phase === 'ended' || phase === 'summary') && isRecordingLeader) {
      const channel = broadcastChannelRef.current;
      if (channel) {
        channel.postMessage({
          type: 'LEADER_RELEASED',
          speakerId: currentUserId,
          senderId: windowIdRef.current,
          timestamp: Date.now(),
        });
      }
      setIsRecordingLeader(false);
    }
  }, [phase, isRecordingLeader, currentUserId]);

  // Set up socket listeners for audio responses
  useEffect(() => {
    const socket = getSocket();
    if (!socket || socketListenersSetup.current) return;

    socket.on('audio:chunk:received', (data: { filename: string; bytesWritten: number; totalSize: number }) => {
      setBytesSent(data.totalSize);
      console.log(`Audio chunk confirmed: ${data.filename} (total: ${data.totalSize} bytes)`);
    });

    socket.on('audio:chunk:error', (data: { error: string }) => {
      console.error('Audio streaming error:', data.error);
      setStreamingStatus('error');
    });

    socket.on('audio:finalized', (data: { filename: string; path: string; size: number }) => {
      console.log(`Audio recording finalized: ${data.path} (${data.size} bytes)`);
    });

    socketListenersSetup.current = true;

    return () => {
      socket.off('audio:chunk:received');
      socket.off('audio:chunk:error');
      socket.off('audio:finalized');
      socketListenersSetup.current = false;
    };
  }, []);

  // Handle audio chunk - send to server via socket (only if this tab is the leader)
  const handleAudioChunk = useCallback(async (chunk: Blob) => {
    // Always count chunks for UI display
    setChunksRecorded((prev) => prev + 1);
    
    // Only send to server if this tab is the recording leader
    if (!isRecordingLeader) {
      console.log('Audio chunk recorded but not sent (another tab is the leader)');
      return;
    }
    
    const socket = getSocket();
    if (!socket?.connected) {
      console.warn('Socket not connected, cannot send audio chunk');
      return;
    }

    try {
      // Convert blob to base64 for transmission (browser-compatible)
      const arrayBuffer = await chunk.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64Data = btoa(binaryString);

      // Send audio chunk to server
      socket.emit('audio:chunk', {
        audioData: base64Data,
        filename: `${sessionCode || 'recording'}.webm`,
        mimeType: chunk.type,
      });

      setStreamingStatus('streaming');
      console.log(`Audio chunk sent: ${chunk.size} bytes`);
    } catch (err) {
      console.error('Error sending audio chunk:', err);
      setStreamingStatus('error');
    }
  }, [sessionCode, isRecordingLeader]);

  // Initialize volume monitoring with audio recording
  const {
    volumeLevel,
    isListening,
    isRecording,
    startListening,
    stopListening,
    error: micError,
  } = useVolumeMonitor({
    onHighVolume: (level) => {
      // Auto-pause if volume stays high
      console.log('High volume detected:', level);
      onRequestPause();
    },
    onVolumeChange: (level) => {
      // Update store with current volume
      syncState({ volumeLevel: level });
    },
    onAudioChunk: handleAudioChunk,
    recordingIntervalMs: 1000, // Record in 1 second chunks
  });

  // Start listening and recording when conversation becomes active
  useEffect(() => {
    if (phase === 'active' && !isListening) {
      startListening();
      setStreamingStatus('idle');
      setChunksRecorded(0);
      setBytesSent(0);
    }
  }, [phase, isListening, startListening]);

  // Finalize audio recording when conversation ends
  useEffect(() => {
    if (phase === 'ended' || phase === 'summary') {
      if (isListening) {
        stopListening();
        
        // Tell server to finalize the recording
        const socket = getSocket();
        if (socket?.connected && sessionCode) {
          socket.emit('audio:finalize', { filename: `${sessionCode}.webm` });
          console.log(`Audio recording finalized for session: ${sessionCode}`);
        }
        
        setStreamingStatus('idle');
      }
    }
  }, [phase, isListening, stopListening, sessionCode]);

  const [showExtendOption, setShowExtendOption] = useState(false);
  const currentParticipant = participants.find((p) => p.id === currentUserId);
  const otherParticipant = participants.find((p) => p.id !== currentUserId);
  const isSpeaking = currentSpeakerId === currentUserId;

  // Show extend option when timer is low
  useEffect(() => {
    if (!turnStartedAt) return;

    const checkTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartedAt) / 1000);
      const remaining = turnTimeSeconds - elapsed;
      setShowExtendOption(remaining <= 15 && remaining > 0);
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [turnStartedAt, turnTimeSeconds]);

  const handleTurnComplete = () => {
    onEndTurn();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <div>
          <h1 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {isSkillBased ? selectedSkillTemplate.skill : 'Mediator'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
            Round {roundNumber}{isSkillBased ? ' of 3' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SpeakingTimeCompact
            speakingTime={speakingTime}
            participants={participants}
            currentUserId={currentUserId}
          />
          <div className="flex items-center gap-2">
            {/* Recording & Streaming indicator - turn-based */}
            {isRecording && (
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${isRecordingLeader ? 'animate-pulse' : ''}`}
                  style={{ 
                    backgroundColor: !isRecordingLeader
                      ? 'var(--color-calm-400)' // Gray when not your turn
                      : streamingStatus === 'error' 
                      ? 'var(--color-alert-red)' 
                      : streamingStatus === 'streaming' 
                      ? '#22c55e' 
                      : '#f59e0b' // Orange/amber for recording but not yet streaming
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                  {isMyTurn 
                    ? (isRecordingLeader 
                      ? (streamingStatus === 'streaming' ? 'Your turn · Streaming' : 'Your turn · Recording')
                      : 'Your turn')
                    : 'Listening'}
                </span>
              </div>
            )}
            {/* Chunks count and bytes - only show for leader */}
            {chunksRecorded > 0 && isRecordingLeader && (
              <span className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                {chunksRecorded}s {bytesSent > 0 && `(${Math.round(bytesSent / 1024)}KB)`}
              </span>
            )}
            {micError && (
              <span className="text-xs" style={{ color: 'var(--color-alert-red)' }}>
                Mic unavailable
              </span>
            )}
            <VolumeIndicator level={volumeLevel} showWarning />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 flex flex-col">
        {/* Participants */}
        <div className="flex justify-center gap-4 mb-8">
          {currentParticipant && (
            <ParticipantCard
              participant={currentParticipant}
              isSpeaking={isSpeaking}
              isCurrentUser
            />
          )}
          {otherParticipant && (
            <ParticipantCard
              participant={otherParticipant}
              isSpeaking={!isSpeaking}
            />
          )}
        </div>

        {/* Timer and controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {phase === 'active' && (
            <>
              <Timer
                duration={turnTimeSeconds}
                startedAt={turnStartedAt}
                onComplete={handleTurnComplete}
                size={160}
              />

              {/* Skill-based round prompt or generic instruction */}
              {isSkillBased && currentRoundPrompt ? (
                <div className="max-w-sm">
                  <RoundPromptCompact
                    roundNumber={roundNumber}
                    roundPrompt={currentRoundPrompt}
                  />
                </div>
              ) : (
                <motion.p
                  className="text-lg text-center max-w-xs"
                  style={{ color: 'var(--color-calm-600)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {isSpeaking
                    ? 'Share what you need to say'
                    : `Listen to ${otherParticipant?.name || 'them'} without interrupting`}
                </motion.p>
              )}

              {/* Speaker controls */}
              {isSpeaking && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  {showExtendOption && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => onExtendTurn(30)}
                      className="btn-gentle w-full"
                    >
                      Need more time? (+30s)
                    </motion.button>
                  )}
                  <button onClick={onEndTurn} className="btn-primary w-full">
                    I'm done speaking
                  </button>
                  <button onClick={onRequestPause} className="btn-secondary w-full">
                    I need a pause
                  </button>
                </div>
              )}

              {/* Listener controls */}
              {!isSpeaking && (
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={onRequestPause} className="btn-secondary w-full">
                    I need a moment
                  </button>
                </div>
              )}
            </>
          )}

          {/* Reflection prompt */}
          {phase === 'reflection' && currentReflectionPrompt && (
            <ReflectionPrompt
              prompt={currentReflectionPrompt.text}
              onDismiss={onDismissReflection}
              onTakeTime={() => onStartBreathing()}
            />
          )}
        </div>
      </main>

      {/* Footer - always visible exit option */}
      <footer className="p-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="flex flex-col gap-2">
          {/* Streaming status - show when it's your turn and streaming */}
          {isRecordingLeader && chunksRecorded > 0 && bytesSent > 0 && (
            <p className="text-center text-xs" style={{ color: 'var(--color-calm-500)' }}>
              Your audio streaming to server ({Math.round(bytesSent / 1024)}KB saved)
            </p>
          )}
          {/* Show message when listening (not your turn) */}
          {isRecording && !isMyTurn && (
            <p className="text-center text-xs" style={{ color: 'var(--color-calm-400)' }}>
              Listening while other participant speaks
            </p>
          )}
          <button
            onClick={onEndConversation}
            className="w-full text-center py-2 text-sm hover:underline"
            style={{ color: 'var(--color-calm-400)' }}
          >
            I need to stop this conversation
          </button>
        </div>
      </footer>

      {/* Skill Reference Card (floating) */}
      {isSkillBased && selectedSkillTemplate && (
        <SkillReferenceCard skill={selectedSkillTemplate.skill} />
      )}

      {/* Pause overlay */}
      <PauseOverlay
        isVisible={phase === 'paused'}
        reason={pauseReason}
        onResume={onResume}
        onStartBreathing={onStartBreathing}
      />
    </div>
  );
}
