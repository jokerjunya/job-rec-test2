'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useJobFeedback } from '@/hooks/use-job-feedback';

interface FeedbackButtonsProps {
  jobId: string;
}

/**
 * フィードバックボタンコンポーネント
 */
export function FeedbackButtons({ jobId }: FeedbackButtonsProps) {
  const { feedbackType, toggleFeedback, isLoading } = useJobFeedback(jobId);

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  const isLiked = feedbackType === 'like';
  const isDisliked = feedbackType === 'dislike';

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => toggleFeedback('like')}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isLiked
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        }`}
        aria-label={isLiked ? 'いいねを取り消す' : 'いいね'}
        aria-pressed={isLiked}
      >
        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        <span>いいね</span>
      </button>

      <button
        type="button"
        onClick={() => toggleFeedback('dislike')}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isDisliked
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        }`}
        aria-label={isDisliked ? 'よくないねを取り消す' : 'よくないね'}
        aria-pressed={isDisliked}
      >
        <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-current' : ''}`} />
        <span>よくないね</span>
      </button>
    </div>
  );
}

