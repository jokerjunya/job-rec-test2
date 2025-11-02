/**
 * ダミーデータの統合エクスポート
 * ユーザープロファイルとフィードバックデータを提供
 */
import { dummyUserProfiles } from './generators/user-profiles';
import { generateAllUserFeedbacks } from './generators/user-feedbacks';
import { enhancedJobs } from './jobs';
import type { UserProfile } from '@/types/user-profile';
import type { JobFeedback, EnhancedJob } from '@/types/job';

/**
 * ダミー求人データ（既存の100件）
 */
export const dummyJobs: EnhancedJob[] = enhancedJobs;

/**
 * ダミーユーザープロファイル（35人）
 */
export const dummyUsers: UserProfile[] = dummyUserProfiles;

/**
 * ダミーフィードバックデータ
 * 全ユーザーの求人評価履歴
 */
export const dummyFeedbacks: JobFeedback[] = generateAllUserFeedbacks(
  dummyUsers,
  dummyJobs
);

/**
 * ユーザーIDからプロファイルを取得
 */
export function getUserProfile(userId: string): UserProfile | undefined {
  return dummyUsers.find((user) => user.id === userId);
}

/**
 * ユーザーのフィードバックを取得
 */
export function getUserFeedbacks(userId: string): JobFeedback[] {
  return dummyFeedbacks.filter((f) => f.userId === userId);
}

/**
 * 統計情報を取得
 */
export function getDummyDataStats() {
  const totalUsers = dummyUsers.length;
  const totalJobs = dummyJobs.length;
  const totalFeedbacks = dummyFeedbacks.length;
  
  const likeCount = dummyFeedbacks.filter((f) => f.feedback === 'like').length;
  const dislikeCount = dummyFeedbacks.filter((f) => f.feedback === 'dislike').length;
  
  const avgFeedbacksPerUser = Math.round(totalFeedbacks / totalUsers);
  const likeRate = Math.round((likeCount / totalFeedbacks) * 100);
  
  return {
    totalUsers,
    totalJobs,
    totalFeedbacks,
    likeCount,
    dislikeCount,
    avgFeedbacksPerUser,
    likeRate,
  };
}

