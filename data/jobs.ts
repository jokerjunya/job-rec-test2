import type { EnhancedJob, WorkType } from '@/types/job';
import { generateCompanyAttributes } from './generators/company-attributes';
import { getRandomElement, getRandomElements, randomInt } from './generators/utils';
import { jobSkillsMapping } from './generators/mappings';

/**
 * ダミーデータの配列
 */
const jobTitles = [
  // エンジニア系
  'フロントエンドエンジニア',
  'バックエンドエンジニア',
  'フルスタックエンジニア',
  'モバイルアプリエンジニア',
  'データエンジニア',
  '機械学習エンジニア',
  'DevOpsエンジニア',
  'インフラエンジニア',
  'セキュリティエンジニア',
  'QAエンジニア',
  'SREエンジニア',
  'クラウドエンジニア',
  'テストエンジニア',
  'エンベデッドエンジニア',
  'ゲームエンジニア',
  'ブロックチェーンエンジニア',
  // マネジメント系
  'プロダクトマネージャー',
  'プロジェクトマネージャー',
  'テックリード',
  'エンジニアリングマネージャー',
  'スクラムマスター',
  // デザイナー系
  'UI/UXデザイナー',
  'グラフィックデザイナー',
  'Webデザイナー',
  'プロダクトデザイナー',
  'モーションデザイナー',
  'ブランディングデザイナー',
  // マーケティング・営業系
  'マーケター',
  'デジタルマーケター',
  'コンテンツマーケター',
  'SEOマーケター',
  'セールスエンジニア',
  '営業マネージャー',
  'アカウントエグゼクティブ',
  // カスタマー・サポート系
  'カスタマーサクセス',
  'カスタマーサポート',
  'カスタマーエクスペリエンス',
  // データ・分析系
  'データアナリスト',
  'ビジネスアナリスト',
  'データサイエンティスト',
  'BIアナリスト',
  // コンサル・専門職
  'コンサルタント',
  'ビジネスコンサルタント',
  'ITコンサルタント',
  '経営企画',
  '財務・経理',
  '人事・採用',
  '法務',
  'コンプライアンス',
  // その他
  'オペレーション',
  'サプライチェーン',
  '調達',
  '広報',
  'カスタマーリレーション',
];

const companies = [
  'テックイノベーション株式会社',
  'デジタルクリエイティブ株式会社',
  'フィンテックソリューションズ',
  'ECマーケットプレイス株式会社',
  'ゲームスタジオXYZ',
  'クラウドソフトウェア株式会社',
  'コンサルティングパートナーズ',
  'メディアプロダクション株式会社',
  'エデュテックラボ',
  'ヘルスケアテクノロジー株式会社',
  '自動車開発株式会社',
  '精密工業株式会社',
  '東京金融グループ',
  '日本保険サービス株式会社',
  '都市開発不動産株式会社',
  'リテールチェーン株式会社',
  'ロジスティクスジャパン',
  'トラベルサービス株式会社',
  'レストラングループ株式会社',
  '人材開発株式会社',
];

const locations = [
  '東京都',
  '大阪府',
  '神奈川県',
  '愛知県',
  '福岡県',
  '埼玉県',
  '千葉県',
  '兵庫県',
  '京都府',
  '北海道',
  'リモート',
  'ハイブリッド',
];

const skills = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'GraphQL',
  'REST API',
  'Git',
  'CI/CD',
  'Terraform',
  'Ansible',
  'Linux',
  '機械学習',
  'データ分析',
  'UI/UXデザイン',
  'Figma',
];

const workTypes: WorkType[] = ['full-time', 'part-time', 'contract', 'remote', 'hybrid'];

