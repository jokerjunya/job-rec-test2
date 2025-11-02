/**
 * Firestore操作のテスト
 */
import {
  saveFeedback,
  getUserFeedbacks,
  getFeedbackByJobId,
  removeFeedback,
  saveJob,
  getAllJobs,
} from '@/lib/firebase/firestore';
import { setDoc, getDoc, getDocs, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { JobFeedback, EnhancedJob } from '@/types/job';

// モックの型定義
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;

describe('Firestore Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveFeedback', () => {
    it('フィードバックを保存できる', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      const feedback: Omit<JobFeedback, 'userId'> = {
        jobId: 'job-001',
        feedback: 'like',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      await expect(saveFeedback('user-001', feedback)).resolves.not.toThrow();
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('エラー時に例外をスローする', async () => {
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const feedback: Omit<JobFeedback, 'userId'> = {
        jobId: 'job-001',
        feedback: 'like',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      await expect(saveFeedback('user-001', feedback)).rejects.toThrow(
        'フィードバックの保存に失敗しました'
      );
    });
  });

  describe('getUserFeedbacks', () => {
    it('ユーザーのフィードバックを取得できる', async () => {
      const mockTimestamp = {
        toDate: () => new Date('2024-01-01'),
      };
      
      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          const mockDoc = {
            data: () => ({
              jobId: 'job-001',
              userId: 'user-001',
              feedback: 'like',
              timestamp: mockTimestamp,
            }),
          };
          callback(mockDoc);
        },
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const feedbacks = await getUserFeedbacks('user-001');

      expect(feedbacks).toHaveLength(1);
      expect(feedbacks[0].jobId).toBe('job-001');
      expect(feedbacks[0].feedback).toBe('like');
    });

    it('エラー時に空配列を返す', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const feedbacks = await getUserFeedbacks('user-001');

      expect(feedbacks).toEqual([]);
    });
  });

  describe('getFeedbackByJobId', () => {
    it('特定の求人のフィードバックを取得できる', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          jobId: 'job-001',
          userId: 'user-001',
          feedback: 'like',
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      };

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const feedback = await getFeedbackByJobId('user-001', 'job-001');

      expect(feedback).not.toBeNull();
      expect(feedback?.jobId).toBe('job-001');
    });

    it('存在しないフィードバックはnullを返す', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const feedback = await getFeedbackByJobId('user-001', 'job-999');

      expect(feedback).toBeNull();
    });
  });

  describe('removeFeedback', () => {
    it('フィードバックを削除できる', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await expect(removeFeedback('user-001', 'job-001')).resolves.not.toThrow();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('エラー時に例外をスローする', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(removeFeedback('user-001', 'job-001')).rejects.toThrow(
        'フィードバックの削除に失敗しました'
      );
    });
  });

  describe('saveJob', () => {
    it('求人データを保存できる', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      const job: EnhancedJob = {
        id: 'job-001',
        title: 'エンジニア',
        company: 'テスト会社',
        salary: { min: 400, max: 600, currency: '万円' },
        location: '東京都',
        description: 'テスト求人',
        requiredSkills: ['TypeScript'],
        workType: 'full-time',
        startDate: '2024-02-01',
        postedDate: '2024-01-01',
      };

      await expect(saveJob(job, true)).resolves.not.toThrow();
      expect(mockSetDoc).toHaveBeenCalled();
    });
  });

  describe('getAllJobs', () => {
    it('すべての求人を取得できる', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          const mockDoc = {
            data: () => ({
              id: 'job-001',
              title: 'エンジニア',
              company: 'テスト会社',
              salary: { min: 400, max: 600, currency: '万円' },
              location: '東京都',
              description: 'テスト求人',
              requiredSkills: ['TypeScript'],
              workType: 'full-time',
              startDate: '2024-02-01',
              postedDate: '2024-01-01',
              isDummy: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          };
          callback(mockDoc);
        },
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const jobs = await getAllJobs(true);

      expect(jobs).toHaveLength(1);
      expect(jobs[0].id).toBe('job-001');
    });

    it('エラー時に空配列を返す', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const jobs = await getAllJobs();

      expect(jobs).toEqual([]);
    });
  });
});

