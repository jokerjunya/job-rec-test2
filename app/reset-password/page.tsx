'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { validateResetToken } from '@/utils/auth';

/**
 * パスワードリセットページ
 */
export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('リセットトークンが指定されていません');
      setIsValidating(false);
      return;
    }

    // トークンの有効性を確認
    const validation = validateResetToken(tokenParam);
    if (!validation.valid) {
      setError(validation.error || '無効または期限切れのリセットトークンです');
      setIsValidating(false);
      return;
    }

    setToken(tokenParam);
    setIsValidating(false);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (!token) {
      setError('リセットトークンが無効です');
      return;
    }

    setIsLoading(true);

    const result = await resetPassword(token, password);
    if (!result.success) {
      setError(result.error || 'パスワードのリセットに失敗しました');
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <p className="font-medium mb-2">パスワードのリセットが完了しました</p>
            <p className="text-xs">3秒後にログインページにリダイレクトします。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">パスワードをリセット</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                新しいパスワード（6文字以上）
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                パスワード（確認）
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'リセット中...' : 'パスワードをリセット'}
            </button>
          </form>
        ) : (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <p className="font-medium mb-2">エラー</p>
            <p>{error || 'リセットトークンが無効です'}</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

