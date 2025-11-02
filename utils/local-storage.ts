/**
 * Firestore統合
 * lib/firebase/firestore.tsの関数を再エクスポート
 */
import { getCurrentUserId } from './auth';
import {
  saveFeedback as saveFeedbackToFirestore,
  getUserFeedbacks as getUserFeedbacksFromFirestore,
  getFeedbackByJobId as getFeedbackByJobIdFromFirestore,
  removeFeedback as removeFeedbackFromFirestore,
} from '@/lib/firebase/firestore';
import type { JobFeedback } from '@/types/job';

/**
 * フィードバックデータを取得（互換性のため残す、非推奨）
 * @deprecated 直接getUserFeedbacksを使用してください
 */
export async function getFeedbackData(): Promise<JobFeedback[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }
  return getUserFeedbacksFromFirestore(userId);
}

/**
 * フィードバックデータを保存（互換性のため残す、非推奨）
 * @deprecated 直接saveFeedbackを使用してください
 */
export async function setFeedbackData(feedback: JobFeedback[]): Promise<void> {
  // この関数は使用されないため、警告のみ
  console.warn('setFeedbackData is deprecated. Use saveFeedback instead.');
}

/**
 * 特定の求人のフィードバックを取得
 */
export async function getFeedbackByJobId(jobId: string): Promise<JobFeedback | null> {
  const userId = getCurrentUserId();
  if (!userId) {
    return null;
  }
  return getFeedbackByJobIdFromFirestore(userId, jobId);
}

/**
 * 現在のユーザーのすべてのフィードバックを取得
 */
export async function getUserFeedbacks(): Promise<JobFeedback[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }
  return getUserFeedbacksFromFirestore(userId);
}

/**
 * フィードバックを追加または更新
 */
export async function saveFeedback(feedback: Omit<JobFeedback, 'userId'>): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('ユーザーがログインしていません');
  }
  await saveFeedbackToFirestore(userId, feedback);
}

/**
 * フィードバックを削除
 */
export async function removeFeedback(jobId: string): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) {
    return;
  }
  await removeFeedbackFromFirestore(userId, jobId);
}

