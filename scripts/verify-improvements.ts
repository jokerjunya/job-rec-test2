/**
 * 改善内容の検証スクリプト
 */
import { enhancedJobs } from '../data/jobs';
import { jobSkillsMapping } from '../data/generators/mappings';

console.log('=== データ品質向上の検証 ===\n');

// 1. フロントエンドエンジニアの求人でスキルマッピングを確認
const frontendJobs = enhancedJobs.filter(
  (job) => job.title === 'フロントエンドエンジニア'
).slice(0, 3);

console.log('【1. 職種とスキルのマッピング検証】');
console.log('フロントエンドエンジニアの求人:\n');
frontendJobs.forEach((job, idx) => {
  console.log(`求人 ${idx + 1}: ${job.id}`);
  console.log(`  企業: ${job.company}`);
  console.log(`  必要スキル: ${job.requiredSkills.join(', ')}`);

  const relevantSkills = jobSkillsMapping['フロントエンドエンジニア'] || [];
  const hasRelevant = job.requiredSkills.filter((s) =>
    relevantSkills.includes(s)
  );
  console.log(`  関連スキル: ${hasRelevant.join(', ')} (${hasRelevant.length}/${job.requiredSkills.length})`);
  console.log();
});

// 2. 企業と業界のマッピングを確認
console.log('【2. 企業と業界の関連性検証】');
const targetCompany = 'フィンテックソリューションズ';
const fintechJobs = enhancedJobs.filter((job) => job.company === targetCompany);

console.log(`${targetCompany}の求人:\n`);
fintechJobs.slice(0, 5).forEach((job, idx) => {
  console.log(`求人 ${idx + 1}: ${job.title}`);
  console.log(`  業界: ${job.companyAttributes?.industry}`);
});

// 業界の分布を計算
const industryCount = new Map<string, number>();
fintechJobs.forEach((job) => {
  const industry = job.companyAttributes?.industry || '不明';
  industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
});

console.log(`\n業界分布:`);
industryCount.forEach((count, industry) => {
  const percentage = ((count / fintechJobs.length) * 100).toFixed(1);
  console.log(`  ${industry}: ${count}件 (${percentage}%)`);
});

// 3. パフォーマンステスト
console.log('\n【3. パフォーマンス検証】');
console.log('Fisher-Yatesシャッフルの均等性テスト:\n');

import { fisherYatesShuffle } from '../data/generators/utils';

const testArray = [1, 2, 3, 4, 5];
const firstPositions = new Map<number, number>();

// 10000回シャッフルして最初の位置の分布を確認
const iterations = 10000;
for (let i = 0; i < iterations; i++) {
  const shuffled = fisherYatesShuffle(testArray);
  const first = shuffled[0];
  firstPositions.set(first, (firstPositions.get(first) || 0) + 1);
}

console.log(`${iterations}回のシャッフルで最初の位置に来た回数:`);
firstPositions.forEach((count, num) => {
  const percentage = ((count / iterations) * 100).toFixed(1);
  const expected = (100 / testArray.length).toFixed(1);
  console.log(
    `  ${num}: ${count}回 (${percentage}%, 期待値: ${expected}%)`
  );
});

// 4. データ統計
console.log('\n【4. データ全体の統計】');
console.log(`総求人数: ${enhancedJobs.length}`);

// 職種の多様性
const titleCount = new Set(enhancedJobs.map((j) => j.title)).size;
console.log(`職種の種類: ${titleCount}`);

// 企業の多様性
const companyCount = new Set(enhancedJobs.map((j) => j.company)).size;
console.log(`企業の種類: ${companyCount}`);

// スキルの多様性
const allSkills = new Set<string>();
enhancedJobs.forEach((job) => job.requiredSkills.forEach((s) => allSkills.add(s)));
console.log(`使用されているスキルの種類: ${allSkills.size}`);

// 業界の多様性
const allIndustries = new Set(
  enhancedJobs.map((j) => j.companyAttributes?.industry).filter((i) => i)
);
console.log(`業界の種類: ${allIndustries.size}`);

console.log('\n=== 検証完了 ===');

