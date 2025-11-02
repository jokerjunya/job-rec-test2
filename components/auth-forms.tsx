'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  onSuccess?: () => void;
}

/**
 * ログインフォームコンポーネント
 */
export function LoginForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'ログインに失敗しました');
    } else {
      router.push('/');
      onSuccess?.();
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    const result = await loginWithGoogle();
    if (!result.success) {
      setError(result.error || 'Googleログインに失敗しました');
    } else {
      router.push('/');
      onSuccess?.();
    }
    setIsLoading(false);
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Googleログインボタン */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Googleでログイン
      </button>

      {/* 区切り線 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-300 dark:border-zinc-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">または</span>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="text-right">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          パスワードを忘れた場合
        </button>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}

/**
 * 新規登録フォームコンポーネント
 */
export function SignUpForm({ onSuccess }: AuthFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signUp(email, password, name);
    if (!result.success) {
      setError(result.error || '登録に失敗しました');
    } else {
      router.push('/');
      onSuccess?.();
    }
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);

    const result = await loginWithGoogle();
    if (!result.success) {
      setError(result.error || 'Googleアカウントでの登録に失敗しました');
    } else {
      router.push('/');
      onSuccess?.();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Googleサインアップボタン */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Googleで登録
      </button>

      {/* 区切り線 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-300 dark:border-zinc-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">または</span>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          お名前
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メールアドレス
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          パスワード（6文字以上）
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '登録中...' : '新規登録'}
      </button>
    </form>
  );
}

/**
 * パスワードリセットリクエストフォームコンポーネント
 */
export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await requestPasswordReset(email);
    if (!result.success) {
      setError(result.error || 'パスワードリセットリクエストに失敗しました');
    } else {
      setIsSubmitted(true);
      // Firebase Authenticationではメールが自動送信されます
    }
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <p className="font-medium mb-2">パスワードリセット用のリンクを送信しました</p>
          <p className="text-xs mb-3">
            登録されているメールアドレスにパスワードリセットのリンクを送信しました。
            メールに記載されているリンクをクリックして、新しいパスワードを設定してください。
          </p>
          {resetToken && (
            <div className="mt-3 p-3 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs font-medium mb-1 text-zinc-600 dark:text-zinc-400">デモ用リセットトークン:</p>
              <p className="text-xs font-mono break-all text-zinc-900 dark:text-zinc-100">{resetToken}</p>
              <p className="text-xs mt-2 text-zinc-600 dark:text-zinc-400">
                以下のURLにアクセスしてパスワードをリセットしてください:
              </p>
              <a
                href={`/reset-password?token=${resetToken}`}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
              >
                /reset-password?token={resetToken}
              </a>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          ログインに戻る
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">パスワードをリセット</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          登録されているメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
        </p>
      </div>
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メールアドレス
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          戻る
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '送信中...' : '送信'}
        </button>
      </div>
    </form>
  );
}

