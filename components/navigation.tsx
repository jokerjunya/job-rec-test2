'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { AuthModal } from '@/components/auth-modal';
import { LogOut, User, History, GitCompare, Sparkles, Shield, Menu, X } from 'lucide-react';

/**
 * ナビゲーションバーコンポーネント
 */
export function Navigation() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  return (
    <>
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              求人マッチング
            </Link>

            {/* デスクトップメニュー */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4">
              {user ? (
                <>
                  <Link
                    href="/recommendations"
                    className="flex items-center gap-1.5 rounded-md px-2 xl:px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden xl:inline">おすすめ</span>
                  </Link>
                  <Link
                    href="/compare"
                    className="flex items-center gap-1.5 rounded-md px-2 xl:px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <GitCompare className="h-4 w-4" />
                    <span className="hidden xl:inline">比較</span>
                  </Link>
                  <Link
                    href="/logs"
                    className="flex items-center gap-1.5 rounded-md px-2 xl:px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden xl:inline">履歴</span>
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-1.5 rounded-md px-2 xl:px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden xl:inline">管理</span>
                  </Link>
                  <div className="flex items-center gap-1.5 rounded-md px-2 xl:px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <User className="h-4 w-4" />
                    <span className="hidden xl:inline">{user.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-md px-2 xl:px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:inline">ログアウト</span>
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

            {/* モバイルメニューボタン */}
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden rounded-md p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="メニューを開く"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* モバイルメニュー */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 py-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/recommendations"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <Sparkles className="h-5 w-5" />
                    おすすめ
                  </Link>
                  <Link
                    href="/compare"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <GitCompare className="h-5 w-5" />
                    比較
                  </Link>
                  <Link
                    href="/logs"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <History className="h-5 w-5" />
                    履歴
                  </Link>
                  <Link
                    href="/admin/users"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    <Shield className="h-5 w-5" />
                    管理
                  </Link>
                  <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
                    <User className="h-5 w-5" />
                    {user.name}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-5 w-5" />
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ログイン / 新規登録
                </button>
              )}
            </div>
          )}
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

