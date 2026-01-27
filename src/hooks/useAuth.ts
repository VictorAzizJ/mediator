'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  orgId?: string;
  accountType: 'individual' | 'team';
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const STORAGE_KEYS = {
  SESSION_TOKEN: 'mediator_session_token',
  SESSION_EXPIRES: 'mediator_session_expires',
  USER: 'mediator_user',
};

/**
 * Authentication hook for Mediator
 *
 * Manages user authentication state, session tokens, and login/logout flows.
 * Uses magic link authentication via email.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        const sessionExpires = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRES);

        if (!storedUser || !sessionToken) {
          setIsLoading(false);
          return;
        }

        // Check if session is expired locally
        if (sessionExpires && new Date(sessionExpires) < new Date()) {
          // Session expired, clear storage
          clearSession();
          setIsLoading(false);
          return;
        }

        // Parse stored user
        const userData = JSON.parse(storedUser) as AuthUser;

        // Verify session with backend (optional, for extra security)
        const isValid = await verifySessionWithBackend(sessionToken);

        if (isValid) {
          setUser(userData);
        } else {
          clearSession();
        }
      } catch (err) {
        console.error('Session check error:', err);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  /**
   * Clear session from localStorage
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRES);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  /**
   * Verify session token with backend
   */
  async function verifySessionWithBackend(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token }),
      });

      const data = await response.json();
      return data.valid === true;
    } catch {
      // If verification fails (e.g., offline), trust local session
      return true;
    }
  }

  /**
   * Send magic link email
   */
  const login = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Failed to send magic link';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // In development, return the token for testing
      if (data._dev?.token) {
        console.log('Dev mode - Magic link URL:', data._dev.verifyUrl);
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    clearSession();
    setError(null);
  }, [clearSession]);

  /**
   * Refresh/extend the session
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

    if (!sessionToken) {
      return false;
    }

    const isValid = await verifySessionWithBackend(sessionToken);

    if (!isValid) {
      clearSession();
    }

    return isValid;
  }, [clearSession]);

  /**
   * Update user data locally
   */
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshSession,
    updateUser,
  };
}

/**
 * Helper to get current session token (for API calls)
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
}

/**
 * Helper to check if user is authenticated (without hook)
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  const expires = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRES);

  if (!token || !expires) return false;

  return new Date(expires) > new Date();
}
