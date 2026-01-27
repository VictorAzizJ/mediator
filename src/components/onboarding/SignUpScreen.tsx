'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AccountType, UserProfile, ConversationMode } from '@/types';

interface SignUpScreenProps {
  onComplete: (profile: UserProfile) => void;
  onBack?: () => void;
}

type Step = 'account-type' | 'profile' | 'organization' | 'preferences';

export function SignUpScreen({ onComplete, onBack }: SignUpScreenProps) {
  const [step, setStep] = useState<Step>('account-type');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    organizationName: '',
    organizationDomain: '',
    defaultInputMode: 'voice' as 'voice' | 'text',
    conversationMode: 'rounds' as ConversationMode,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setStep('profile');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (accountType === 'team') {
      setStep('organization');
    } else {
      setStep('preferences');
    }
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep('preferences');
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      accountType: accountType!,
      userRole: accountType === 'team' ? 'admin' : 'member',
      organization: accountType === 'team' ? {
        id: `org_${Date.now()}`,
        name: formData.organizationName,
        domain: formData.organizationDomain || undefined,
      } : undefined,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferences: {
        defaultInputMode: formData.defaultInputMode,
        conversationMode: formData.conversationMode,
        enableVolumeAlerts: true,
        enableLiveSummary: true,
        enableBreathingExercise: true,
      },
      stats: {
        totalSessions: 0,
        totalRounds: 0,
        skillsUsed: {
          'DEAR MAN': 0,
          'GIVE': 0,
          'FAST': 0,
        },
      },
    };
    onComplete(profile);
  };

  const renderAccountType = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg w-full"
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
          Create Your Account
        </h1>
        <p style={{ color: 'var(--color-calm-500)' }}>
          How will you be using Mediator?
        </p>
      </div>

      <div className="space-y-4">
        <motion.button
          onClick={() => handleAccountTypeSelect('individual')}
          className="w-full p-6 rounded-xl border-2 text-left transition-all"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-calm-200)',
          }}
          whileHover={{ scale: 1.02, borderColor: 'var(--color-calm-400)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-calm-100)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-calm-600)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>
                Individual
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Practice communication skills on your own. Perfect for personal development and self-improvement.
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => handleAccountTypeSelect('team')}
          className="w-full p-6 rounded-xl border-2 text-left transition-all"
          style={{
            backgroundColor: 'var(--color-calm-50)',
            borderColor: 'var(--color-calm-300)',
          }}
          whileHover={{ scale: 1.02, borderColor: 'var(--color-calm-500)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-calm-200)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>
                Team / Organization
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--color-calm-500)' }}>
                Full admin dashboard with team management, analytics, and session tracking across your organization.
              </p>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                style={{ backgroundColor: 'var(--color-safe-green)', color: 'white' }}
              >
                Recommended for Demo
              </span>
            </div>
          </div>
        </motion.button>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 text-sm flex items-center gap-2 mx-auto"
          style={{ color: 'var(--color-calm-500)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </button>
      )}
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Your Profile
        </h1>
        <p style={{ color: 'var(--color-calm-500)' }}>
          Tell us about yourself
        </p>
      </div>

      <form onSubmit={handleProfileSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            placeholder="John Smith"
            className="input w-full"
            autoFocus
          />
          {errors.name && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-alert-red)' }}>{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setErrors({ ...errors, email: '' });
            }}
            placeholder="john@company.com"
            className="input w-full"
          />
          {errors.email && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-alert-red)' }}>{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Your Role / Title *
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => {
              setFormData({ ...formData, role: e.target.value });
              setErrors({ ...errors, role: '' });
            }}
            placeholder="Product Manager, Engineer, HR Lead..."
            className="input w-full"
          />
          {errors.role && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-alert-red)' }}>{errors.role}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep('account-type')}
            className="btn-secondary flex-1"
          >
            Back
          </button>
          <button type="submit" className="btn-primary flex-1">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderOrganization = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Your Organization
        </h1>
        <p style={{ color: 'var(--color-calm-500)' }}>
          Set up your team workspace
        </p>
      </div>

      <form onSubmit={handleOrgSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Organization Name *
          </label>
          <input
            type="text"
            value={formData.organizationName}
            onChange={(e) => {
              setFormData({ ...formData, organizationName: e.target.value });
              setErrors({ ...errors, organizationName: '' });
            }}
            placeholder="Acme Corp"
            className="input w-full"
            autoFocus
          />
          {errors.organizationName && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-alert-red)' }}>{errors.organizationName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Domain (optional)
          </label>
          <input
            type="text"
            value={formData.organizationDomain}
            onChange={(e) => setFormData({ ...formData, organizationDomain: e.target.value })}
            placeholder="acme.com"
            className="input w-full"
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-calm-400)' }}>
            Team members with this email domain can join automatically
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            As organization admin, you'll have access to:
          </p>
          <ul className="text-sm space-y-1" style={{ color: 'var(--color-calm-600)' }}>
            <li className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Team member management
            </li>
            <li className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Session analytics dashboard
            </li>
            <li className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Organization settings
            </li>
            <li className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Data export & compliance
            </li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep('profile')}
            className="btn-secondary flex-1"
          >
            Back
          </button>
          <button type="submit" className="btn-primary flex-1">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderPreferences = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Your Preferences
        </h1>
        <p style={{ color: 'var(--color-calm-500)' }}>
          Customize your experience
        </p>
      </div>

      <div className="card space-y-6">
        {/* Input Mode */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Default Input Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, defaultInputMode: 'voice' })}
              className="p-4 rounded-lg border-2 text-center transition-all"
              style={{
                backgroundColor: formData.defaultInputMode === 'voice' ? 'var(--color-calm-100)' : 'var(--background)',
                borderColor: formData.defaultInputMode === 'voice' ? 'var(--color-calm-500)' : 'var(--color-calm-200)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={formData.defaultInputMode === 'voice' ? 'var(--color-calm-700)' : 'var(--color-calm-400)'} className="mx-auto mb-2">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
              <p className="font-medium text-sm" style={{ color: formData.defaultInputMode === 'voice' ? 'var(--color-calm-700)' : 'var(--color-calm-500)' }}>
                Voice
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, defaultInputMode: 'text' })}
              className="p-4 rounded-lg border-2 text-center transition-all"
              style={{
                backgroundColor: formData.defaultInputMode === 'text' ? 'var(--color-calm-100)' : 'var(--background)',
                borderColor: formData.defaultInputMode === 'text' ? 'var(--color-calm-500)' : 'var(--color-calm-200)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={formData.defaultInputMode === 'text' ? 'var(--color-calm-700)' : 'var(--color-calm-400)'} className="mx-auto mb-2">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              <p className="font-medium text-sm" style={{ color: formData.defaultInputMode === 'text' ? 'var(--color-calm-700)' : 'var(--color-calm-500)' }}>
                Text
              </p>
            </button>
          </div>
        </div>

        {/* Conversation Mode */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Conversation Mode
          </label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, conversationMode: 'rounds' })}
              className="w-full p-4 rounded-lg border-2 text-left transition-all"
              style={{
                backgroundColor: formData.conversationMode === 'rounds' ? 'var(--color-calm-100)' : 'var(--background)',
                borderColor: formData.conversationMode === 'rounds' ? 'var(--color-calm-500)' : 'var(--color-calm-200)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: formData.conversationMode === 'rounds' ? 'var(--color-calm-200)' : 'var(--color-calm-100)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={formData.conversationMode === 'rounds' ? 'var(--color-calm-700)' : 'var(--color-calm-400)'}>
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                    Round-Based
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    3 structured rounds with prompts (Setup, Practice, Reflect)
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, conversationMode: 'speaker-triggered' })}
              className="w-full p-4 rounded-lg border-2 text-left transition-all"
              style={{
                backgroundColor: formData.conversationMode === 'speaker-triggered' ? 'var(--color-calm-100)' : 'var(--background)',
                borderColor: formData.conversationMode === 'speaker-triggered' ? 'var(--color-calm-500)' : 'var(--color-calm-200)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: formData.conversationMode === 'speaker-triggered' ? 'var(--color-calm-200)' : 'var(--color-calm-100)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={formData.conversationMode === 'speaker-triggered' ? 'var(--color-calm-700)' : 'var(--color-calm-400)'}>
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                    <path d="M17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                    Speaker-Triggered
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>
                    Natural flow based on voice activity detection
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep(accountType === 'team' ? 'organization' : 'profile')}
            className="btn-secondary flex-1"
          >
            Back
          </button>
          <button onClick={handleComplete} className="btn-primary flex-1">
            Complete Setup
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Progress indicator
  const steps: Step[] = accountType === 'team'
    ? ['account-type', 'profile', 'organization', 'preferences']
    : ['account-type', 'profile', 'preferences'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all"
              style={{
                width: i <= currentStepIndex ? '32px' : '16px',
                backgroundColor: i <= currentStepIndex ? 'var(--color-calm-500)' : 'var(--color-calm-200)',
              }}
            />
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--color-calm-400)' }}>
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'account-type' && renderAccountType()}
        {step === 'profile' && renderProfile()}
        {step === 'organization' && renderOrganization()}
        {step === 'preferences' && renderPreferences()}
      </AnimatePresence>
    </div>
  );
}
