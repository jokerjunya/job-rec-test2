/**
 * ダミーユーザープロファイル生成器
 */
import type {
  UserProfile,
  ExperienceLevel,
  InterestArea,
  PreferredWorkType,
  CompanySizePreference,
} from '@/types/user-profile';
import { getRandomElement, getRandomElements, randomInt } from './utils';

/**
 * 日本人らしい名前のリスト
 */
const firstNames = [
  '太郎', '次郎', '三郎', '花子', '美咲', '翔太', '大輝', '陽菜', '結衣',
  '颯太', '蓮', '陽向', '葵', '凛', '湊', '悠人', '陸', '咲良', '心春',
  '紬', '芽依', '琴音', '莉子', '杏', '樹', '隼人', '優斗', '海翔', '颯',
  '愛莉', '美羽', '彩花', '優奈', '凪',
];

const lastNames = [
  '佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林',
  '加藤', '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林',
  '斎藤', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川', '前田',
  '藤田', '後藤', '長谷川', '村上', '近藤', '石井', '坂本', '遠藤',
];

/**
 * 経験レベルごとの経験年数範囲
 */
const experienceLevelRanges: Record<ExperienceLevel, { min: number; max: number }> = {
  junior: { min: 0, max: 2 },
  mid: { min: 2, max: 5 },
  senior: { min: 5, max: 10 },
  expert: { min: 10, max: 20 },
};

/**
 * 興味分野ごとの典型的なスキル
 */
const interestAreaSkills: Record<InterestArea, string[]> = {
  frontend: ['React', 'Vue.js', 'TypeScript', 'Next.js', 'CSS', 'HTML', 'Tailwind CSS'],
  backend: ['Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB', 'REST API'],
  fullstack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
  mobile: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS', 'Android'],
  'ai-ml': ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', '機械学習', 'データ分析'],
  data: ['Python', 'SQL', 'BigQuery', 'Tableau', 'データ分析', 'ETL'],
  devops: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
  security: ['セキュリティ', 'ペネトレーションテスト', '脆弱性診断', '暗号化'],
  design: ['Figma', 'Adobe XD', 'Sketch', 'UI/UX', 'デザイン思考'],
  product: ['プロダクトマネジメント', 'アジャイル', 'Scrum', 'ユーザーリサーチ'],
  marketing: ['デジタルマーケティング', 'SEO', 'SEM', 'Google Analytics', 'SNS'],
  sales: ['営業', 'プレゼンテーション', 'Salesforce', '提案力', '交渉力'],
};

/**
 * 経験レベルごとの給与レンジ（万円）
 */
const salaryRanges: Record<ExperienceLevel, { min: number; max: number }> = {
  junior: { min: 300, max: 500 },
  mid: { min: 450, max: 700 },
  senior: { min: 650, max: 1000 },
  expert: { min: 900, max: 1500 },
};

/**
 * ランダムなユーザー名を生成
 */
function generateUserName(): string {
  const lastName = getRandomElement(lastNames);
  const firstName = getRandomElement(firstNames);
  return `${lastName} ${firstName}`;
}

/**
 * 経験レベルに基づいた経験年数を生成
 */
function generateYearsOfExperience(level: ExperienceLevel): number {
  const range = experienceLevelRanges[level];
  return randomInt(range.min, range.max);
}

/**
 * 興味分野に基づいたスキルセットを生成
 */
function generateSkills(interests: InterestArea[]): string[] {
  const skills = new Set<string>();
  
  // 各興味分野から3-5個のスキルを選択
  interests.forEach((interest) => {
    const areaSkills = interestAreaSkills[interest];
    const selectedSkills = getRandomElements(areaSkills, randomInt(3, 5));
    selectedSkills.forEach((skill) => skills.add(skill));
  });
  
  return Array.from(skills);
}

/**
 * 経験レベルに基づいた給与期待値を生成
 */
function generateSalaryExpectation(level: ExperienceLevel): {
  min: number;
  max: number;
} {
  const range = salaryRanges[level];
  const variation = 50; // ±50万円の変動
  
  const min = range.min + randomInt(-variation, variation);
  const max = range.max + randomInt(-variation, variation);
  
  return {
    min: Math.max(250, min), // 最低250万円
    max: Math.max(min + 100, max), // 最低でもminより100万円高い
  };
}

/**
 * 重要度スコアを生成（0-1の範囲でランダム）
 */
function generateImportanceScore(): number {
  // 0.3から1.0の範囲で生成（あまり低い値は非現実的）
  return Math.round((0.3 + Math.random() * 0.7) * 100) / 100;
}

/**
 * ユーザープロファイルを1つ生成
 */
export function generateUserProfile(id: string): UserProfile {
  // 経験レベルをランダムに選択（実際のデータに近い分布）
  const experienceLevelWeights: ExperienceLevel[] = [
    'junior', 'junior', 'junior', // 30%
    'mid', 'mid', 'mid', 'mid', // 40%
    'senior', 'senior', // 20%
    'expert', // 10%
  ];
  const experienceLevel = getRandomElement(experienceLevelWeights);
  
  // 興味分野を1-3個選択
  const allInterestAreas: InterestArea[] = [
    'frontend', 'backend', 'fullstack', 'mobile', 'ai-ml', 'data',
    'devops', 'security', 'design', 'product', 'marketing', 'sales',
  ];
  const interestAreas = getRandomElements(allInterestAreas, randomInt(1, 3));
  
  // スキルを生成
  const skills = generateSkills(interestAreas);
  
  // 希望する働き方（1-3個）
  const allWorkTypes: PreferredWorkType[] = [
    'full-time', 'part-time', 'contract', 'remote', 'hybrid',
  ];
  const preferredWorkTypes = getRandomElements(allWorkTypes, randomInt(1, 3));
  
  // 企業規模の好み（1-3個）
  const allCompanySizes: CompanySizePreference[] = [
    'startup', 'small', 'medium', 'large', 'enterprise',
  ];
  const companySizePreferences = getRandomElements(allCompanySizes, randomInt(1, 3));
  
  // 給与期待値
  const salaryExpectation = generateSalaryExpectation(experienceLevel);
  
  return {
    id,
    name: generateUserName(),
    experienceLevel,
    yearsOfExperience: generateYearsOfExperience(experienceLevel),
    interestAreas,
    skills,
    preferredWorkTypes,
    companySizePreferences,
    salaryExpectationMin: salaryExpectation.min,
    salaryExpectationMax: salaryExpectation.max,
    remoteWorkImportance: generateImportanceScore(),
    workLifeBalanceImportance: generateImportanceScore(),
    growthOpportunityImportance: generateImportanceScore(),
    benefitsImportance: generateImportanceScore(),
    createdAt: new Date(
      Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)
    ).toISOString(), // 過去1年間のランダムな日時
  };
}

/**
 * 複数のユーザープロファイルを生成
 */
export function generateUserProfiles(count: number): UserProfile[] {
  const profiles: UserProfile[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `user_${String(i + 1).padStart(3, '0')}`;
    profiles.push(generateUserProfile(id));
  }
  
  return profiles;
}

/**
 * デフォルトの35人のユーザープロファイルを生成
 */
export const dummyUserProfiles = generateUserProfiles(35);

