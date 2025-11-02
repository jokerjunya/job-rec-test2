import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { JobFeedback } from '@/types/job';
import type { EnhancedJob } from '@/types/job';
import type { UserProfile } from '@/types/user-profile';

/**
 * フィードバックを保存
 */
export async function saveFeedback(
  userId: string,
  feedback: Omit<JobFeedback, 'userId'>
): Promise<void> {
  try {
    const feedbackData: JobFeedback = {
      ...feedback,
      userId,
    };

    // feedbackIdを生成（userId-jobId の組み合わせで一意性を保証）
    const feedbackId = `${userId}_${feedback.jobId}`;
    
    await setDoc(doc(db, 'feedbacks', feedbackId), {
      ...feedbackData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    throw new Error('フィードバックの保存に失敗しました');
  }
}

/**
 * ユーザーのすべてのフィードバックを取得
 */
export async function getUserFeedbacks(userId: string): Promise<JobFeedback[]> {
  try {
    const q = query(
      collection(db, 'feedbacks'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const feedbacks: JobFeedback[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      feedbacks.push({
        jobId: data.jobId,
        userId: data.userId,
        feedback: data.feedback,
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate().toISOString()
          : data.timestamp,
      });
    });

    return feedbacks;
  } catch (error) {
    console.error('Failed to get user feedbacks:', error);
    return [];
  }
}

/**
 * 特定の求人のフィードバックを取得
 */
export async function getFeedbackByJobId(
  userId: string,
  jobId: string
): Promise<JobFeedback | null> {
  try {
    const feedbackId = `${userId}_${jobId}`;
    const docSnap = await getDoc(doc(db, 'feedbacks', feedbackId));

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        jobId: data.jobId,
        userId: data.userId,
        feedback: data.feedback,
        timestamp: data.timestamp instanceof Timestamp
          ? data.timestamp.toDate().toISOString()
          : data.timestamp,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get feedback by job ID:', error);
    return null;
  }
}

/**
 * フィードバックを削除
 */
export async function removeFeedback(userId: string, jobId: string): Promise<void> {
  try {
    const feedbackId = `${userId}_${jobId}`;
    await deleteDoc(doc(db, 'feedbacks', feedbackId));
  } catch (error) {
    console.error('Failed to remove feedback:', error);
    throw new Error('フィードバックの削除に失敗しました');
  }
}

/**
 * 求人データを保存
 */
export async function saveJob(job: EnhancedJob, isDummy: boolean = false): Promise<void> {
  try {
    await setDoc(doc(db, 'jobs', job.id), {
      ...job,
      isDummy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save job:', error);
    throw new Error('求人の保存に失敗しました');
  }
}

/**
 * すべての求人データを取得
 */
export async function getAllJobs(includesDummy: boolean = true): Promise<EnhancedJob[]> {
  try {
    let q;
    
    if (includesDummy) {
      q = query(collection(db, 'jobs'), orderBy('postedDate', 'desc'));
    } else {
      q = query(
        collection(db, 'jobs'),
        where('isDummy', '==', false),
        orderBy('postedDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const jobs: EnhancedJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // isDummy, createdAt, updatedAt フィールドは除外して返す
      const { isDummy, createdAt, updatedAt, ...jobData } = data;
      jobs.push(jobData as EnhancedJob);
    });

    return jobs;
  } catch (error) {
    console.error('Failed to get all jobs:', error);
    return [];
  }
}

/**
 * 特定の求人を取得
 */
export async function getJobById(jobId: string): Promise<EnhancedJob | null> {
  try {
    const docSnap = await getDoc(doc(db, 'jobs', jobId));

    if (docSnap.exists()) {
      const data = docSnap.data();
      const { isDummy, createdAt, updatedAt, ...jobData } = data;
      return jobData as EnhancedJob;
    }

    return null;
  } catch (error) {
    console.error('Failed to get job by ID:', error);
    return null;
  }
}

/**
 * ユーザープロファイルを保存
 */
export async function saveUserProfile(
  userId: string,
  profile: UserProfile
): Promise<void> {
  try {
    await setDoc(doc(db, 'userProfiles', userId), {
      ...profile,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save user profile:', error);
    throw new Error('ユーザープロファイルの保存に失敗しました');
  }
}

/**
 * ユーザープロファイルを取得
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'userProfiles', userId));

    if (docSnap.exists()) {
      const data = docSnap.data();
      const { updatedAt, ...profileData } = data;
      return profileData as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

