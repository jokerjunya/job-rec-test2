/**
 * ユーザー類似度計算エンジン
 * 協調フィルタリングに使用するユーザー間の類似度を計算
 */
import type { JobFeedback } from '@/types/job';

/**
 * ユーザー間の類似度情報
 */
export interface UserSimilarity {
  /** 対象ユーザーID */
  userId: string;
  
  /** 類似度スコア（0-1、高いほど類似） */
  similarityScore: number;
  
  /** 共通評価アイテム数 */
  commonItemsCount: number;
  
  /** 類似度計算に使用した手法 */
  method: 'cosine' | 'pearson' | 'jaccard';
}

/**
 * ユーザーの評価ベクトルを構築
 * jobId -> rating のマップを作成（like=1, dislike=-1）
 */
function buildUserRatingVector(
  feedbacks: JobFeedback[],
  userId: string
): Map<string, number> {
  const ratingMap = new Map<string, number>();
  
  feedbacks
    .filter((f) => f.userId === userId)
    .forEach((f) => {
      ratingMap.set(f.jobId, f.feedback === 'like' ? 1 : -1);
    });
  
  return ratingMap;
}

/**
 * 2つのベクトルの共通アイテムを取得
 */
function getCommonItems(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): string[] {
  const common: string[] = [];
  
  vector1.forEach((_, jobId) => {
    if (vector2.has(jobId)) {
      common.push(jobId);
    }
  });
  
  return common;
}

/**
 * コサイン類似度を計算
 * ベクトルの角度の近さを測定（-1から1の範囲）
 */
export function calculateCosineSimilarity(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  const commonItems = getCommonItems(vector1, vector2);
  
  if (commonItems.length === 0) {
    return 0;
  }
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  commonItems.forEach((jobId) => {
    const rating1 = vector1.get(jobId) || 0;
    const rating2 = vector2.get(jobId) || 0;
    
    dotProduct += rating1 * rating2;
    magnitude1 += rating1 * rating1;
    magnitude2 += rating2 * rating2;
  });
  
  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  
  if (magnitude === 0) {
    return 0;
  }
  
  // コサイン類似度は-1から1の範囲
  const similarity = dotProduct / magnitude;
  
  // 0から1の範囲に正規化（-1を0に、1を1に）
  return (similarity + 1) / 2;
}

/**
 * ピアソン相関係数を計算
 * ユーザーの評価傾向の相関を測定
 */
export function calculatePearsonCorrelation(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  const commonItems = getCommonItems(vector1, vector2);
  
  if (commonItems.length < 2) {
    return 0; // 最低2つの共通アイテムが必要
  }
  
  // 平均を計算
  let sum1 = 0;
  let sum2 = 0;
  
  commonItems.forEach((jobId) => {
    sum1 += vector1.get(jobId) || 0;
    sum2 += vector2.get(jobId) || 0;
  });
  
  const mean1 = sum1 / commonItems.length;
  const mean2 = sum2 / commonItems.length;
  
  // 共分散と分散を計算
  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;
  
  commonItems.forEach((jobId) => {
    const diff1 = (vector1.get(jobId) || 0) - mean1;
    const diff2 = (vector2.get(jobId) || 0) - mean2;
    
    covariance += diff1 * diff2;
    variance1 += diff1 * diff1;
    variance2 += diff2 * diff2;
  });
  
  const denominator = Math.sqrt(variance1 * variance2);
  
  if (denominator === 0) {
    return 0;
  }
  
  // ピアソン相関係数は-1から1の範囲
  const correlation = covariance / denominator;
  
  // 0から1の範囲に正規化
  return (correlation + 1) / 2;
}

/**
 * ジャッカード係数を計算
 * 評価したアイテムの集合の類似度を測定
 */
export function calculateJaccardSimilarity(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  const set1 = new Set(vector1.keys());
  const set2 = new Set(vector2.keys());
  
  // 積集合（共通アイテム）
  const intersection = new Set(
    Array.from(set1).filter((item) => set2.has(item))
  );
  
  // 和集合
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) {
    return 0;
  }
  
  return intersection.size / union.size;
}

/**
 * 2人のユーザー間の類似度を計算
 * デフォルトではコサイン類似度とピアソン相関の加重平均を使用
 */
