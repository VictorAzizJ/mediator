'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DBTSkill, SkillBasedTemplate } from '@/types';
import {
  skillBasedTemplates,
  getSkillCategories,
  getTemplatesBySkill,
  dbtSkillInfo,
} from '@/lib/dbtSkills';

interface SkillTemplateSelectorProps {
  onSelect: (template: SkillBasedTemplate) => void;
  onSkip: () => void;
}

const skillColors: Record<DBTSkill, { bg: string; border: string }> = {
  'DEAR MAN': { bg: 'var(--color-calm-100)', border: 'var(--color-calm-400)' },
  GIVE: { bg: 'rgba(156, 180, 163, 0.2)', border: 'var(--color-safe-green)' },
  FAST: { bg: 'var(--color-warm-100)', border: 'var(--color-warm-300)' },
};

export function SkillTemplateSelector({ onSelect, onSkip }: SkillTemplateSelectorProps) {
  const [selectedSkill, setSelectedSkill] = useState<DBTSkill | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SkillBasedTemplate | null>(null);

  const skillCategories = getSkillCategories();
  const templates =
    selectedSkill === 'all'
      ? skillBasedTemplates
      : getTemplatesBySkill(selectedSkill);

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1
              className="text-2xl font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Practice Interpersonal Skills
            </h1>
            <p style={{ color: 'var(--color-calm-500)' }}>
              Choose a scenario to practice evidence-based communication techniques
            </p>
          </motion.div>
        </div>

        {/* Skill Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p
            className="text-sm font-medium mb-3 text-center"
            style={{ color: 'var(--color-calm-500)' }}
          >
            Filter by skill
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedSkill('all')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  selectedSkill === 'all'
                    ? 'var(--color-calm-700)'
                    : 'var(--color-calm-100)',
                color:
                  selectedSkill === 'all' ? 'white' : 'var(--color-calm-600)',
              }}
            >
              All Skills
            </button>
            {skillCategories.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    selectedSkill === skill.id
                      ? 'var(--color-calm-700)'
                      : skillColors[skill.id].bg,
                  color:
                    selectedSkill === skill.id
                      ? 'white'
                      : 'var(--color-calm-700)',
                  border: `1px solid ${
                    selectedSkill === skill.id
                      ? 'transparent'
                      : skillColors[skill.id].border
                  }`,
                }}
              >
                {skill.label}
                <span
                  className="ml-1 opacity-70"
                  style={{
                    color:
                      selectedSkill === skill.id
                        ? 'rgba(255,255,255,0.8)'
                        : 'var(--color-calm-500)',
                  }}
                >
                  ({skill.focus})
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AnimatePresence mode="popLayout">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor:
                      selectedTemplate?.id === template.id
                        ? 'var(--color-calm-600)'
                        : 'var(--color-calm-200)',
                  }}
                >
                  {/* Skill Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: skillColors[template.skill].bg,
                        color: 'var(--color-calm-700)',
                      }}
                    >
                      {template.skill}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-calm-400)' }}
                    >
                      {dbtSkillInfo[template.skill].focus}
                    </span>
                  </div>

                  {/* Template Info */}
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {template.name}
                  </h3>
                  <p
                    className="text-sm line-clamp-2 mb-3"
                    style={{ color: 'var(--color-calm-500)' }}
                  >
                    {template.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-calm-400)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      ~{template.estimatedDuration} min
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-calm-400)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                      </svg>
                      3 rounds
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Selected Template Preview */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card mb-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: skillColors[selectedTemplate.skill].bg,
                        color: 'var(--color-calm-700)',
                      }}
                    >
                      {selectedTemplate.skill}
                    </span>
                  </div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {selectedTemplate.name}
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-calm-500)' }}
                  >
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-2 rounded-lg hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-calm-100)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-calm-600)">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Skill Summary */}
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: 'var(--color-calm-50)' }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--color-calm-600)' }}
                >
                  About {selectedTemplate.skill}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-calm-700)' }}
                >
                  {selectedTemplate.skillSummary}
                </p>
              </div>

              {/* Round Preview */}
              <div className="mb-4">
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: 'var(--color-calm-600)' }}
                >
                  The 3 Rounds
                </p>
                <div className="space-y-2">
                  {selectedTemplate.rounds.map((round, i) => (
                    <div
                      key={round.phase}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-calm-50)' }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--color-calm-200)',
                          color: 'var(--color-calm-700)',
                        }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium uppercase"
                          style={{ color: 'var(--color-calm-500)' }}
                        >
                          {round.phase === 'setup'
                            ? 'Set the Stage'
                            : round.phase === 'practice'
                            ? 'Apply the Skill'
                            : 'Reflect & Respond'}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--foreground)' }}
                        >
                          "{round.prompt}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelect(selectedTemplate)}
                className="btn-primary w-full"
              >
                Start This Practice
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-sm hover:underline"
            style={{ color: 'var(--color-calm-500)' }}
          >
            Skip and start a free-form conversation
          </button>
        </div>
      </div>
    </div>
  );
}
