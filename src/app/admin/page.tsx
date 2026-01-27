'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/admin';
import { NavigationHeader } from '@/components/ui';
import type { UserProfile, SkillBasedTemplate } from '@/types';

const STORAGE_KEY = 'mediator_user_profile';

export default function AdminPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored profile
    const storedProfile = localStorage.getItem(STORAGE_KEY);
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile) as UserProfile;
        // Only allow team accounts to access admin
        if (profile.accountType === 'team') {
          setUserProfile(profile);
        } else {
          // Redirect individual users to demo
          router.push('/demo');
          return;
        }
      } catch {
        router.push('/demo');
        return;
      }
    } else {
      // No profile, redirect to demo for signup
      router.push('/demo');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleStartConversation = (template?: SkillBasedTemplate) => {
    // Store template selection and redirect to demo
    if (template) {
      sessionStorage.setItem('pending_template', JSON.stringify(template));
    }
    router.push('/demo');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('mediator_demo_access');
    router.push('/demo');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-4" style={{ backgroundColor: 'var(--color-calm-200)' }} />
          <p style={{ color: 'var(--color-calm-400)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <>
      <NavigationHeader currentPage="admin" />
      <div className="pt-14">
        <AdminDashboard
          userProfile={userProfile}
          onStartConversation={handleStartConversation}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
