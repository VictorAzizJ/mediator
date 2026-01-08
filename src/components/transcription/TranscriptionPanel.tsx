'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TranscriptionSegment, Participant } from '@/types';

interface TranscriptionPanelProps {
  segments: TranscriptionSegment[];
  currentSegment: TranscriptionSegment | null;
  participants: Participant[];
  currentUserId?: string;
  isActive: boolean;
  showSpeakerLabels?: boolean;
  highlightTriggers?: boolean;
  compact?: boolean;
}

export function TranscriptionPanel({
  segments,
  currentSegment,
  participants,
  currentUserId,
  isActive,
  showSpeakerLabels = true,
  highlightTriggers = true,
  compact = false,
}: TranscriptionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, currentSegment]);

  // Map speaker IDs to participant info
  const speakerMap = useMemo(() => {
    const map = new Map<number, Participant>();
    participants.forEach((p, index) => {
      map.set(index, p);
    });
    return map;
  }, [participants]);

  const getSpeakerInfo = (speakerId: number) => {
    const participant = speakerMap.get(speakerId);
    const isCurrentUser = participant?.id === currentUserId;
    return {
      name: participant?.name || `Speaker ${speakerId + 1}`,
      isCurrentUser,
      color: isCurrentUser ? 'var(--color-calm-700)' : 'var(--color-calm-400)',
      bgColor: isCurrentUser ? 'var(--color-calm-100)' : 'var(--color-calm-50)',
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive && segments.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${compact ? '' : 'border'}`}
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border-soft)',
      }}
    >
      {/* Header */}
      {!compact && (
        <div
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              Transcript
            </span>
            {isActive && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
            {segments.length} segments
          </span>
        </div>
      )}

      {/* Transcript content */}
      <div
        ref={scrollRef}
        className={`overflow-y-auto ${compact ? 'max-h-48 p-3' : 'max-h-96 p-4'}`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {segments.length === 0 && !currentSegment ? (
          <div
            className="text-center py-8"
            style={{ color: 'var(--color-calm-400)' }}
          >
            <p className="text-sm">
              {isActive
                ? 'Listening for speech...'
                : 'No transcript available'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {segments.map((segment) => {
                const speaker = getSpeakerInfo(segment.speaker);
                return (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-1"
                  >
                    {showSpeakerLabels && (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: speaker.color }}
                        >
                          {speaker.isCurrentUser ? 'You' : speaker.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-calm-300)' }}
                        >
                          {formatTime(segment.start)}
                        </span>
                      </div>
                    )}
                    <div
                      className="px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: speaker.bgColor,
                        borderLeft: `3px solid ${speaker.color}`,
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {segment.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Current (interim) segment */}
            {currentSegment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                className="flex flex-col gap-1"
              >
                {showSpeakerLabels && (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: getSpeakerInfo(currentSegment.speaker).color,
                      }}
                    >
                      {getSpeakerInfo(currentSegment.speaker).isCurrentUser
                        ? 'You'
                        : getSpeakerInfo(currentSegment.speaker).name}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-calm-300)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      typing...
                    </span>
                  </div>
                )}
                <div
                  className="px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: getSpeakerInfo(currentSegment.speaker).bgColor,
                    borderLeft: `3px solid ${getSpeakerInfo(currentSegment.speaker).color}`,
                    opacity: 0.7,
                  }}
                >
                  <p
                    className="text-sm leading-relaxed italic"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {currentSegment.text}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact inline transcript for conversation header
export function TranscriptionCompact({
  currentSegment,
  lastSegment,
}: {
  currentSegment: TranscriptionSegment | null;
  lastSegment: TranscriptionSegment | null;
}) {
  const displaySegment = currentSegment || lastSegment;

  if (!displaySegment) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 max-w-xs overflow-hidden">
      {currentSegment && (
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
      )}
      <p
        className="text-xs truncate"
        style={{ color: 'var(--color-calm-500)' }}
      >
        "{displaySegment.text}"
      </p>
    </div>
  );
}
