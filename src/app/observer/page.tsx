'use client';

import { useState } from 'react';
import { useSessionStore } from '@/store/session';
import { useSocket } from '@/hooks/useSocket';
import { ObserverJoinScreen, ObserverView } from '@/components/observer';
import { NavigationHeader } from '@/components/ui';

export default function ObserverPage() {
  const { phase, isObserverMode } = useSessionStore();
  const { joinAsObserver } = useSocket();
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (code: string, name: string) => {
    joinAsObserver(code, name);
    setHasJoined(true);
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  // Show observer view if connected
  if (hasJoined && (isObserverMode || phase !== 'setup')) {
    return (
      <>
        <NavigationHeader currentPage="observer" showNav={false} onBack={handleBack} />
        <div className="pt-14">
          <ObserverView />
        </div>
      </>
    );
  }

  // Show join screen
  return (
    <>
      <NavigationHeader currentPage="observer" />
      <div className="pt-14">
        <ObserverJoinScreen onJoin={handleJoin} onBack={handleBack} />
      </div>
    </>
  );
}
