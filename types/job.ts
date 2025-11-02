/**
 * 求人データの型定義
 */
import type { CompanyAttributes } from './company-attributes';

export type WorkType = 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';

/**
 * 基本的な求人データの型定義
 */
export interface Job {
  id: string;
  title: string;
  company: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  description: string;
  requiredSkills: string[];
  workType: WorkType;
  startDate: string;
  postedDate: string;
}

/**
 * 拡張された求人データの型定義
 * 各軸の属性を段階的に追加していく
 */
export interface EnhancedJob extends Job {
  /** 企業属性 */
  companyAttributes?: CompanyAttributes;
  // 将来的に他の軸を追加:
  // roleDetails?: RoleDetails;
  // techDetails?: TechDetails;
  // ...
}

export type FeedbackType = 'like' | 'dislike';

export interface JobFeedback {
  jobId: string;
  userId: string;
  feedback: FeedbackType;
  timestamp: string;
}