export function calculateUserSimilarity(
  feedbacks: JobFeedback[],
  userId1: string,
  userId2: string,
  method: 'cosine' | 'pearson' | 'jaccard' | 'hybrid' = 'hybrid'
): UserSimilarity | null {
  const vector1 = buildUserRatingVector(feedbacks, userId1);
  const vector2 = buildUserRatingVector(feedbacks, userId2);
  
  const commonItems = getCommonItems(vector1, vector2);
  const commonItemsCount = commonItems.length;
  
  // 共通アイテムがない場合は類似度計算不可
  if (commonItemsCount === 0) {
    return null;
  }
  
  let similarityScore = 0;
  let usedMethod: 'cosine' | 'pearson' | 'jaccard' = 'cosine';
  
  if (method === 'hybrid') {
    // ハイブリッド手法: コサイン類似度とピアソン相関の加重平均
    const cosineSim = calculateCosineSimilarity(vector1, vector2);
    const pearsonSim = calculatePearsonCorrelation(vector1, vector2);
    
    // 共通アイテムが多い場合はピアソンの重みを上げる
    const pearsonWeight = Math.min(commonItemsCount / 10, 0.6);
    const cosineWeight = 1 - pearsonWeight;
    
    similarityScore = cosineSim * cosineWeight + pearsonSim * pearsonWeight;
    usedMethod = 'cosine'; // ハイブリッドだがベースはコサイン
  } else if (method === 'cosine') {
    similarityScore = calculateCosineSimilarity(vector1, vector2);
    usedMethod = 'cosine';
  } else if (method === 'pearson') {
    similarityScore = calculatePearsonCorrelation(vector1, vector2);
    usedMethod = 'pearson';
  } else if (method === 'jaccard') {
    similarityScore = calculateJaccardSimilarity(vector1, vector2);
    usedMethod = 'jaccard';
  }
  
  return {
    userId: userId2,
    similarityScore,
    commonItemsCount,
    method: usedMethod,
  };
}

/**
 * あるユーザーに対して全ユーザーとの類似度を計算し、上位N人を返す
 */
export function findSimilarUsers(
  feedbacks: JobFeedback[],
  targetUserId: string,
  topN: number = 10,
  method: 'cosine' | 'pearson' | 'jaccard' | 'hybrid' = 'hybrid',
  minCommonItems: number = 3
): UserSimilarity[] {
  // 全ユーザーIDを取得
  const allUserIds = Array.from(new Set(feedbacks.map((f) => f.userId)));
  
  // 対象ユーザー自身は除外
  const otherUserIds = allUserIds.filter((id) => id !== targetUserId);
  
  // 各ユーザーとの類似度を計算
  const similarities: UserSimilarity[] = [];
  
  otherUserIds.forEach((userId) => {
    const similarity = calculateUserSimilarity(feedbacks, targetUserId, userId, method);
    
    // 共通アイテムが最低基準以上の場合のみ追加
    if (similarity && similarity.commonItemsCount >= minCommonItems) {
      similarities.push(similarity);
    }
  });
  
  // 類似度スコアで降順ソート
  similarities.sort((a, b) => {
    // 類似度スコアが同じ場合は、共通アイテム数が多い方を優先
    if (Math.abs(b.similarityScore - a.similarityScore) < 0.001) {
      return b.commonItemsCount - a.commonItemsCount;
    }
    return b.similarityScore - a.similarityScore;
  });
  
  // 上位N人を返す
  return similarities.slice(0, topN);
}

/**
 * 類似度行列を計算（全ユーザー間の類似度）
 * パフォーマンス注意: O(n^2)の計算量
 */
export function calculateSimilarityMatrix(
  feedbacks: JobFeedback[],
  method: 'cosine' | 'pearson' | 'jaccard' | 'hybrid' = 'hybrid'
): Map<string, Map<string, number>> {
  const allUserIds = Array.from(new Set(feedbacks.map((f) => f.userId)));
  const matrix = new Map<string, Map<string, number>>();
  
  allUserIds.forEach((userId1) => {
    const row = new Map<string, number>();
    
    allUserIds.forEach((userId2) => {
      if (userId1 === userId2) {
        row.set(userId2, 1); // 自分自身との類似度は1
      } else {
        const similarity = calculateUserSimilarity(feedbacks, userId1, userId2, method);
        row.set(userId2, similarity?.similarityScore || 0);
      }
    });
    
    matrix.set(userId1, row);
  });
  
  return matrix;
}

