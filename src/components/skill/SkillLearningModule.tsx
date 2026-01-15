'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DBTSkill } from '@/types';
import { getSkillInfo } from '@/lib/dbtSkills';

interface SkillLearningModuleProps {
  skill: DBTSkill;
  onComplete: () => void;
  allowSkip?: boolean;
}

export function SkillLearningModule({
  skill,
  onComplete,
  allowSkip = true,
}: SkillLearningModuleProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const skillInfo = getSkillInfo(skill);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Skill Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--color-calm-100)' }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-calm-700)' }}
            >
              {skill.charAt(0)}
            </span>
          </motion.div>

          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            {skillInfo.name}
          </h1>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-calm-500)' }}
          >
            {skillInfo.focus}
          </p>
        </div>

        {/* Skill Summary */}
        <motion.div
          className="card p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--color-calm-500)' }}
          >
            What is {skillInfo.name}?
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--foreground)' }}
          >
            {skillInfo.summary}
          </p>
        </motion.div>

        {/* Acronym Breakdown Toggle */}
        <motion.button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-4 rounded-xl mb-6 transition-colors"
          style={{
            backgroundColor: showBreakdown
              ? 'var(--color-calm-100)'
              : 'var(--color-calm-50)',
            color: 'var(--color-calm-700)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="font-medium">
            {showBreakdown ? 'Hide' : 'Show'} what each letter means
          </span>
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            animate={{ rotate: showBreakdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </motion.svg>
        </motion.button>

        {/* Acronym Breakdown */}
        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="space-y-3">
                {skillInfo.acronymBreakdown.map((item, index) => (
                  <motion.div
                    key={item.letter}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-calm-50)' }}
                  >
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: 'var(--color-calm-200)',
                        color: 'var(--color-calm-700)',
                      }}
                    >
                      {item.letter}
                    </div>
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {item.word}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-calm-500)' }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button onClick={onComplete} className="btn-primary w-full">
            I'm ready to practice
          </button>

          {allowSkip && (
            <button
              onClick={onComplete}
              className="w-full py-2 text-sm"
              style={{ color: 'var(--color-calm-400)' }}
            >
              Skip intro
            </button>
          )}
        </motion.div>

        {/* Floating reference hint */}
        <motion.p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--color-calm-400)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          You can reference this skill during the conversation
        </motion.p>
      </motion.div>
    </div>
  );
}
