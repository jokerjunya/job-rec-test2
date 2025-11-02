'use client';

import { useAuth } from '@/contexts/auth-context';
import { getUserFeedbacks } from '@/utils/local-storage';
import { jobs } from '@/data/jobs';
import { useState, useEffect, useMemo } from 'react';
import type { JobFeedback } from '@/types/job';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Calendar, TrendingUp, Filter, X, History } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function LogsPage() {
  return <LogsPageContent />;
}

/**
 * 日付をフォーマット（YYYY-MM-DD → YYYY年MM月DD日 HH:mm）
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

type FilterType = 'all' | 'like' | 'dislike';

/**
 * ログ閲覧ページコンポーネント
 */
function LogsPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<JobFeedback[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const loadFeedbacks = async () => {
        const userFeedbacks = await getUserFeedbacks();
        setFeedbacks(userFeedbacks);
      };
      loadFeedbacks();
    }
  }, [user, authLoading, router]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const totalCount = feedbacks.length;
    const likeCount = feedbacks.filter((f) => f.feedback === 'like').length;
    const dislikeCount = feedbacks.filter((f) => f.feedback === 'dislike').length;
    const likeRate = totalCount > 0 ? Math.round((likeCount / totalCount) * 100) : 0;

    return {
      totalCount,
      likeCount,
      dislikeCount,
      likeRate,
    };
  }, [feedbacks]);

  // フィルター適用
  const filteredFeedbacks = useMemo(() => {
    if (filter === 'all') return feedbacks;
    return feedbacks.filter((f) => f.feedback === filter);
  }, [feedbacks, filter]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  const feedbacksWithJobs = filteredFeedbacks.map((feedback) => {
    const job = jobs.find((j) => j.id === feedback.jobId);
    return { feedback, job };
  }).filter((item) => item.job !== undefined);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            フィードバック履歴
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            あなたの求人閲覧履歴と統計
          </p>
        </div>

        {/* 統計カード */}
        {feedbacks.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <TrendingUp className="h-4 w-4" />
                合計
              </div>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {stats.totalCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                <ThumbsUp className="h-4 w-4" />
                いいね
              </div>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.likeCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                <ThumbsDown className="h-4 w-4" />
                スキップ
              </div>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.dislikeCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                いいね率
              </div>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {stats.likeRate}%
              </p>
            </div>
          </div>
        )}

        {/* フィルターボタン */}
        {feedbacks.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Filter className="h-4 w-4" />
              フィルター:
            </div>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800'
              }`}
            >
              すべて ({stats.totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('like')}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                filter === 'like'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800'
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              いいね ({stats.likeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('dislike')}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                filter === 'dislike'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800'
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              スキップ ({stats.dislikeCount})
            </button>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <X className="h-3.5 w-3.5" />
                クリア
              </button>
            )}
          </div>
        )}

        {/* フィードバックリスト */}
        {feedbacksWithJobs.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <History className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {filter === 'all'
                  ? 'フィードバック履歴がありません'
                  : `${filter === 'like' ? 'いいね' : 'スキップ'}の履歴がありません`}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {filter === 'all'
                  ? '求人をスワイプしてフィードバックを残しましょう'
                  : 'フィルターを変更して他のフィードバックを確認できます'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacksWithJobs.map(({ feedback, job }) => (
              <div
                key={`${feedback.jobId}-${feedback.timestamp}`}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {feedback.feedback === 'like' ? (
                        <ThumbsUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {job?.title}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {job?.company}
                    </p>
                    {job?.location && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        📍 {job.location}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateTime(feedback.timestamp)}</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        feedback.feedback === 'like'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {feedback.feedback === 'like' ? 'いいね' : 'スキップ'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

