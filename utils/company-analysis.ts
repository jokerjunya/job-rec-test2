/**
 * 企業属性軸の分析ロジック
 */
import type { EnhancedJob } from '@/types/job';
import type { FeatureExtractor } from '@/utils/analysis';

/**
 * 企業規模の特徴量抽出
 */
export const extractCompanySize: FeatureExtractor = (job) => {
  return job.companyAttributes?.size || null;
};

/**
 * 企業の成長段階の特徴量抽出
 */
export const extractCompanyStage: FeatureExtractor = (job) => {
  return job.companyAttributes?.stage || null;
};

/**
 * 成長企業かどうかの特徴量抽出（early/growth = true, mature/public = false）
 */
export const extractIsGrowingCompany: FeatureExtractor = (job) => {
  const stage = job.companyAttributes?.stage;
  if (!stage) return null;
  return stage === 'early' || stage === 'growth';
};

/**
 * 成熟企業かどうかの特徴量抽出（mature/public = true, early/growth = false）
 */
export const extractIsMatureCompany: FeatureExtractor = (job) => {
  const stage = job.companyAttributes?.stage;
  if (!stage) return null;
  return stage === 'mature' || stage === 'public';
};

/**
 * 企業規模の数値化（startup=1, small=2, medium=3, large=4, enterprise=5）
 */
export const extractCompanySizeNumeric: FeatureExtractor = (job) => {
  const size = job.companyAttributes?.size;
  if (!size) return null;

  const sizeMap: Record<string, number> = {
    startup: 1,
    small: 2,
    medium: 3,
    large: 4,
    enterprise: 5,
  };

  return sizeMap[size] || null;
};

/**
 * ストックオプションの有無
 */
export const extractHasStockOptions: FeatureExtractor = (job) => {
  return job.companyAttributes?.hasStockOptions ?? null;
};

/**
 * 業界の特徴量抽出
 */
export const extractIndustry: FeatureExtractor = (job) => {
  return job.companyAttributes?.industry || null;
};

/**
 * 企業属性軸の分析設定
 */
export const companyAttributesExtractors = [
  {
    extractor: extractIsGrowingCompany,
    name: '成長企業',
    category: '企業属性',
  },
  {
    extractor: extractIsMatureCompany,
    name: '成熟企業',
    category: '企業属性',
  },
  {
    extractor: extractCompanySize,
    name: '企業規模',
    category: '企業属性',
  },
  {
    extractor: extractCompanyStage,
    name: '成長段階',
    category: '企業属性',
  },
  {
    extractor: extractHasStockOptions,
    name: 'ストックオプション',
    category: '企業属性',
  },
  {
    extractor: extractIndustry,
    name: '業界',
    category: '企業属性',
  },
];

