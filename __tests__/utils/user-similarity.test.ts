/**
 * ユーザー類似度計算のテスト
 */
import {
  calculateCosineSimilarity,
  calculatePearsonCorrelation,
  calculateJaccardSimilarity,
  calculateUserSimilarity,
  findSimilarUsers,
} from '@/utils/user-similarity';
import type { JobFeedback } from '@/types/job';

describe('user-similarity', () => {
  // テスト用のフィードバックデータ
  const mockFeedbacks: JobFeedback[] = [
    // User1: job1(like), job2(like), job3(dislike)
    { jobId: 'job1', userId: 'user1', feedback: 'like', timestamp: '2024-01-01' },
    { jobId: 'job2', userId: 'user1', feedback: 'like', timestamp: '2024-01-02' },
    { jobId: 'job3', userId: 'user1', feedback: 'dislike', timestamp: '2024-01-03' },
    
    // User2: job1(like), job2(like), job3(dislike) - User1と同じ
    { jobId: 'job1', userId: 'user2', feedback: 'like', timestamp: '2024-01-01' },
    { jobId: 'job2', userId: 'user2', feedback: 'like', timestamp: '2024-01-02' },
    { jobId: 'job3', userId: 'user2', feedback: 'dislike', timestamp: '2024-01-03' },
    
    // User3: job1(dislike), job2(dislike), job3(like) - User1と逆
    { jobId: 'job1', userId: 'user3', feedback: 'dislike', timestamp: '2024-01-01' },
    { jobId: 'job2', userId: 'user3', feedback: 'dislike', timestamp: '2024-01-02' },
    { jobId: 'job3', userId: 'user3', feedback: 'like', timestamp: '2024-01-03' },
    
    // User4: job1(like) のみ - 部分的に一致
    { jobId: 'job1', userId: 'user4', feedback: 'like', timestamp: '2024-01-01' },
  ];
  
  describe('calculateCosineSimilarity', () => {
    it('完全に同じ評価の場合、類似度が高い（1に近い）', () => {
      const vector1 = new Map([
        ['job1', 1],
        ['job2', 1],
        ['job3', -1],
      ]);
      const vector2 = new Map([
        ['job1', 1],
        ['job2', 1],
        ['job3', -1],
      ]);
      
      const similarity = calculateCosineSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(1, 1);
    });
    
    it('完全に逆の評価の場合、類似度が低い（0に近い）', () => {
      const vector1 = new Map([
        ['job1', 1],
        ['job2', 1],
        ['job3', -1],
      ]);
      const vector2 = new Map([
        ['job1', -1],
        ['job2', -1],
        ['job3', 1],
      ]);
      
      const similarity = calculateCosineSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(0, 1);
    });
    
    it('共通アイテムがない場合、類似度は0', () => {
      const vector1 = new Map([['job1', 1]]);
      const vector2 = new Map([['job2', 1]]);
      
      const similarity = calculateCosineSimilarity(vector1, vector2);
      expect(similarity).toBe(0);
    });
  });
  
  describe('calculatePearsonCorrelation', () => {
    it('完全に正の相関がある場合、類似度が高い', () => {
      const vector1 = new Map([
        ['job1', 1],
        ['job2', 1],
        ['job3', -1],
      ]);
      const vector2 = new Map([
        ['job1', 1],
        ['job2', 1],
        ['job3', -1],
      ]);
      
      const correlation = calculatePearsonCorrelation(vector1, vector2);
      expect(correlation).toBeCloseTo(1, 1);
    });
    
    it('共通アイテムが2未満の場合、相関係数は0', () => {
      const vector1 = new Map([['job1', 1]]);
      const vector2 = new Map([['job1', 1]]);
      
      const correlation = calculatePearsonCorrelation(vector1, vector2);
      expect(correlation).toBe(0);
    });
  });
  
  describe('calculateJaccardSimilarity', () => {
    it('完全に同じアイテムを評価している場合、類似度は1', () => {
      const vector1 = new Map([
        ['job1', 1],
        ['job2', 1],
      ]);
      const vector2 = new Map([
        ['job1', -1],
        ['job2', 1],
      ]);
      
      const similarity = calculateJaccardSimilarity(vector1, vector2);
      expect(similarity).toBe(1);
    });
    
    it('完全に異なるアイテムを評価している場合、類似度は0', () => {
      const vector1 = new Map([['job1', 1]]);
      const vector2 = new Map([['job2', 1]]);
      
      const similarity = calculateJaccardSimilarity(vector1, vector2);
      expect(similarity).toBe(0);
    });
  });
  
  describe('calculateUserSimilarity', () => {
    it('完全に同じ評価のユーザー間の類似度は高い', () => {
      const similarity = calculateUserSimilarity(
        mockFeedbacks,
        'user1',
        'user2',
        'hybrid'
      );
      
      expect(similarity).not.toBeNull();
      expect(similarity?.similarityScore).toBeGreaterThan(0.8);
      expect(similarity?.commonItemsCount).toBe(3);
    });
    
    it('完全に逆の評価のユーザー間の類似度は低い', () => {
      const similarity = calculateUserSimilarity(
        mockFeedbacks,
        'user1',
        'user3',
        'hybrid'
      );
      
      expect(similarity).not.toBeNull();
      expect(similarity?.similarityScore).toBeLessThan(0.3);
    });
    
    it('共通アイテムがない場合、nullを返す', () => {
      const feedbacks: JobFeedback[] = [
        { jobId: 'job1', userId: 'user1', feedback: 'like', timestamp: '2024-01-01' },
        { jobId: 'job2', userId: 'user2', feedback: 'like', timestamp: '2024-01-01' },
      ];
      
      const similarity = calculateUserSimilarity(
        feedbacks,
        'user1',
        'user2',
        'hybrid'
      );
      
      expect(similarity).toBeNull();
    });
  });
  
  describe('findSimilarUsers', () => {
    it('類似度が高い順にユーザーを返す', () => {
      const similarUsers = findSimilarUsers(
        mockFeedbacks,
        'user1',
        10,
        'hybrid',
        1
      );
      
      expect(similarUsers.length).toBeGreaterThan(0);
      expect(similarUsers[0].userId).toBe('user2'); // 最も類似度が高い
      
      // スコアが降順であることを確認
      for (let i = 1; i < similarUsers.length; i++) {
        expect(similarUsers[i - 1].similarityScore).toBeGreaterThanOrEqual(
          similarUsers[i].similarityScore
        );
      }
    });
    
    it('topN以下のユーザー数を返す', () => {
      const similarUsers = findSimilarUsers(
        mockFeedbacks,
        'user1',
        2,
        'hybrid',
        1
      );
      
      expect(similarUsers.length).toBeLessThanOrEqual(2);
    });
    
    it('最低共通アイテム数を下回るユーザーは除外される', () => {
      const similarUsers = findSimilarUsers(
        mockFeedbacks,
        'user1',
        10,
        'hybrid',
        5 // 最低5件の共通アイテムが必要（満たすユーザーはいない）
      );
      
      expect(similarUsers.length).toBe(0);
    });
  });
});

