/**
 * 企業属性に関する型定義
 */

/**
 * 企業規模
 */
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

/**
 * 企業の成長段階
 */
export type CompanyStage = 'early' | 'growth' | 'mature' | 'public';

/**
 * 企業属性のインターフェース
 */
export interface CompanyAttributes {
  /** 企業規模 */
  size: CompanySize;
  /** 企業の成長段階 */
  stage: CompanyStage;
  /** 業界 */
  industry: string;
  /** ストックオプションの有無 */
  hasStockOptions: boolean;
  /** 企業文化の特徴 */
  companyCulture: string[];
}

