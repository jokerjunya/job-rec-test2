'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EnhancedJob } from '@/types/job';
import { JobCard } from './job-card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { saveFeedback } from '@/utils/local-storage';

interface JobSwipeProps {
  jobs: EnhancedJob[];
}

/**
 * マッチングアプリ風のジョブスワイプコンポーネント
 */
export function JobSwipe({ jobs }: JobSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const currentJob = jobs[currentIndex];

  const handleFeedback = useCallback(
    (feedbackType: 'like' | 'dislike') => {
      if (isAnimating || !currentJob) return;

      // フィードバックを保存
      try {
        saveFeedback({
          jobId: currentJob.id,
          feedback: feedbackType,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save feedback:', error);
      }

      setIsAnimating(true);
      setSwipeDirection(feedbackType === 'like' ? 'right' : 'left');

      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, jobs.length - 1));
        setIsAnimating(false);
        setSwipeDirection(null);
      }, 300);
    },
    [currentJob, isAnimating, jobs.length]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === 'ArrowLeft') {
        handleFeedback('dislike');
      } else if (e.key === 'ArrowRight') {
        handleFeedback('like');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleFeedback, isAnimating]);

  if (!currentJob) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            すべての求人を確認しました
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            新しい求人が追加されるまでお待ちください
          </p>
        </div>
      </div>
    );
  }

  const transformClass = isAnimating
    ? swipeDirection === 'right'
      ? 'translate-x-full rotate-12 opacity-0'
      : '-translate-x-full -rotate-12 opacity-0'
    : 'translate-x-0 rotate-0 opacity-100';

  return (
    <div className="relative flex min-h-[600px] items-center justify-center">
      {/* カード */}
      <div
        className={`absolute w-full max-w-md transition-all duration-300 ${transformClass}`}
      >
        <JobCard job={currentJob} />
      </div>

      {/* フィードバックボタン */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
        <button
          type="button"
          onClick={() => handleFeedback('dislike')}
          disabled={isAnimating}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-lg transition-all hover:scale-110 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/30 dark:text-red-400"
          aria-label="よくないね"
        >
          <ThumbsDown className="h-8 w-8" />
        </button>
        <button
          type="button"
          onClick={() => handleFeedback('like')}
          disabled={isAnimating}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-lg transition-all hover:scale-110 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/30 dark:text-blue-400"
          aria-label="いいね"
        >
          <ThumbsUp className="h-8 w-8" />
        </button>
      </div>

      {/* プログレス表示 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-zinc-100">
          {currentIndex + 1} / {jobs.length}
        </div>
      </div>
    </div>
  );
}

