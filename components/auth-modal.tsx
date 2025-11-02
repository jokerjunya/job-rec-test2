'use client';

import { useState } from 'react';
import { LoginForm, SignUpForm } from './auth-forms';

interface AuthModalProps {
  onClose?: () => void;
}

/**
 * 認証モーダルコンポーネント
 */
export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <>
      <div className="mb-6 flex border-b border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            mode === 'login'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            mode === 'signup'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          新規登録
        </button>
      </div>
      {mode === 'login' ? <LoginForm onSuccess={onClose} /> : <SignUpForm onSuccess={onClose} />}
    </>
  );
}

