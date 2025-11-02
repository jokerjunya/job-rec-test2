'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FeedbackType, JobFeedback } from '@/types/job';
import {
  getFeedbackByJobId,
  saveFeedback as saveFeedbackToStorage,
  removeFeedback as removeFeedbackFromStorage,
} from '@/utils/local-storage';

/**
 * 求人フィードバック管理用のカスタムフック
 */
export function useJobFeedback(jobId: string) {
  const [feedback, setFeedback] = useState<JobFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * フィードバック状態を読み込む
   */
  useEffect(() => {
    const loadFeedback = () => {
      try {
        const savedFeedback = getFeedbackByJobId(jobId);
        setFeedback(savedFeedback);
      } catch (error) {
        console.error('Failed to load feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, [jobId]);

  /**
   * フィードバックを保存
   */
  const saveFeedback = useCallback(
    (feedbackType: FeedbackType) => {
      const newFeedback = {
        jobId,
        feedback: feedbackType,
        timestamp: new Date().toISOString(),
      };

      try {
        saveFeedbackToStorage(newFeedback);
        // 保存後にフィードバックを再読み込み
        const savedFeedback = getFeedbackByJobId(jobId);
        setFeedback(savedFeedback);
      } catch (error) {
        console.error('Failed to save feedback:', error);
      }
    },
    [jobId]
  );

  /**
   * フィードバックを削除
   */
  const removeFeedback = useCallback(() => {
    try {
      removeFeedbackFromStorage(jobId);
      setFeedback(null);
    } catch (error) {
      console.error('Failed to remove feedback:', error);
    }
  }, [jobId]);

  /**
   * フィードバックを切り替え
   */
  const toggleFeedback = useCallback(
    (feedbackType: FeedbackType) => {
      if (feedback?.feedback === feedbackType) {
        removeFeedback();
      } else {
        saveFeedback(feedbackType);
      }
    },
    [feedback, saveFeedback, removeFeedback]
  );

  return {
    feedback,
    isLoading,
    saveFeedback,
    removeFeedback,
    toggleFeedback,
    hasFeedback: feedback !== null,
    feedbackType: feedback?.feedback || null,
  };
}

