/**
 * 相関分析のためのユーティリティ関数
 */
import type { JobFeedback } from '@/types/job';
import type { EnhancedJob } from '@/types/job';

/**
 * フィードバックデータの型
 */
export interface FeedbackData {
  jobId: string;
  feedback: 'like' | 'dislike';
  timestamp: string;
}

/**
 * 特徴量の値の型
 */
export type FeatureValue = string | number | boolean | string[];

/**
 * 特徴量抽出関数の型
 */
export type FeatureExtractor = (job: EnhancedJob) => FeatureValue | null;

/**
 * 相関分析の結果
 */
export interface CorrelationResult {
  /** 特徴量の名前 */
  featureName: string;
  /** カテゴリ */
  category: string;
  /** 相関係数（-1から1の間） */
  correlation: number;
  /** サンプル数 */
  sampleCount: number;
}

/**
 * ピアソンの相関係数を計算
 * 2つの数値配列の相関を計算
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * カテゴリカル変数とフィードバックの相関を計算
 * カテゴリごとに「いいね」率を計算し、全体との相関を求める
 */
function calculateCategoricalCorrelation(
  values: (string | null)[],
  feedbacks: number[]
): number {
  if (values.length !== feedbacks.length || values.length === 0) {
    return 0;
  }

  // カテゴリごとの集計
  const categoryStats = new Map<string, { likes: number; total: number }>();

  values.forEach((value, index) => {
    if (value === null) return;

    const current = categoryStats.get(value) || { likes: 0, total: 0 };
    current.likes += feedbacks[index] === 1 ? 1 : 0;
    current.total += 1;
    categoryStats.set(value, current);
  });

  if (categoryStats.size === 0) {
    return 0;
  }

  // カテゴリごとの「いいね」率を計算
  const categoryRates: number[] = [];
  const feedbackValues: number[] = [];

  values.forEach((value, index) => {
    if (value === null) return;

    const stats = categoryStats.get(value);
    if (!stats || stats.total === 0) return;

    const rate = stats.likes / stats.total;
    categoryRates.push(rate);
    feedbackValues.push(feedbacks[index]);
  });

  if (categoryRates.length === 0) {
    return 0;
  }

  // 相関を計算
  return calculatePearsonCorrelation(categoryRates, feedbackValues);
}

/**
 * ブール値とフィードバックの相関を計算
 */
function calculateBooleanCorrelation(values: (boolean | null)[], feedbacks: number[]): number {
  if (values.length !== feedbacks.length || values.length === 0) {
    return 0;
  }

  // true/falseごとの集計
  let trueLikes = 0;
  let trueTotal = 0;
  let falseLikes = 0;
  let falseTotal = 0;

  values.forEach((value, index) => {
    if (value === null) return;

    if (value) {
      trueLikes += feedbacks[index] === 1 ? 1 : 0;
      trueTotal += 1;
    } else {
      falseLikes += feedbacks[index] === 1 ? 1 : 0;
      falseTotal += 1;
    }
  });

  if (trueTotal === 0 || falseTotal === 0) {
    return 0;
  }

  const trueRate = trueLikes / trueTotal;
  const falseRate = falseLikes / falseTotal;

  // 差を相関として返す（正規化）
  const diff = trueRate - falseRate;
  return Math.max(-1, Math.min(1, diff));
}

/**
 * 特徴量とフィードバックの相関を計算
 */
export function calculateCorrelation(
  jobs: EnhancedJob[],
  feedbacks: FeedbackData[],
  extractor: FeatureExtractor,
  featureName: string,
  category: string
): CorrelationResult | null {
  // フィードバックをMapに変換（jobId -> feedback）
  const feedbackMap = new Map<string, number>();
  feedbacks.forEach((fb) => {
    // like = 1, dislike = -1
    feedbackMap.set(fb.jobId, fb.feedback === 'like' ? 1 : -1);
  });

  // 各求人の特徴量を抽出
  const values: FeatureValue[] = [];
  const jobFeedbacks: number[] = [];

  jobs.forEach((job) => {
    const feedback = feedbackMap.get(job.id);
    if (feedback === undefined) return; // フィードバックがない求人は除外

    const featureValue = extractor(job);
    if (featureValue === null) return;

    values.push(featureValue);
    jobFeedbacks.push(feedback);
  });

  if (values.length === 0) {
    return null;
  }

  // 特徴量の型に応じて相関を計算
  let correlation = 0;

  if (typeof values[0] === 'number') {
    // 数値の場合
    const numericValues = values.map((v) => v as number);
    correlation = calculatePearsonCorrelation(numericValues, jobFeedbacks);
  } else if (typeof values[0] === 'boolean') {
    // ブール値の場合
    const booleanValues = values.map((v) => v as boolean);
    correlation = calculateBooleanCorrelation(booleanValues, jobFeedbacks);
  } else if (typeof values[0] === 'string') {
    // 文字列（カテゴリ）の場合
    const stringValues = values.map((v) => v as string);
    correlation = calculateCategoricalCorrelation(stringValues, jobFeedbacks);
  } else {
    // 配列など、その他の場合は処理しない
    return null;
  }

  return {
    featureName,
    category,
    correlation,
    sampleCount: values.length,
  };
}

/**
 * 複数の特徴量の相関を一括計算
 */
export function calculateCorrelations(
  jobs: EnhancedJob[],
  feedbacks: FeedbackData[],
  extractors: Array<{ extractor: FeatureExtractor; name: string; category: string }>
): CorrelationResult[] {
  const results: CorrelationResult[] = [];

  extractors.forEach(({ extractor, name, category }) => {
    const result = calculateCorrelation(jobs, feedbacks, extractor, name, category);
    if (result !== null) {
      results.push(result);
    }
  });

  // 相関係数の絶対値で降順ソート
  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

