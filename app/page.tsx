'use client';

import { JobSwipe } from '@/components/job-swipe';
import { jobs } from '@/data/jobs';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/auth-modal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        {showAuthModal && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAuthModal(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/');
                  }}
                  className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  ✕
                </button>
                <AuthModal onClose={() => setShowAuthModal(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            求人マッチング
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {jobs.length}件の求人情報が見つかりました
          </p>
        </div>
        <JobSwipe jobs={jobs} />
      </main>
    </div>
  );
}
