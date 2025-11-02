/**
 * レコメンデーションエンジン
 * ユーザーベース協調フィルタリングによる求人推薦
 */
import type { JobFeedback, EnhancedJob } from '@/types/job';
import type { UserSimilarity } from './user-similarity';
import { findSimilarUsers } from './user-similarity';

/**
 * レコメンド結果
 */
export interface JobRecommendation {
  /** 求人 */
  job: EnhancedJob;
  
  /** レコメンドスコア（0-1、高いほど推薦度が高い） */
  score: number;
  
  /** スコアの内訳 */
  scoreBreakdown: {
    /** 類似ユーザーからのスコア */
    collaborativeScore: number;
    
    /** 予測評価（like確率） */
    predictedRating: number;
    
    /** 推薦に寄与したユーザー数 */
    contributingUsers: number;
  };
  
  /** レコメンド理由 */
  reason: string;
}

/**
 * レコメンデーション設定
 */
export interface RecommendationOptions {
  /** 考慮する類似ユーザー数（デフォルト: 10） */
  similarUsersCount?: number;
  
  /** 最低共通アイテム数（デフォルト: 3） */
  minCommonItems?: number;
  
  /** 類似度計算手法（デフォルト: 'hybrid'） */
  similarityMethod?: 'cosine' | 'pearson' | 'jaccard' | 'hybrid';
  
  /** レコメンド対象の最大件数（デフォルト: 20） */
  maxCandidates?: number;
  
  /** 最低レコメンドスコア（デフォルト: 0.3） */
  minRecommendScore?: number;
}

/**
 * デフォルトのレコメンデーション設定
 */
const DEFAULT_OPTIONS: Required<RecommendationOptions> = {
  similarUsersCount: 10,
  minCommonItems: 3,
  similarityMethod: 'hybrid',
  maxCandidates: 20,
  minRecommendScore: 0.3,
};

/**
 * ユーザーが評価していない求人を取得
 */
function getUnevaluatedJobs(
  allJobs: EnhancedJob[],
  feedbacks: JobFeedback[],
  userId: string
): EnhancedJob[] {
  const evaluatedJobIds = new Set(
    feedbacks.filter((f) => f.userId === userId).map((f) => f.jobId)
  );
  
  return allJobs.filter((job) => !evaluatedJobIds.has(job.id));
}

/**
 * 求人に対する予測評価を計算（ユーザーベース協調フィルタリング）
 */
function predictRating(
  jobId: string,
  similarUsers: UserSimilarity[],
  feedbacks: JobFeedback[]
): { rating: number; contributingUsers: number } {
  let weightedSum = 0;
  let similaritySum = 0;
  let contributingUsers = 0;
  
  similarUsers.forEach((similarUser) => {
    // この類似ユーザーがこの求人を評価しているか確認
    const feedback = feedbacks.find(
      (f) => f.userId === similarUser.userId && f.jobId === jobId
    );
    
    if (feedback) {
      // like=1, dislike=-1
      const rating = feedback.feedback === 'like' ? 1 : -1;
      
      // 類似度で重み付け
      weightedSum += rating * similarUser.similarityScore;
      similaritySum += similarUser.similarityScore;
      contributingUsers++;
    }
  });
  
  if (similaritySum === 0 || contributingUsers === 0) {
    return { rating: 0, contributingUsers: 0 };
  }
  
  // 加重平均を計算（-1から1の範囲）
  const predictedRating = weightedSum / similaritySum;
  
  return { rating: predictedRating, contributingUsers };
}

/**
 * レコメンド理由を生成
 */
function generateRecommendationReason(
  contributingUsers: number,
  predictedRating: number,
  collaborativeScore: number
): string {
  if (contributingUsers === 0) {
    return '新着求人です';
  }
  
  if (contributingUsers === 1) {
    return 'あなたと似た好みのユーザーが気に入っています';
  }
  
  const likePercentage = Math.round(((predictedRating + 1) / 2) * 100);
  
  if (collaborativeScore >= 0.8) {
    return `あなたと似た${contributingUsers}人のユーザーが高く評価しています（${likePercentage}%が「いいね」）`;
  } else if (collaborativeScore >= 0.6) {
    return `あなたと似た${contributingUsers}人のユーザーが評価しています`;
  } else {
    return `${contributingUsers}人のユーザーが評価しています`;
  }
}

/**
 * ユーザーベース協調フィルタリングによる求人推薦
 */
