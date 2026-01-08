'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  checkInTemplates,
  getCategories,
  getTemplatesByCategory,
  type CheckInTemplate,
} from '@/lib/checkInTemplates';

interface TemplateSelectorProps {
  onSelect: (template: CheckInTemplate) => void;
  onSkip: () => void;
}

export function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CheckInTemplate['category'] | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CheckInTemplate | null>(null);

  const categories = getCategories();
  const templates =
    selectedCategory === 'all'
      ? checkInTemplates
      : getTemplatesByCategory(selectedCategory);

  const categoryIcons: Record<CheckInTemplate['category'] | 'all', React.ReactNode> = {
    all: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
      </svg>
    ),
    'one-on-one': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    conflict: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
      </svg>
    ),
    performance: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
    team: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
      </svg>
    ),
    feedback: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Choose a Conversation Template
          </h1>
          <p style={{ color: 'var(--color-calm-500)' }}>
            Select a pre-built template or start with a blank conversation
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'text-white'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor:
                selectedCategory === 'all'
                  ? 'var(--color-calm-600)'
                  : 'var(--color-calm-100)',
              color:
                selectedCategory === 'all'
                  ? 'white'
                  : 'var(--color-calm-600)',
            }}
          >
            {categoryIcons.all}
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === cat.id
                    ? 'var(--color-calm-600)'
                    : 'var(--color-calm-100)',
                color:
                  selectedCategory === cat.id
                    ? 'white'
                    : 'var(--color-calm-600)',
              }}
            >
              {categoryIcons[cat.id]}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AnimatePresence mode="popLayout">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor:
                      selectedTemplate?.id === template.id
                        ? 'var(--color-calm-500)'
                        : 'var(--color-calm-200)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-calm-100)' }}
                    >
                      <span style={{ color: 'var(--color-calm-600)' }}>
                        {categoryIcons[template.category]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium mb-1 truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {template.name}
                      </h3>
                      <p
                        className="text-sm line-clamp-2"
                        style={{ color: 'var(--color-calm-500)' }}
                      >
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-calm-400)' }}
                        >
                          ~{template.estimatedDuration} min
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-calm-400)' }}
                        >
                          {template.maxRounds > 0 ? `${template.maxRounds} rounds` : 'Unlimited'}
                        </span>
                      </div>
                    </div>
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
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-calm-50)' }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-calm-600)' }}>
                    Opening Prompt
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-calm-700)' }}>
                    "{selectedTemplate.prompts.opening}"
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-calm-50)' }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-calm-600)' }}>
                    Settings
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--color-calm-700)' }}>
                    <li>Turn duration: {selectedTemplate.turnDuration}s</li>
                    <li>
                      Rounds: {selectedTemplate.maxRounds > 0 ? selectedTemplate.maxRounds : 'Unlimited'}
                    </li>
                    <li>Est. time: {selectedTemplate.estimatedDuration} min</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-calm-600)' }}>
                  Reflection Prompts
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.prompts.reflectionPrompts.map((prompt, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: 'var(--color-calm-100)',
                        color: 'var(--color-calm-600)',
                      }}
                    >
                      {prompt}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelect(selectedTemplate)}
                className="btn-primary w-full"
              >
                Use This Template
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
            Skip and start a blank conversation
          </button>
        </div>
      </div>
    </div>
  );
}
