'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EnhancedJob } from '@/types/job';
import { JobCard } from './job-card';
import { ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { saveFeedback } from '@/utils/local-storage';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import toast from 'react-hot-toast';

interface JobSwipeProps {
  jobs: EnhancedJob[];
}

const SWIPE_THRESHOLD = 100; // スワイプの閾値（px）

/**
 * マッチングアプリ風のジョブスワイプコンポーネント
 */
export function JobSwipe({ jobs }: JobSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const currentJob = jobs[currentIndex];

  // framer-motionのモーションバリュー
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

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

        // トースト通知
        toast.success(
          feedbackType === 'like' ? 'いいねしました！' : 'スキップしました',
          {
            icon: feedbackType === 'like' ? '👍' : '👎',
          }
        );
      } catch (error) {
        console.error('Failed to save feedback:', error);
        toast.error('フィードバックの保存に失敗しました');
      }

      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, jobs.length - 1));
        setIsAnimating(false);
        x.set(0); // 位置をリセット
      }, 300);
    },
    [currentJob, isAnimating, jobs.length, x]
  );

  // ドラッグ終了時のハンドラー
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
        const feedbackType = info.offset.x > 0 ? 'like' : 'dislike';
        handleFeedback(feedbackType);
      } else {
        // 閾値未満の場合は元に戻る
        x.set(0);
      }
    },
    [handleFeedback, x]
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

  // キーボードヒントを5秒後に非表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKeyboardHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentJob) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ThumbsUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              すべての求人を確認しました
            </p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              お疲れ様でした！
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/logs"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              履歴を見る
            </a>
            <a
              href="/compare"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              求人を比較する
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[500px] sm:min-h-[600px] items-center justify-center px-2 sm:px-0">
      {/* キーボードヒント（デスクトップのみ） */}
      {showKeyboardHint && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-xs font-medium text-blue-900 dark:text-blue-300 shadow-md">
            <Info className="h-4 w-4" />
            <span>←/→キーでスワイプ、またはドラッグ操作</span>
          </div>
        </motion.div>
      )}

      {/* カード（タッチジェスチャー対応） */}
      <motion.div
        className="absolute w-full max-w-md cursor-grab active:cursor-grabbing px-2 sm:px-0"
        style={{
          x,
          rotate,
          opacity,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.02 }}
      >
        <JobCard job={currentJob} />

        {/* スワイプインジケーター */}
        <motion.div
          className="absolute top-4 right-4 rounded-lg border-2 sm:border-4 border-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 sm:px-6 py-2 sm:py-3 text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 rotate-12 opacity-0"
          style={{
            opacity: useTransform(x, [0, 100], [0, 1]),
          }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-4 left-4 rounded-lg border-2 sm:border-4 border-red-600 bg-red-100 dark:bg-red-900/30 px-3 sm:px-6 py-2 sm:py-3 text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 -rotate-12 opacity-0"
          style={{
            opacity: useTransform(x, [-100, 0], [1, 0]),
          }}
        >
          NOPE
        </motion.div>
      </motion.div>

      {/* フィードバックボタン */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 flex -translate-x-1/2 gap-3 sm:gap-4 z-10">
        <button
          type="button"
          onClick={() => handleFeedback('dislike')}
          disabled={isAnimating}
          className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/30 dark:text-red-400 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
          aria-label="よくないね（矢印左キー）"
        >
          <ThumbsDown className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
        <button
          type="button"
          onClick={() => handleFeedback('like')}
          disabled={isAnimating}
          className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/30 dark:text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
          aria-label="いいね（矢印右キー）"
        >
          <ThumbsUp className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
      </div>

      {/* プログレス表示 */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2">
        <div className="rounded-full bg-white/80 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-zinc-100 backdrop-blur-sm">
          {currentIndex + 1} / {jobs.length}
        </div>
      </div>
    </div>
  );
}

