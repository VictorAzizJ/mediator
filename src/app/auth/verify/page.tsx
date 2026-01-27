'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid link. No token provided.');
      return;
    }

    async function verifyToken() {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed');
          return;
        }

        // Store session token
        localStorage.setItem('mediator_session_token', data.sessionToken);
        localStorage.setItem('mediator_session_expires', data.expiresAt);

        // Store user data
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          orgId: data.user.orgId,
          accountType: data.user.accountType,
        };
        localStorage.setItem('mediator_user', JSON.stringify(userData));

        setStatus('success');

        // Redirect after brief delay
        setTimeout(() => {
          if (data.isNewUser) {
            // New users go to profile setup
            router.push('/demo?setup=profile');
          } else {
            // Existing users go to dashboard
            router.push('/demo');
          }
        }, 1500);
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setErrorMessage('An error occurred. Please try again.');
      }
    }

    verifyToken();
  }, [searchParams, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center"
    >
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-indigo-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Verifying your link...
          </h1>
          <p className="text-slate-400">
            Please wait while we sign you in.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            You&apos;re signed in!
          </h1>
          <p className="text-slate-400">
            Redirecting to your dashboard...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Verification Failed
          </h1>
          <p className="text-slate-400 mb-6">{errorMessage}</p>
          <button
            onClick={() => router.push('/demo')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </>
      )}
    </motion.div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-6 relative">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-spin" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Loading...</h1>
    </div>
  );
}

export default function VerifyAuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}
