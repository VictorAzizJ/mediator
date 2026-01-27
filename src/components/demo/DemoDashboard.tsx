'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { dbtSkillInfo, skillBasedTemplates } from '@/lib/dbtSkills';
import type { DBTSkill, SkillBasedTemplate } from '@/types';

interface DemoDashboardProps {
  userName: string | null;
  onStartConversation: (template?: SkillBasedTemplate) => void;
  onLearnSkills: () => void;
  onSetUserName: (name: string) => void;
}

export function DemoDashboard({
  userName,
  onStartConversation,
  onLearnSkills,
  onSetUserName,
}: DemoDashboardProps) {
  const [name, setName] = useState(userName || '');
  const [showNameInput, setShowNameInput] = useState(!userName);
  const [selectedView, setSelectedView] = useState<'home' | 'templates' | 'learn'>('home');
  const [selectedSkill, setSelectedSkill] = useState<DBTSkill | null>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSetUserName(name.trim());
      setShowNameInput(false);
    }
  };

  // Featured template for demo
  const featuredTemplate = skillBasedTemplates.find(
    (t) => t.id === 'dear-man-tech-nontech'
  );

  // Name input screen
  if (showNameInput) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-calm-100)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Welcome to Mediator
            </h1>
            <p style={{ color: 'var(--color-calm-500)' }}>
              What should we call you?
            </p>
          </div>

          <form onSubmit={handleNameSubmit} className="card">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input w-full mb-4"
              autoFocus
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Templates view
  if (selectedView === 'templates') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <header className="p-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <button
            onClick={() => setSelectedView('home')}
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-calm-500)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </button>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Choose a Scenario
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-calm-500)' }}>
            Select a guided conversation template to practice your communication skills.
          </p>

          {/* Skill filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSelectedSkill(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedSkill ? '' : 'opacity-60'
              }`}
              style={{
                backgroundColor: !selectedSkill ? 'var(--color-calm-700)' : 'var(--color-calm-100)',
                color: !selectedSkill ? 'white' : 'var(--color-calm-700)',
              }}
            >
              All Skills
            </button>
            {(['DEAR MAN', 'GIVE', 'FAST'] as DBTSkill[]).map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSkill === skill ? '' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: selectedSkill === skill ? 'var(--color-calm-700)' : 'var(--color-calm-100)',
                  color: selectedSkill === skill ? 'white' : 'var(--color-calm-700)',
                }}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillBasedTemplates
              .filter((t) => !selectedSkill || t.skill === selectedSkill)
              .map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => onStartConversation(template)}
                  className="text-left p-4 rounded-xl border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: template.id === 'dear-man-tech-nontech' ? 'var(--color-calm-400)' : 'var(--color-calm-200)',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {template.id === 'dear-man-tech-nontech' && (
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2"
                      style={{ backgroundColor: 'var(--color-safe-green)', color: 'white' }}
                    >
                      Recommended Demo
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--color-calm-100)',
                        color: 'var(--color-calm-700)',
                      }}
                    >
                      {template.skill}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                      ~{template.estimatedDuration}min
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                    {template.name}
                  </h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--color-calm-500)' }}>
                    {template.description}
                  </p>
                </motion.button>
              ))}
          </div>
        </main>
      </div>
    );
  }

  // Learn skills view
  if (selectedView === 'learn') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <header className="p-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <button
            onClick={() => setSelectedView('home')}
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-calm-500)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </button>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Learn the Skills
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-calm-500)' }}>
            DBT Interpersonal Effectiveness skills help you communicate assertively, maintain relationships, and protect your self-respect.
          </p>

          <div className="space-y-6">
            {(['DEAR MAN', 'GIVE', 'FAST'] as DBTSkill[]).map((skillId) => {
              const skill = dbtSkillInfo[skillId];
              return (
                <motion.div
                  key={skillId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                        {skill.name}
                      </h2>
                      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                        {skill.focus}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: 'var(--color-calm-100)',
                        color: 'var(--color-calm-700)',
                      }}
                    >
                      {skill.name}
                    </span>
                  </div>

                  <p className="mb-4" style={{ color: 'var(--color-calm-600)' }}>
                    {skill.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {skill.acronymBreakdown.map((item) => (
                      <div
                        key={item.letter}
                        className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-calm-50)' }}
                      >
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: 'var(--color-calm-200)',
                            color: 'var(--color-calm-700)',
                          }}
                        >
                          {item.letter}
                        </span>
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                            {item.word}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
                    <button
                      onClick={() => {
                        const template = skillBasedTemplates.find((t) => t.skill === skillId);
                        if (template) onStartConversation(template);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Practice {skill.name} →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Main dashboard home
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-calm-700)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M21 6h-2V3H5v3H3c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h2v6h14v-6h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold" style={{ color: 'var(--foreground)' }}>Mediator</h1>
            <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Demo Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
            Welcome, {userName}
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
            style={{ backgroundColor: 'var(--color-calm-500)' }}
          >
            {userName?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Welcome to Mediator Demo
          </h2>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Practice DBT-based interpersonal effectiveness skills through guided conversations.
          </p>
        </motion.div>

        {/* Primary actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Start Conversation */}
          <motion.button
            onClick={() => setSelectedView('templates')}
            className="p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--color-calm-50)',
              borderColor: 'var(--color-calm-300)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-calm-700)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              Start a Conversation
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-calm-500)' }}>
              Choose a scenario and practice your communication skills with guided rounds.
            </p>
            <span
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-calm-700)' }}
            >
              Browse templates
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </span>
          </motion.button>

          {/* Learn Skills */}
          <motion.button
            onClick={() => setSelectedView('learn')}
            className="p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--color-calm-200)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-calm-200)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-calm-600)">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              Learn the Skills
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-calm-500)' }}>
              Understand DEAR MAN, GIVE, and FAST before you practice.
            </p>
            <span
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-calm-600)' }}
            >
              View skill guides
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </span>
          </motion.button>
        </div>

        {/* Featured template */}
        {featuredTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-calm-500)' }}>
              RECOMMENDED FOR DEMO
            </h3>
            <button
              onClick={() => onStartConversation(featuredTemplate)}
              className="w-full p-4 rounded-xl border text-left transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--color-safe-green)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{ backgroundColor: 'var(--color-safe-green)', color: 'white' }}
                  >
                    Featured
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--color-calm-100)',
                      color: 'var(--color-calm-700)',
                    }}
                  >
                    {featuredTemplate.skill}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-calm-400)' }}>
                  ~{featuredTemplate.estimatedDuration}min • 3 rounds
                </span>
              </div>
              <h4 className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>
                {featuredTemplate.name}
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                {featuredTemplate.description}
              </p>
            </button>
          </motion.div>
        )}

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 pt-8 border-t"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>3</div>
              <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>DBT Skills</div>
            </div>
            <div>
              <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                {skillBasedTemplates.length}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Templates</div>
            </div>
            <div>
              <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>3</div>
              <div className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Rounds per session</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
