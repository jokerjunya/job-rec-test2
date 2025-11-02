/**
 * ユーザープロファイルの型定義
 * レコメンドシステムで使用するユーザー特性データ
 */

/**
 * ユーザーの経験レベル
 */
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'expert';

/**
 * ユーザーの希望する働き方
 */
export type PreferredWorkType = 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';

/**
 * ユーザーの興味分野
 */
export type InterestArea =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'ai-ml'
  | 'data'
  | 'devops'
  | 'security'
  | 'design'
  | 'product'
  | 'marketing'
  | 'sales';

/**
 * ユーザーの企業規模の好み
 */
export type CompanySizePreference = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

/**
 * ユーザープロファイル
 * ダミーデータ生成とレコメンデーションで使用
 */
export interface UserProfile {
  /** ユーザーID */
  id: string;
  
  /** ユーザー名 */
  name: string;
  
  /** 経験レベル */
  experienceLevel: ExperienceLevel;
  
  /** 経験年数 */
  yearsOfExperience: number;
  
  /** 興味分野（複数可） */
  interestAreas: InterestArea[];
  
  /** スキルセット */
  skills: string[];
  
  /** 希望する働き方 */
  preferredWorkTypes: PreferredWorkType[];
  
  /** 希望する企業規模 */
  companySizePreferences: CompanySizePreference[];
  
  /** 希望給与レンジ（最低） */
  salaryExpectationMin: number;
  
  /** 希望給与レンジ（最高） */
  salaryExpectationMax: number;
  
  /** リモートワークの重要度（0-1） */
  remoteWorkImportance: number;
  
  /** ワークライフバランスの重要度（0-1） */
  workLifeBalanceImportance: number;
  
  /** 成長機会の重要度（0-1） */
  growthOpportunityImportance: number;
  
  /** 福利厚生の重要度（0-1） */
  benefitsImportance: number;
  
  /** 作成日時 */
  createdAt: string;
}

/**
 * ユーザーフィードバックの統計情報
 */
export interface UserFeedbackStats {
  /** ユーザーID */
  userId: string;
  
  /** 総フィードバック数 */
  totalFeedbacks: number;
  
  /** Like数 */
  likeCount: number;
  
  /** Dislike数 */
  dislikeCount: number;
  
  /** Like率 */
  likeRate: number;
  
  /** 評価した求人ID一覧 */
  evaluatedJobIds: string[];
}