const descriptions = [
  '最新技術を活用したプロダクト開発に携わっていただきます。チーム開発を重視し、コードレビューや技術共有を積極的に行っています。',
  'スタートアップの急成長を支えるエンジニアを募集しています。少人数チームで裁量を持って開発に取り組めます。',
  '大規模システムの設計・開発に携わっていただきます。技術的な課題解決やパフォーマンス改善にチャレンジできます。',
  'ユーザーに愛されるプロダクトを作るため、デザインとエンジニアリングの両面から貢献していただきます。',
  'データドリブンな意思決定をサポートする分析基盤の構築に携わっていただきます。',
  'セキュアなシステム構築とセキュリティ監査に携わっていただきます。最新のセキュリティ技術を学べる環境です。',
  'クラウドインフラの設計・構築・運用に携わっていただきます。DevOpsの実践的な経験を積めます。',
  'ユーザー体験を向上させるデザインを創造していただきます。データに基づいたデザイン改善に取り組めます。',
  'プロダクトの成長戦略を立案・実行していただきます。ユーザーインサイトを活用したプロダクト開発に携わります。',
  '顧客との対話を通じて、プロダクトの価値を最大化していただきます。',
];

/**
 * ランダムな日付を生成（過去30日以内）
 */
function randomDate(): string {
  const now = new Date();
  const daysAgo = randomInt(0, 30);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * 開始日の日付を生成（今日から30日後～90日後）
 */
function randomStartDate(): string {
  const now = new Date();
  const daysAfter = randomInt(30, 90);
  const date = new Date(now);
  date.setDate(date.getDate() + daysAfter);
  return date.toISOString().split('T')[0];
}

/**
 * 給与の範囲を生成
 */
function generateSalary(): { min: number; max: number; currency: string } {
  const salaryRanges = [
    { min: 300, max: 450, currency: '万円' },
    { min: 400, max: 600, currency: '万円' },
    { min: 500, max: 700, currency: '万円' },
    { min: 600, max: 900, currency: '万円' },
    { min: 700, max: 1000, currency: '万円' },
    { min: 800, max: 1200, currency: '万円' },
    { min: 1000, max: 1500, currency: '万円' },
  ];
  return getRandomElement(salaryRanges);
}

/**
 * 必要なスキルを職種に応じて生成（3-7個）
 * 職種に関連するスキルを優先的に選択
 */
function generateRequiredSkills(jobTitle: string): string[] {
  const count = randomInt(3, 7);
  const relevantSkills = jobSkillsMapping[jobTitle] || [];
  
  if (relevantSkills.length === 0) {
    // マッピングがない場合は完全にランダム
    return getRandomElements(skills, count);
  }
  
  // 関連スキルから2-5個選択
  const relevantCount = Math.min(randomInt(2, Math.min(5, relevantSkills.length)), count);
  const selectedRelevantSkills = getRandomElements(relevantSkills, relevantCount);
  
  // 残りのスキル数を計算
  const remainingCount = count - relevantCount;
  
  if (remainingCount <= 0) {
    return selectedRelevantSkills;
  }
  
  // 関連スキル以外から残りを選択
  const otherSkills = skills.filter((s) => !relevantSkills.includes(s));
  const selectedOtherSkills = getRandomElements(otherSkills, remainingCount);
  
  return [...selectedRelevantSkills, ...selectedOtherSkills];
}

/**
 * 拡張された求人データを生成
 * 職種とスキル、企業と業界の関連性を考慮
 */
function generateEnhancedJob(index: number): EnhancedJob {
  const title = getRandomElement(jobTitles);
  const company = getRandomElement(companies);
  
  return {
    id: `job-${String(index + 1).padStart(3, '0')}`,
    title,
    company,
    salary: generateSalary(),
    location: getRandomElement(locations),
    description: getRandomElement(descriptions),
    requiredSkills: generateRequiredSkills(title),
    workType: getRandomElement(workTypes),
    startDate: randomStartDate(),
    postedDate: randomDate(),
    // 企業属性を追加（企業名を考慮）
    companyAttributes: generateCompanyAttributes(company),
  };
}

/**
 * 約100件の拡張された求人ダミーデータを生成
 */
export function generateEnhancedJobs(): EnhancedJob[] {
  const jobCount = 100;
  return Array.from({ length: jobCount }, (_, index) => generateEnhancedJob(index));
}

/**
 * 事前生成された拡張求人データ（パフォーマンス最適化のため）
 */
export const enhancedJobs: EnhancedJob[] = generateEnhancedJobs();

/**
 * 後方互換性のため、jobsとしてもエクスポート
 * @deprecated EnhancedJobを使用することを推奨
 */
export const jobs: EnhancedJob[] = enhancedJobs;

