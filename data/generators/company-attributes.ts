/**
 * 企業属性のデータ生成ロジック
 */
import type { CompanyAttributes, CompanySize, CompanyStage } from '@/types/company-attributes';
import { getRandomElement, getRandomElements } from './utils';
import { companyIndustryMapping } from './mappings';

/**
 * 業界のリスト
 */
const industries = [
  'IT・ソフトウェア',
  'インターネット・EC',
  '金融・FinTech',
  'ゲーム',
  'コンサルティング',
  'メディア・広告',
  '教育・EdTech',
  'ヘルスケア・医療',
  '自動車・製造',
  '精密工業',
  '不動産',
  '小売・EC',
  '物流・運輸',
  '旅行・観光',
  '飲食・外食',
  '人材・HRTech',
  '広告・マーケティング',
  'セキュリティ',
  'ブロックチェーン',
  'AI・機械学習',
];

/**
 * 企業文化の特徴のリスト
 */
const companyCultures = [
  'フラットな組織',
  'チームワーク重視',
  '個人の裁量を尊重',
  '技術力重視',
  '成果主義',
  'ワークライフバランス重視',
  '多様性を尊重',
  'イノベーション志向',
  'オープンなコミュニケーション',
  'リモートワーク推進',
  'アジャイル開発',
  'コードレビュー重視',
  '技術共有が活発',
  '学習機会が多い',
  'スタートアップ文化',
];

/**
 * 企業規模を生成
 */
function generateCompanySize(): CompanySize {
  const sizes: CompanySize[] = ['startup', 'small', 'medium', 'large', 'enterprise'];
  return getRandomElement(sizes);
}

/**
 * 企業の成長段階を生成
 * 企業規模とある程度相関させる
 */
function generateCompanyStage(size: CompanySize): CompanyStage {
  const stageMap: Record<CompanySize, CompanyStage[]> = {
    startup: ['early', 'growth'],
    small: ['early', 'growth'],
    medium: ['growth', 'mature'],
    large: ['mature', 'public'],
    enterprise: ['mature', 'public'],
  };

  const possibleStages = stageMap[size];
  return getRandomElement(possibleStages);
}

/**
 * ストックオプションの有無を生成
 * スタートアップや成長期の企業で高確率
 */
function generateHasStockOptions(stage: CompanyStage): boolean {
  const probabilityMap: Record<CompanyStage, number> = {
    early: 0.8, // 80%の確率
    growth: 0.6, // 60%の確率
    mature: 0.2, // 20%の確率
    public: 0.1, // 10%の確率（上場後は稀）
  };

  const probability = probabilityMap[stage];
  return Math.random() < probability;
}

/**
 * 企業文化の特徴を生成（1-4個）
 */
function generateCompanyCulture(): string[] {
  const count = Math.floor(Math.random() * 4) + 1; // 1-4個
  return getRandomElements(companyCultures, count);
}

/**
 * 企業名から業界を生成（マッピングに基づく）
 */
function generateIndustryForCompany(companyName: string): string {
  const possibleIndustries = companyIndustryMapping[companyName];
  if (possibleIndustries && possibleIndustries.length > 0) {
    return getRandomElement(possibleIndustries);
  }
  // マッピングにない場合はランダム
  return getRandomElement(industries);
}

/**
 * 企業属性を生成（企業名を考慮）
 */
export function generateCompanyAttributes(companyName?: string): CompanyAttributes {
  const size = generateCompanySize();
  const stage = generateCompanyStage(size);

  return {
    size,
    stage,
    industry: companyName ? generateIndustryForCompany(companyName) : getRandomElement(industries),
    hasStockOptions: generateHasStockOptions(stage),
    companyCulture: generateCompanyCulture(),
  };
}

