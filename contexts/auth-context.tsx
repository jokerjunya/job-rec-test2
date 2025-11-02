'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@/types/user';
import {
  getCurrentUser,
  setCurrentUser,
  login as loginUser,
  signUp as signUpUser,
  logout as logoutUser,
  requestPasswordReset as requestPasswordResetUser,
  resetPassword as resetPasswordUser,
} from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証プロバイダーコンポーネント
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = loginUser({ email, password });
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = signUpUser({ email, password, name });
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return requestPasswordResetUser(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    return resetPasswordUser(token, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signUp, logout, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するフック
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

