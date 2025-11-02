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
  const { login } = useAuth();
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

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  const { signUp } = useAuth();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

