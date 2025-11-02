/**
 * 相関分析ユーティリティ関数のテスト
 */
import { calculateCorrelation, calculateCorrelations } from '@/utils/analysis';
import type { EnhancedJob } from '@/types/job';
import type { FeedbackData } from '@/utils/analysis';

// テスト用のモックデータ
const createMockJob = (
  id: string,
  overrides: Partial<EnhancedJob> = {}
): EnhancedJob => ({
  id,
  title: 'テストエンジニア',
  company: 'テスト株式会社',
  salary: { min: 400, max: 600, currency: '万円' },
  location: '東京都',
  description: 'テスト用の求人です',
  requiredSkills: ['TypeScript', 'React'],
  workType: 'full-time',
  startDate: '2024-04-01',
  postedDate: '2024-01-01',
  companyAttributes: {
    size: 'medium',
    stage: 'growth',
    industry: 'IT・ソフトウェア',
    hasStockOptions: false,
    companyCulture: ['技術力重視'],
  },
  ...overrides,
});

describe('calculateCorrelation', () => {
  describe('数値特徴量の相関', () => {
    it('完全な正の相関を検出する', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', {
          salary: { min: 300, max: 400, currency: '万円' },
        }),
        createMockJob('2', {
          salary: { min: 500, max: 600, currency: '万円' },
        }),
        createMockJob('3', {
          salary: { min: 700, max: 800, currency: '万円' },
        }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'dislike', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
        { jobId: '3', feedback: 'like', timestamp: '2024-01-03' },
      ];

      const extractor = (job: EnhancedJob) => job.salary.min;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        '最低給与',
        'テスト'
      );

      expect(result).not.toBeNull();
      expect(result?.featureName).toBe('最低給与');
      expect(result?.category).toBe('テスト');
      expect(result?.correlation).toBeGreaterThan(0.5);
      expect(result?.sampleCount).toBe(3);
    });

    it('完全な負の相関を検出する', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', {
          salary: { min: 700, max: 800, currency: '万円' },
        }),
        createMockJob('2', {
          salary: { min: 500, max: 600, currency: '万円' },
        }),
        createMockJob('3', {
          salary: { min: 300, max: 400, currency: '万円' },
        }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'dislike', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
        { jobId: '3', feedback: 'like', timestamp: '2024-01-03' },
      ];

      const extractor = (job: EnhancedJob) => job.salary.min;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        '最低給与',
        'テスト'
      );

      expect(result).not.toBeNull();
      expect(result?.correlation).toBeLessThan(-0.5);
    });

    it('相関がない場合、絶対値が1より小さい値を返す', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', {
          salary: { min: 500, max: 600, currency: '万円' },
        }),
        createMockJob('2', {
          salary: { min: 300, max: 400, currency: '万円' },
        }),
        createMockJob('3', {
          salary: { min: 700, max: 800, currency: '万円' },
        }),
        createMockJob('4', {
          salary: { min: 400, max: 500, currency: '万円' },
        }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'like', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
        { jobId: '3', feedback: 'dislike', timestamp: '2024-01-03' },
        { jobId: '4', feedback: 'dislike', timestamp: '2024-01-04' },
      ];

      const extractor = (job: EnhancedJob) => job.salary.min;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        '最低給与',
        'テスト'
      );

      expect(result).not.toBeNull();
      // 相関係数は-1から1の間に収まることを確認
      expect(result?.correlation).toBeGreaterThanOrEqual(-1);
      expect(result?.correlation).toBeLessThanOrEqual(1);
    });
  });

  describe('ブール値特徴量の相関', () => {
    it('trueの方が好まれる場合、正の相関を返す', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', {
          companyAttributes: {
            size: 'startup',
            stage: 'early',
            industry: 'IT・ソフトウェア',
            hasStockOptions: true,
            companyCulture: ['技術力重視'],
          },
        }),
        createMockJob('2', {
          companyAttributes: {
            size: 'startup',
            stage: 'early',
            industry: 'IT・ソフトウェア',
            hasStockOptions: true,
            companyCulture: ['技術力重視'],
          },
        }),
        createMockJob('3', {
          companyAttributes: {
            size: 'large',
            stage: 'mature',
            industry: 'IT・ソフトウェア',
            hasStockOptions: false,
            companyCulture: ['技術力重視'],
          },
        }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'like', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
        { jobId: '3', feedback: 'dislike', timestamp: '2024-01-03' },
      ];

      const extractor = (job: EnhancedJob) =>
        job.companyAttributes?.hasStockOptions ?? null;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        'ストックオプション',
        'テスト'
      );

      expect(result).not.toBeNull();
      expect(result?.correlation).toBeGreaterThan(0);
    });

    it('falseの方が好まれる場合、負の相関を返す', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', {
          companyAttributes: {
            size: 'large',
            stage: 'mature',
            industry: 'IT・ソフトウェア',
            hasStockOptions: false,
            companyCulture: ['技術力重視'],
          },
        }),
        createMockJob('2', {
          companyAttributes: {
            size: 'large',
            stage: 'mature',
            industry: 'IT・ソフトウェア',
            hasStockOptions: false,
            companyCulture: ['技術力重視'],
          },
        }),
        createMockJob('3', {
          companyAttributes: {
            size: 'startup',
            stage: 'early',
            industry: 'IT・ソフトウェア',
            hasStockOptions: true,
            companyCulture: ['技術力重視'],
          },
        }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'like', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
        { jobId: '3', feedback: 'dislike', timestamp: '2024-01-03' },
      ];

      const extractor = (job: EnhancedJob) =>
        job.companyAttributes?.hasStockOptions ?? null;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        'ストックオプション',
        'テスト'
      );

      expect(result).not.toBeNull();
      expect(result?.correlation).toBeLessThan(0);
    });
  });

  describe('カテゴリカル特徴量の相関', () => {
    it('特定のカテゴリが好まれる場合、相関を検出する', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', { location: '東京都' }),
        createMockJob('2', { location: '東京都' }),
        createMockJob('3', { location: '大阪府' }),
        createMockJob('4', { location: '大阪府' }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'like', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
        { jobId: '3', feedback: 'dislike', timestamp: '2024-01-03' },
        { jobId: '4', feedback: 'dislike', timestamp: '2024-01-04' },
      ];

      const extractor = (job: EnhancedJob) => job.location;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        '勤務地',
        'テスト'
      );

      expect(result).not.toBeNull();
      expect(result?.sampleCount).toBe(4);
    });
  });

  describe('エッジケース', () => {
    it('フィードバックがない場合、nullを返す', () => {
      const jobs: EnhancedJob[] = [createMockJob('1')];
      const feedbacks: FeedbackData[] = [];
      const extractor = (job: EnhancedJob) => job.salary.min;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        '最低給与',
        'テスト'
      );

      expect(result).toBeNull();
    });

    it('特徴量がnullの場合、その求人を除外する', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1', { companyAttributes: undefined }),
        createMockJob('2', {
          companyAttributes: {
            size: 'startup',
            stage: 'early',
            industry: 'IT・ソフトウェア',
            hasStockOptions: true,
            companyCulture: ['技術力重視'],
          },
        }),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '1', feedback: 'like', timestamp: '2024-01-01' },
        { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
      ];

      const extractor = (job: EnhancedJob) =>
        job.companyAttributes?.hasStockOptions ?? null;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        'ストックオプション',
        'テスト'
      );

      // job1は除外されるため、サンプル数は1
      expect(result).not.toBeNull();
      expect(result?.sampleCount).toBe(1);
    });

    it('すべての求人がフィードバックなしの場合、nullを返す', () => {
      const jobs: EnhancedJob[] = [
        createMockJob('1'),
        createMockJob('2'),
        createMockJob('3'),
      ];

      const feedbacks: FeedbackData[] = [
        { jobId: '99', feedback: 'like', timestamp: '2024-01-01' },
      ];

      const extractor = (job: EnhancedJob) => job.salary.min;

      const result = calculateCorrelation(
        jobs,
        feedbacks,
        extractor,
        '最低給与',
        'テスト'
      );

      expect(result).toBeNull();
    });
  });
});

