'use client';

import { Speaker, Transcript } from '@/lib/reportsApi';

interface ReportsSidebarProps {
  speakers: Speaker[];
  transcripts: Transcript[];
  selectedSpeakerId?: number;
  selectedTranscriptId?: number;
  selectedCategory: string;
  documentNameFilter: string;
  onSpeakerChange: (speakerId?: number) => void;
  onTranscriptChange: (transcriptId?: number) => void;
  onCategoryChange: (category: string) => void;
  onDocumentNameChange: (name: string) => void;
}

export function ReportsSidebar({
  speakers,
  transcripts,
  selectedSpeakerId,
  selectedTranscriptId,
  selectedCategory,
  documentNameFilter,
  onSpeakerChange,
  onTranscriptChange,
  onCategoryChange,
  onDocumentNameChange,
}: ReportsSidebarProps) {
  return (
    <div
      className="w-64 p-6 space-y-6"
      style={{
        backgroundColor: 'var(--card-background)',
        borderRight: '1px solid var(--border-soft)',
      }}
    >
      <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
        Filters
      </h2>

      {/* Category Filter */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border-soft)',
            color: 'var(--foreground)',
          }}
        >
          <option value="dear_man">DEAR MAN</option>
          <option value="fast">FAST</option>
          <option value="sentiment">Sentiment</option>
        </select>
      </div>

      {/* Speaker Filter */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Speaker
        </label>
        <select
          value={selectedSpeakerId || ''}
          onChange={(e) => onSpeakerChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full p-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border-soft)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">All Speakers</option>
          {speakers.map((speaker) => (
            <option key={speaker.id} value={speaker.id}>
              {speaker.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transcript Filter */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Transcript
        </label>
        <select
          value={selectedTranscriptId || ''}
          onChange={(e) => onTranscriptChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full p-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border-soft)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">All Transcripts</option>
          {transcripts.map((transcript) => (
            <option key={transcript.id} value={transcript.id}>
              {transcript.name} ({new Date(transcript.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {/* Document Name Filter */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Document Name
        </label>
        <input
          type="text"
          value={documentNameFilter}
          onChange={(e) => onDocumentNameChange(e.target.value)}
          placeholder="Filter by name..."
          className="w-full p-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border-soft)',
            color: 'var(--foreground)',
          }}
        />
      </div>
    </div>
  );
}
