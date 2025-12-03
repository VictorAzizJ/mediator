'use client';

import { motion } from 'framer-motion';

interface WaitingScreenProps {
  sessionCode: string;
  hostName: string;
}

export function WaitingScreen({ sessionCode, hostName }: WaitingScreenProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md text-center"
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4V2M12 22v-2M4 12H2M22 12h-2M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                stroke="var(--color-calm-500)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>

        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Waiting for the other person
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-calm-500)' }}>
          Share this code with the person you want to talk with
        </p>

        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: 'var(--color-calm-100)' }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--color-calm-500)' }}>
            Session code
          </p>
          <p
            className="text-3xl font-bold tracking-widest"
            style={{ color: 'var(--color-calm-800)' }}
          >
            {sessionCode}
          </p>
        </div>

        <button onClick={copyCode} className="btn-secondary w-full mb-4">
          Copy code
        </button>

        <p className="text-sm" style={{ color: 'var(--color-calm-400)' }}>
          You're signed in as <strong>{hostName}</strong>
        </p>
      </motion.div>
    </div>
  );
}
