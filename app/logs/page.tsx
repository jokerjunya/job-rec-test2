'use client';

import { useAuth } from '@/contexts/auth-context';
import { getUserFeedbacks } from '@/utils/local-storage';
import { jobs } from '@/data/jobs';
import { useState, useEffect } from 'react';
import type { JobFeedback } from '@/types/job';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';

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

/**
 * ログ閲覧ページコンポーネント
 */
function LogsPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<JobFeedback[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const userFeedbacks = getUserFeedbacks();
      setFeedbacks(userFeedbacks);
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const feedbacksWithJobs = feedbacks.map((feedback) => {
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
            {feedbacksWithJobs.length}件のフィードバック
          </p>
        </div>

        {feedbacksWithJobs.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              フィードバック履歴がありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacksWithJobs.map(({ feedback, job }) => (
              <div
                key={`${feedback.jobId}-${feedback.timestamp}`}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
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
                      {feedback.feedback === 'like' ? 'いいね' : 'よくないね'}
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

