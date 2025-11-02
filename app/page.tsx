'use client';

import { JobSwipe } from '@/components/job-swipe';
import { jobs } from '@/data/jobs';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthModal } from '@/components/auth-modal';
import { useRouter } from 'next/navigation';
import {
  JobFiltersComponent,
  type JobFilters,
} from '@/components/job-filters';
import {
  OnboardingTour,
  hasCompletedOnboarding,
} from '@/components/onboarding-tour';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    searchQuery: '',
    workType: 'all',
    minSalary: 0,
    location: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuthModal(true);
    } else if (!isLoading && user && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user, isLoading]);

  // 利用可能な勤務地のリストを取得
  const availableLocations = useMemo(() => {
    const locations = jobs.map((job) => job.location);
    return Array.from(new Set(locations)).sort();
  }, []);

  // フィルター適用（メモ化でパフォーマンス最適化）
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 検索クエリ
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesDescription = job.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesDescription) {
          return false;
        }
      }

      // 勤務形態
      if (filters.workType !== 'all' && job.workType !== filters.workType) {
        return false;
      }

      // 勤務地
      if (filters.location && job.location !== filters.location) {
        return false;
      }

      // 最低給与
      if (filters.minSalary > 0) {
        if (job.salary.min < filters.minSalary) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // フィルター変更ハンドラー（メモ化）
  const handleFiltersChange = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters);
  }, []);

  // フィルターリセットハンドラー（メモ化）
  const handleResetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      workType: 'all',
      minSalary: 0,
      location: '',
    });
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
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
    <>
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              求人マッチング
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {filteredJobs.length}件の求人情報が見つかりました
              {filteredJobs.length !== jobs.length && (
                <span className="ml-1 text-sm">
                  （全{jobs.length}件中）
                </span>
              )}
            </p>
          </div>

          {/* フィルター */}
          <div className="mb-8">
            <JobFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableLocations={availableLocations}
            />
          </div>

          {/* 求人スワイプ */}
          {filteredJobs.length > 0 ? (
            <JobSwipe jobs={filteredJobs} />
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  条件に合う求人が見つかりませんでした
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  フィルター条件を変更してみてください
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  フィルターをリセット
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* オンボーディングツアー */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
