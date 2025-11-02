'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserFromFirestore, convertFirebaseUser } from '@/lib/firebase/auth';
import type { User } from '@/types/user';
import {
  login as loginUser,
  loginWithGoogle as loginWithGoogleUser,
  signUp as signUpUser,
  logout as logoutUser,
  requestPasswordReset as requestPasswordResetUser,
  resetPassword as resetPasswordUser,
} from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証プロバイダーコンポーネント
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase Authenticationの認証状態をリアルタイム監視
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestoreからユーザー情報を取得
        const userData = await getUserFromFirestore(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          // Firestoreにデータがない場合はFirebase Authから生成
          setUser(convertFirebaseUser(firebaseUser));
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser({ email, password });
    // onAuthStateChangedが自動的にユーザー状態を更新するため、ここでsetUserは不要
    return result;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await loginWithGoogleUser();
    // onAuthStateChangedが自動的にユーザー状態を更新するため、ここでsetUserは不要
    return result;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await signUpUser({ email, password, name });
    // onAuthStateChangedが自動的にユーザー状態を更新するため、ここでsetUserは不要
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    // onAuthStateChangedが自動的にユーザー状態を更新するため、ここでsetUserは不要
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return requestPasswordResetUser(email);
  }, []);

  const resetPassword = useCallback(async (code: string, newPassword: string) => {
    return resetPasswordUser(code, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signUp, logout, requestPasswordReset, resetPassword }}>
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