export function recommendJobs(
  userId: string,
  allJobs: EnhancedJob[],
  allFeedbacks: JobFeedback[],
  topN: number = 5,
  options: RecommendationOptions = {}
): JobRecommendation[] {
  // オプションをマージ
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 類似ユーザーを見つける
  const similarUsers = findSimilarUsers(
    allFeedbacks,
    userId,
    opts.similarUsersCount,
    opts.similarityMethod,
    opts.minCommonItems
  );
  
  // 類似ユーザーが見つからない場合は空配列を返す
  if (similarUsers.length === 0) {
    return [];
  }
  
  // ユーザーが評価していない求人を取得
  const unevaluatedJobs = getUnevaluatedJobs(allJobs, allFeedbacks, userId);
  
  // 各求人のレコメンドスコアを計算
  const recommendations: JobRecommendation[] = [];
  
  unevaluatedJobs.forEach((job) => {
    const prediction = predictRating(job.id, similarUsers, allFeedbacks);
    
    // 予測評価が0（誰も評価していない）の場合はスキップ
    if (prediction.contributingUsers === 0) {
      return;
    }
    
    // 予測評価を0-1の範囲に正規化
    const normalizedRating = (prediction.rating + 1) / 2;
    
    // 協調フィルタリングスコアを計算
    // 寄与ユーザー数も考慮（多いほどスコアが高い）
    const userCountBonus = Math.min(prediction.contributingUsers / 5, 0.2);
    const collaborativeScore = normalizedRating * 0.8 + userCountBonus;
    
    // 最終的なレコメンドスコア
    const score = Math.min(1, collaborativeScore);
    
    // 最低スコア未満は除外
    if (score < opts.minRecommendScore) {
      return;
    }
    
    recommendations.push({
      job,
      score,
      scoreBreakdown: {
        collaborativeScore,
        predictedRating: normalizedRating,
        contributingUsers: prediction.contributingUsers,
      },
      reason: generateRecommendationReason(
        prediction.contributingUsers,
        prediction.rating,
        collaborativeScore
      ),
    });
  });
  
  // スコアで降順ソート
  recommendations.sort((a, b) => {
    // スコアが同じ場合は寄与ユーザー数が多い方を優先
    if (Math.abs(b.score - a.score) < 0.001) {
      return (
        b.scoreBreakdown.contributingUsers - a.scoreBreakdown.contributingUsers
      );
    }
    return b.score - a.score;
  });
  
  // 上位N件を返す
  return recommendations.slice(0, Math.min(topN, opts.maxCandidates));
}

/**
 * ハイブリッドレコメンデーション
 * 協調フィルタリング + コンテンツベース（既存の相関分析）を組み合わせ
 */
export interface HybridRecommendationOptions extends RecommendationOptions {
  /** 協調フィルタリングの重み（0-1、デフォルト: 0.7） */
  collaborativeWeight?: number;
  
  /** コンテンツベースの重み（0-1、デフォルト: 0.3） */
  contentWeight?: number;
}

/**
 * コンテンツベーススコアの計算（簡易版）
 * 実際の実装では既存の相関分析結果を使用
 */
function calculateContentBasedScore(
  job: EnhancedJob,
  userId: string,
  feedbacks: JobFeedback[]
): number {
  // ユーザーの過去の評価を分析
  const userFeedbacks = feedbacks.filter((f) => f.userId === userId);
  
  if (userFeedbacks.length === 0) {
    return 0.5; // デフォルトスコア
  }
  
  // 簡易的な実装: likeした割合を返す
  const likeCount = userFeedbacks.filter((f) => f.feedback === 'like').length;
  const likeRate = likeCount / userFeedbacks.length;
  
  return likeRate;
}

/**
 * ハイブリッドレコメンデーション
 */
export function recommendJobsHybrid(
  userId: string,
  allJobs: EnhancedJob[],
  allFeedbacks: JobFeedback[],
  topN: number = 5,
  options: HybridRecommendationOptions = {}
): JobRecommendation[] {
  const collaborativeWeight = options.collaborativeWeight ?? 0.7;
  const contentWeight = options.contentWeight ?? 0.3;
  
  // 協調フィルタリングでレコメンド
  const collaborativeRecs = recommendJobs(
    userId,
    allJobs,
    allFeedbacks,
    topN * 2, // より多くの候補を取得
    options
  );
  
  // コンテンツベーススコアを追加して再計算
  const hybridRecs = collaborativeRecs.map((rec) => {
    const contentScore = calculateContentBasedScore(
      rec.job,
      userId,
      allFeedbacks
    );
    
    const hybridScore =
      rec.score * collaborativeWeight + contentScore * contentWeight;
    
    return {
      ...rec,
      score: hybridScore,
    };
  });
  
  // 再ソート
  hybridRecs.sort((a, b) => b.score - a.score);
  
  return hybridRecs.slice(0, topN);
}

