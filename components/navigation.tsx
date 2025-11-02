'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { AuthModal } from '@/components/auth-modal';
import { LogOut, User, History, GitCompare } from 'lucide-react';

/**
 * ナビゲーションバーコンポーネント
 */
export function Navigation() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              求人マッチング
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/compare"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <GitCompare className="h-4 w-4" />
                    比較
                  </Link>
                  <Link
                    href="/logs"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <History className="h-4 w-4" />
                    履歴
                  </Link>
                  <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <User className="h-4 w-4" />
                    {user.name}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ログイン / 新規登録
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showAuthModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAuthModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ✕
              </button>
              <AuthModal onClose={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

