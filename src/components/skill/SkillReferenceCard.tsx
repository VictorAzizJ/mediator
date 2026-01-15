'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DBTSkill } from '@/types';
import { getSkillInfo } from '@/lib/dbtSkills';

interface SkillReferenceCardProps {
  skill: DBTSkill;
}

export function SkillReferenceCard({ skill }: SkillReferenceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const skillInfo = getSkillInfo(skill);

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg"
        style={{
          backgroundColor: isOpen ? 'var(--color-calm-700)' : 'var(--color-calm-100)',
          color: isOpen ? 'white' : 'var(--color-calm-700)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        <span className="text-sm font-medium">{skill}</span>
      </motion.button>

      {/* Reference Card Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-36 right-4 left-4 z-50 max-w-sm mx-auto"
            >
              <div
                className="rounded-2xl p-5 shadow-xl"
                style={{ backgroundColor: 'var(--background)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3
                      className="font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {skillInfo.name}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-calm-500)' }}
                    >
                      {skillInfo.focus}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-calm-100)' }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="var(--color-calm-500)"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>

                {/* Acronym Quick Reference */}
                <div className="space-y-2">
                  {skillInfo.acronymBreakdown.map((item) => (
                    <div
                      key={item.letter}
                      className="flex items-center gap-3"
                    >
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--color-calm-100)',
                          color: 'var(--color-calm-700)',
                        }}
                      >
                        {item.letter}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <strong>{item.word}</strong> — {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
