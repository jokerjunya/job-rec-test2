/**
 * 求人データ取得ユーティリティ
 * Firestoreと静的データを統合
 */
import { getAllJobs as getAllJobsFromFirestore, getJobById as getJobByIdFromFirestore } from '@/lib/firebase/firestore';
import { enhancedJobs as staticJobs } from '@/data/jobs';
import type { EnhancedJob } from '@/types/job';

/**
 * すべての求人を取得
 * Firestoreのデータとstaticデータをマージして返す
 */
export async function getAllJobs(): Promise<EnhancedJob[]> {
  try {
    const firestoreJobs = await getAllJobsFromFirestore(true);
    
    // Firestoreにデータがない場合は静的データを返す
    if (firestoreJobs.length === 0) {
      return staticJobs;
    }
    
    // Firestoreのデータがあればそれとstaticデータをマージ
    // 重複排除: FirestoreのデータIDとstaticデータIDが重複する場合、Firestoreを優先
    const firestoreJobIds = new Set(firestoreJobs.map((job) => job.id));
    const uniqueStaticJobs = staticJobs.filter((job) => !firestoreJobIds.has(job.id));
    
    return [...firestoreJobs, ...uniqueStaticJobs];
  } catch (error) {
    console.error('Failed to get all jobs:', error);
    // エラー時は静的データを返す
    return staticJobs;
  }
}

/**
 * 特定の求人を取得
 */
export async function getJobById(jobId: string): Promise<EnhancedJob | null> {
  try {
    // まずFirestoreから探す
    const firestoreJob = await getJobByIdFromFirestore(jobId);
    if (firestoreJob) {
      return firestoreJob;
    }
    
    // Firestoreになければ静的データから探す
    const staticJob = staticJobs.find((job) => job.id === jobId);
    return staticJob || null;
  } catch (error) {
    console.error('Failed to get job by ID:', error);
    // エラー時は静的データから探す
    const staticJob = staticJobs.find((job) => job.id === jobId);
    return staticJob || null;
  }
}

