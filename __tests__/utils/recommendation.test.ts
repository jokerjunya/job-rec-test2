/**
 * レコメンデーションエンジンのテスト
 */
import { recommendJobs } from '@/utils/recommendation';
import type { JobFeedback, EnhancedJob } from '@/types/job';

describe('recommendation', () => {
  // テスト用の求人データ
  const mockJobs: EnhancedJob[] = [
    {
      id: 'job1',
      title: 'フロントエンドエンジニア',
      company: 'テスト株式会社',
      salary: { min: 400, max: 600, currency: '万円' },
      location: '東京',
      description: 'テスト求人1',
      requiredSkills: ['React', 'TypeScript'],
      workType: 'remote',
      startDate: '2024-04-01',
      postedDate: '2024-01-01',
    },
    {
      id: 'job2',
      title: 'バックエンドエンジニア',
      company: 'テスト株式会社',
      salary: { min: 500, max: 700, currency: '万円' },
      location: '大阪',
      description: 'テスト求人2',
      requiredSkills: ['Node.js', 'PostgreSQL'],
      workType: 'full-time',
      startDate: '2024-04-01',
      postedDate: '2024-01-02',
    },
    {
      id: 'job3',
      title: 'データサイエンティスト',
      company: 'テスト株式会社',
      salary: { min: 600, max: 900, currency: '万円' },
      location: '東京',
      description: 'テスト求人3',
      requiredSkills: ['Python', 'TensorFlow'],
      workType: 'hybrid',
      startDate: '2024-04-01',
      postedDate: '2024-01-03',
    },
    {
      id: 'job4',
      title: 'デザイナー',
      company: 'テスト株式会社',
      salary: { min: 400, max: 600, currency: '万円' },
      location: '福岡',
      description: 'テスト求人4',
      requiredSkills: ['Figma', 'Adobe XD'],
      workType: 'remote',
      startDate: '2024-04-01',
      postedDate: '2024-01-04',
    },
    {
      id: 'job5',
      title: 'プロジェクトマネージャー',
      company: 'テスト株式会社',
      salary: { min: 700, max: 1000, currency: '万円' },
      location: '東京',
      description: 'テスト求人5',
      requiredSkills: ['プロジェクト管理', 'アジャイル'],
      workType: 'full-time',
      startDate: '2024-04-01',
      postedDate: '2024-01-05',
    },
    {
      id: 'job6',
      title: 'DevOpsエンジニア',
      company: 'テスト株式会社',
      salary: { min: 600, max: 800, currency: '万円' },
      location: '大阪',
      description: 'テスト求人6',
      requiredSkills: ['Docker', 'Kubernetes', 'AWS'],
      workType: 'hybrid',
      startDate: '2024-04-01',
      postedDate: '2024-01-06',
    },
  ];
  
  // テスト用のフィードバックデータ
  // より多くの共通アイテムを持たせて類似度計算が機能するようにする
  const mockFeedbacks: JobFeedback[] = [
    // Target user: 複数の求人を評価（未評価: job2, job3）
    { jobId: 'job1', userId: 'target', feedback: 'like', timestamp: '2024-01-01' },
    { jobId: 'job4', userId: 'target', feedback: 'like', timestamp: '2024-01-04' },
    { jobId: 'job5', userId: 'target', feedback: 'dislike', timestamp: '2024-01-05' },
    { jobId: 'job6', userId: 'target', feedback: 'like', timestamp: '2024-01-06' },
    
    // Similar user1: targetと同じ傾向
    { jobId: 'job1', userId: 'similar1', feedback: 'like', timestamp: '2024-01-01' },
    { jobId: 'job2', userId: 'similar1', feedback: 'like', timestamp: '2024-01-02' },
    { jobId: 'job3', userId: 'similar1', feedback: 'dislike', timestamp: '2024-01-03' },
    { jobId: 'job4', userId: 'similar1', feedback: 'like', timestamp: '2024-01-04' },
    { jobId: 'job5', userId: 'similar1', feedback: 'dislike', timestamp: '2024-01-05' },
    { jobId: 'job6', userId: 'similar1', feedback: 'like', timestamp: '2024-01-06' },
    
    // Similar user2: targetと同じ傾向
    { jobId: 'job1', userId: 'similar2', feedback: 'like', timestamp: '2024-01-01' },
    { jobId: 'job2', userId: 'similar2', feedback: 'like', timestamp: '2024-01-02' },
    { jobId: 'job4', userId: 'similar2', feedback: 'like', timestamp: '2024-01-04' },
    { jobId: 'job5', userId: 'similar2', feedback: 'dislike', timestamp: '2024-01-05' },
    { jobId: 'job6', userId: 'similar2', feedback: 'like', timestamp: '2024-01-06' },
    
    // Dissimilar user: 逆の傾向
    { jobId: 'job1', userId: 'dissimilar', feedback: 'dislike', timestamp: '2024-01-01' },
    { jobId: 'job2', userId: 'dissimilar', feedback: 'dislike', timestamp: '2024-01-02' },
    { jobId: 'job3', userId: 'dissimilar', feedback: 'like', timestamp: '2024-01-03' },
    { jobId: 'job4', userId: 'dissimilar', feedback: 'dislike', timestamp: '2024-01-04' },
  ];
  
  describe('recommendJobs', () => {
    it('未評価の求人からレコメンドを生成する', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        5
      );
      
      // レコメンドが生成される
      expect(recommendations.length).toBeGreaterThan(0);
      
      // すべて未評価の求人であることを確認
      recommendations.forEach((rec) => {
        expect(rec.job.id).not.toBe('job1'); // job1は既に評価済み
      });
    });
    
    it('類似ユーザーが高く評価した求人が上位に来る', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        5
      );
      
      // job2は類似ユーザー2人がlikeしているので、上位に来るはず
      const job2Rec = recommendations.find((r) => r.job.id === 'job2');
      expect(job2Rec).toBeDefined();
      
      if (job2Rec) {
        // job3（1人がdislike、1人がlike）よりスコアが高いはず
        const job3Rec = recommendations.find((r) => r.job.id === 'job3');
        if (job3Rec) {
          expect(job2Rec.score).toBeGreaterThan(job3Rec.score);
        }
      }
    });
    
    it('スコアが降順でソートされている', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        5
      );
      
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(
          recommendations[i].score
        );
      }
    });
    
    it('topN以下のレコメンド数を返す', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        2
      );
      
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });
    
    it('レコメンド理由が含まれる', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        5
      );
      
      recommendations.forEach((rec) => {
        expect(rec.reason).toBeDefined();
        expect(rec.reason.length).toBeGreaterThan(0);
      });
    });
    
    it('スコア内訳が含まれる', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        5
      );
      
      recommendations.forEach((rec) => {
        expect(rec.scoreBreakdown.collaborativeScore).toBeDefined();
        expect(rec.scoreBreakdown.predictedRating).toBeDefined();
        expect(rec.scoreBreakdown.contributingUsers).toBeDefined();
        
        expect(rec.scoreBreakdown.contributingUsers).toBeGreaterThan(0);
      });
    });
    
    it('類似ユーザーがいない場合、空配列を返す', () => {
      const feedbacks: JobFeedback[] = [
        { jobId: 'job1', userId: 'lonely', feedback: 'like', timestamp: '2024-01-01' },
      ];
      
      const recommendations = recommendJobs(
        'lonely',
        mockJobs,
        feedbacks,
        5
      );
      
      expect(recommendations.length).toBe(0);
    });
    
    it('最低レコメンドスコア未満の求人は除外される', () => {
      const recommendations = recommendJobs(
        'target',
        mockJobs,
        mockFeedbacks,
        5,
        {
          minRecommendScore: 0.9, // 非常に高い閾値
        }
      );
      
      // 高いスコアの求人のみが含まれる
      recommendations.forEach((rec) => {
        expect(rec.score).toBeGreaterThanOrEqual(0.9);
      });
    });
  });
});

