/**
 * AI Authentication Hook - Simplified Version
 * Manages password protection and session management for AI features
 */

import { useState, useEffect } from 'react';

interface UseAIAuthenticationReturn {
  isAuthenticated: boolean;
  authenticateUser: (password: string) => boolean;
  logout: () => void;
  attempts: number;
  maxAttempts: number;
}

const MAX_ATTEMPTS = 3;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useAIAuthentication = (): UseAIAuthenticationReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Check existing authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('ai_authenticated');
    const authTime = sessionStorage.getItem('ai_auth_time');

    // Check if already authenticated
    if (authStatus === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      if (timeDiff < SESSION_DURATION) {
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem('ai_authenticated');
        sessionStorage.removeItem('ai_auth_time');
      }
    }
  }, []);

  const authenticateUser = (password: string): boolean => {
    const correctPassword = import.meta.env.VITE_AI_ASSISTANT_PASSWORD;

    if (!correctPassword) {
      console.error('[Auth] Password not configured in .env.local');
      return false;
    }

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAttempts(0);
      sessionStorage.setItem('ai_authenticated', 'true');
      sessionStorage.setItem('ai_auth_time', Date.now().toString());
      return true;
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        alert('Demasiados intentos fallidos. Recarga la página para intentar de nuevo.');
      }

      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAttempts(0);
    sessionStorage.removeItem('ai_authenticated');
    sessionStorage.removeItem('ai_auth_time');
  };

  return {
    isAuthenticated,
    authenticateUser,
    logout,
    attempts,
    maxAttempts: MAX_ATTEMPTS
  };
};
