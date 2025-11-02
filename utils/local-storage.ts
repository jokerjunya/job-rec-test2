import type { JobFeedback } from '@/types/job';
import { getCurrentUserId } from './auth';

/**
 * localStorage操作のキー
 */
const STORAGE_KEY = 'job-feedback';

/**
 * localStorageが利用可能かチェック
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * フィードバックデータを取得
 */
export function getFeedbackData(): JobFeedback[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as JobFeedback[];
  } catch {
    return [];
  }
}

/**
 * フィードバックデータを保存
 */
export function setFeedbackData(feedback: JobFeedback[]): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
  } catch (error) {
    console.error('Failed to save feedback data:', error);
  }
}

/**
 * 特定の求人のフィードバックを取得（現在のユーザー用）
 */
export function getFeedbackByJobId(jobId: string): JobFeedback | null {
  const userId = getCurrentUserId();
  if (!userId) {
    return null;
  }

  const feedbacks = getFeedbackData();
  return feedbacks.find((f) => f.jobId === jobId && f.userId === userId) || null;
}

/**
 * 現在のユーザーのすべてのフィードバックを取得
 */
export function getUserFeedbacks(): JobFeedback[] {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }

  const feedbacks = getFeedbackData();
  return feedbacks.filter((f) => f.userId === userId).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * フィードバックを追加または更新
 */
export function saveFeedback(feedback: Omit<JobFeedback, 'userId'>): void {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('ユーザーがログインしていません');
  }

  const feedbacks = getFeedbackData();
  const feedbackWithUserId: JobFeedback = {
    ...feedback,
    userId,
  };

  const existingIndex = feedbacks.findIndex(
    (f) => f.jobId === feedback.jobId && f.userId === userId
  );

  if (existingIndex >= 0) {
    feedbacks[existingIndex] = feedbackWithUserId;
  } else {
    feedbacks.push(feedbackWithUserId);
  }

  setFeedbackData(feedbacks);
}

/**
 * フィードバックを削除
 */
export function removeFeedback(jobId: string): void {
  const userId = getCurrentUserId();
  if (!userId) {
    return;
  }

  const feedbacks = getFeedbackData();
  const filtered = feedbacks.filter(
    (f) => !(f.jobId === jobId && f.userId === userId)
  );
  setFeedbackData(filtered);
}

