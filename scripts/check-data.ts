/**
 * ダミーデータの構造確認用スクリプト
 * 実際に生成されるデータの構造を確認するために使用
 */
import { enhancedJobs } from '../data/jobs';

// 最初の3件のデータを表示
console.log('=== ダミーデータの構造確認 ===\n');
console.log('総件数:', enhancedJobs.length);
console.log('\n--- 最初の求人データ ---');
console.log(JSON.stringify(enhancedJobs[0], null, 2));

console.log('\n--- 企業属性の確認 ---');
enhancedJobs.slice(0, 5).forEach((job, index) => {
  console.log(`\n求人 ${index + 1}: ${job.title}`);
  if (job.companyAttributes) {
    console.log('  企業規模:', job.companyAttributes.size);
    console.log('  成長段階:', job.companyAttributes.stage);
    console.log('  業界:', job.companyAttributes.industry);
    console.log('  ストックオプション:', job.companyAttributes.hasStockOptions ? 'あり' : 'なし');
    console.log('  企業文化:', job.companyAttributes.companyCulture.join(', '));
  } else {
    console.log('  ⚠️ 企業属性がありません');
  }
});