describe('calculateCorrelations', () => {
  it('複数の特徴量の相関を一括計算できる', () => {
    const jobs: EnhancedJob[] = [
      createMockJob('1', {
        salary: { min: 300, max: 400, currency: '万円' },
        location: '東京都',
      }),
      createMockJob('2', {
        salary: { min: 500, max: 600, currency: '万円' },
        location: '東京都',
      }),
      createMockJob('3', {
        salary: { min: 700, max: 800, currency: '万円' },
        location: '大阪府',
      }),
    ];

    const feedbacks: FeedbackData[] = [
      { jobId: '1', feedback: 'dislike', timestamp: '2024-01-01' },
      { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
      { jobId: '3', feedback: 'like', timestamp: '2024-01-03' },
    ];

    const extractors = [
      {
        extractor: (job: EnhancedJob) => job.salary.min,
        name: '最低給与',
        category: '給与',
      },
      {
        extractor: (job: EnhancedJob) => job.location,
        name: '勤務地',
        category: '場所',
      },
    ];

    const results = calculateCorrelations(jobs, feedbacks, extractors);

    expect(results).toHaveLength(2);
    expect(results[0].featureName).toBeDefined();
    expect(results[0].category).toBeDefined();
    expect(results[0].correlation).toBeDefined();
  });

  it('相関の絶対値で降順ソートされる', () => {
    const jobs: EnhancedJob[] = [
      createMockJob('1', {
        salary: { min: 300, max: 400, currency: '万円' },
        location: '東京都',
      }),
      createMockJob('2', {
        salary: { min: 500, max: 600, currency: '万円' },
        location: '大阪府',
      }),
      createMockJob('3', {
        salary: { min: 700, max: 800, currency: '万円' },
        location: '福岡県',
      }),
    ];

    const feedbacks: FeedbackData[] = [
      { jobId: '1', feedback: 'dislike', timestamp: '2024-01-01' },
      { jobId: '2', feedback: 'like', timestamp: '2024-01-02' },
      { jobId: '3', feedback: 'like', timestamp: '2024-01-03' },
    ];

    const extractors = [
      {
        extractor: (job: EnhancedJob) => job.salary.min,
        name: '最低給与',
        category: '給与',
      },
      {
        extractor: (job: EnhancedJob) => job.location,
        name: '勤務地',
        category: '場所',
      },
    ];

    const results = calculateCorrelations(jobs, feedbacks, extractors);

    // 降順であることを確認
    for (let i = 0; i < results.length - 1; i++) {
      expect(Math.abs(results[i].correlation)).toBeGreaterThanOrEqual(
        Math.abs(results[i + 1].correlation)
      );
    }
  });

  it('nullを返す特徴量は結果から除外される', () => {
    const jobs: EnhancedJob[] = [
      createMockJob('1', { companyAttributes: undefined }),
    ];

    const feedbacks: FeedbackData[] = [
      { jobId: '1', feedback: 'like', timestamp: '2024-01-01' },
    ];

    const extractors = [
      {
        extractor: (job: EnhancedJob) =>
          job.companyAttributes?.hasStockOptions ?? null,
        name: 'ストックオプション',
        category: '企業属性',
      },
    ];

    const results = calculateCorrelations(jobs, feedbacks, extractors);

    expect(results).toHaveLength(0);
  });
});

