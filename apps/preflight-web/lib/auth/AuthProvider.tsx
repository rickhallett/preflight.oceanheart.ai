"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { verifyToken, getTokenFromCookie, isStubToken, type PassportUser } from './passport';
import { startTokenRefresh, stopTokenRefresh } from './refresh';

interface AuthContextType {
  user: PassportUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStubAuth: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isStubAuth: false,
  checkAuth: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PassportUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStubAuth, setIsStubAuth] = useState(false);

  const checkAuth = async () => {
    setIsLoading(true);
    const token = getTokenFromCookie();
    
    if (!token) {
      setUser(null);
      setIsStubAuth(false);
      setIsLoading(false);
      return;
    }

    // Check if it's a stub token
    if (isStubToken(token)) {
      setIsStubAuth(true);
      try {
        // Decode stub token locally
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        setUser({
          userId: payload.userId,
          email: payload.email,
          role: 'user'
        });
      } catch {
        setUser(null);
      }
      setIsLoading(false);
      return;
    }

    // Verify real token with Passport
    setIsStubAuth(false);
    try {
      const response = await verifyToken(token);
      if (response.valid && response.user) {
        setUser(response.user);
        // Start token refresh for real tokens
        startTokenRefresh();
      } else {
        setUser(null);
        // Clear invalid token
        document.cookie = 'oh_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Cleanup on unmount
    return () => {
      stopTokenRefresh();
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isStubAuth,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);