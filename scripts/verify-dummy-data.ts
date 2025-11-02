/**
 * ダミーデータ検証スクリプト
 * 生成されたユーザープロファイルとフィードバックデータの品質を検証
 */
import { dummyUsers, dummyJobs, dummyFeedbacks, getDummyDataStats } from '../data/dummy-data';

console.log('='.repeat(80));
console.log('ダミーデータ検証レポート');
console.log('='.repeat(80));
console.log();

// 基本統計
const stats = getDummyDataStats();
console.log('【基本統計】');
console.log(`総ユーザー数: ${stats.totalUsers}人`);
console.log(`総求人数: ${stats.totalJobs}件`);
console.log(`総評価数: ${stats.totalFeedbacks}件`);
console.log(`平均評価数/人: ${stats.avgFeedbacksPerUser}件`);
console.log(`Like数: ${stats.likeCount}件`);
console.log(`Dislike数: ${stats.dislikeCount}件`);
console.log(`Like率: ${stats.likeRate}%`);
console.log();

// ユーザープロファイル分析
console.log('【ユーザープロファイル分析】');

// 経験レベルの分布
const levelCounts = dummyUsers.reduce((acc, user) => {
  acc[user.experienceLevel] = (acc[user.experienceLevel] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n経験レベルの分布:');
Object.entries(levelCounts).forEach(([level, count]) => {
  const percentage = ((count / dummyUsers.length) * 100).toFixed(1);
  console.log(`  ${level}: ${count}人 (${percentage}%)`);
});

// 興味分野の分布
const interestCounts: Record<string, number> = {};
dummyUsers.forEach((user) => {
  user.interestAreas.forEach((area) => {
    interestCounts[area] = (interestCounts[area] || 0) + 1;
  });
});

console.log('\n興味分野の分布（上位10件）:');
Object.entries(interestCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([area, count]) => {
    console.log(`  ${area}: ${count}人`);
  });

// 給与期待値の統計
const salaryMins = dummyUsers.map((u) => u.salaryExpectationMin);
const salaryMaxs = dummyUsers.map((u) => u.salaryExpectationMax);

console.log('\n給与期待値の統計:');
console.log(`  最低給与の平均: ${Math.round(salaryMins.reduce((a, b) => a + b) / salaryMins.length)}万円`);
console.log(`  最高給与の平均: ${Math.round(salaryMaxs.reduce((a, b) => a + b) / salaryMaxs.length)}万円`);
console.log(`  最低給与の範囲: ${Math.min(...salaryMins)}万円 〜 ${Math.max(...salaryMins)}万円`);
console.log(`  最高給与の範囲: ${Math.min(...salaryMaxs)}万円 〜 ${Math.max(...salaryMaxs)}万円`);

// フィードバックデータ分析
console.log('\n【フィードバックデータ分析】');

// ユーザーごとの評価数分布
const feedbackCountsByUser = dummyFeedbacks.reduce((acc, fb) => {
  acc[fb.userId] = (acc[fb.userId] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const feedbackCounts = Object.values(feedbackCountsByUser);
const avgFeedbacks = feedbackCounts.reduce((a, b) => a + b, 0) / feedbackCounts.length;
const minFeedbacks = Math.min(...feedbackCounts);
const maxFeedbacks = Math.max(...feedbackCounts);

console.log('\nユーザーごとの評価数:');
console.log(`  平均: ${avgFeedbacks.toFixed(1)}件`);
console.log(`  最小: ${minFeedbacks}件`);
console.log(`  最大: ${maxFeedbacks}件`);

// 評価数の分布
const feedbackDistribution: Record<string, number> = {
  '5-10件': 0,
  '11-15件': 0,
  '16-20件': 0,
  '21-25件': 0,
  '26-30件': 0,
};

Object.values(feedbackCountsByUser).forEach((count) => {
  if (count <= 10) feedbackDistribution['5-10件']++;
  else if (count <= 15) feedbackDistribution['11-15件']++;
  else if (count <= 20) feedbackDistribution['16-20件']++;
  else if (count <= 25) feedbackDistribution['21-25件']++;
  else feedbackDistribution['26-30件']++;
});

console.log('\n評価数分布:');
Object.entries(feedbackDistribution).forEach(([range, count]) => {
  console.log(`  ${range}: ${count}人`);
});

// ユーザーごとのLike率
const userLikeRates = dummyUsers.map((user) => {
  const userFeedbacks = dummyFeedbacks.filter((fb) => fb.userId === user.id);
  const likes = userFeedbacks.filter((fb) => fb.feedback === 'like').length;
  return likes / userFeedbacks.length;
});

const avgLikeRate = (userLikeRates.reduce((a, b) => a + b, 0) / userLikeRates.length) * 100;
const minLikeRate = Math.min(...userLikeRates) * 100;
const maxLikeRate = Math.max(...userLikeRates) * 100;

console.log('\nユーザーごとのLike率:');
console.log(`  平均: ${avgLikeRate.toFixed(1)}%`);
console.log(`  最小: ${minLikeRate.toFixed(1)}%`);
console.log(`  最大: ${maxLikeRate.toFixed(1)}%`);

// 求人ごとの評価数
const jobFeedbackCounts = dummyFeedbacks.reduce((acc, fb) => {
  acc[fb.jobId] = (acc[fb.jobId] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const jobCounts = Object.values(jobFeedbackCounts);
const avgJobFeedbacks = jobCounts.reduce((a, b) => a + b, 0) / jobCounts.length;
const evaluatedJobs = Object.keys(jobFeedbackCounts).length;
const unevaluatedJobs = dummyJobs.length - evaluatedJobs;

console.log('\n求人ごとの評価数:');
console.log(`  評価済み求人数: ${evaluatedJobs}件`);
console.log(`  未評価求人数: ${unevaluatedJobs}件`);
console.log(`  平均評価数/求人: ${avgJobFeedbacks.toFixed(1)}件`);

// データ品質チェック
console.log('\n【データ品質チェック】');

let hasErrors = false;

// チェック1: すべてのユーザーが評価を持っているか
const usersWithoutFeedback = dummyUsers.filter(
  (user) => !dummyFeedbacks.some((fb) => fb.userId === user.id)
);

if (usersWithoutFeedback.length > 0) {
  console.log(`❌ 評価がないユーザーが${usersWithoutFeedback.length}人います`);
  hasErrors = true;
} else {
  console.log('✅ すべてのユーザーが評価を持っています');
}

// チェック2: フィードバックの求人IDが有効か
const invalidJobFeedbacks = dummyFeedbacks.filter(
  (fb) => !dummyJobs.some((job) => job.id === fb.jobId)
);

if (invalidJobFeedbacks.length > 0) {
  console.log(`❌ 無効な求人IDを参照しているフィードバックが${invalidJobFeedbacks.length}件あります`);
  hasErrors = true;
} else {
  console.log('✅ すべてのフィードバックが有効な求人IDを参照しています');
}

// チェック3: ユーザーIDの一意性
const userIds = dummyUsers.map((u) => u.id);
const uniqueUserIds = new Set(userIds);

if (userIds.length !== uniqueUserIds.size) {
  console.log('❌ ユーザーIDに重複があります');
  hasErrors = true;
} else {
  console.log('✅ ユーザーIDは一意です');
}

// チェック4: 求人IDの一意性
const jobIds = dummyJobs.map((j) => j.id);
const uniqueJobIds = new Set(jobIds);

if (jobIds.length !== uniqueJobIds.size) {
  console.log('❌ 求人IDに重複があります');
  hasErrors = true;
} else {
  console.log('✅ 求人IDは一意です');
}

// チェック5: 評価の多様性（ユーザーが同じ求人を複数回評価していないか）
const duplicateFeedbacks = dummyFeedbacks.reduce((acc, fb, index) => {
  const duplicate = dummyFeedbacks.findIndex(
    (f, i) => i !== index && f.userId === fb.userId && f.jobId === fb.jobId
  );
  if (duplicate !== -1) {
    acc++;
  }
  return acc;
}, 0);

if (duplicateFeedbacks > 0) {
  console.log(`❌ 重複した評価が${duplicateFeedbacks}件あります`);
  hasErrors = true;
} else {
  console.log('✅ 評価に重複はありません');
}

console.log();
console.log('='.repeat(80));

if (hasErrors) {
  console.log('❌ データに問題が見つかりました');
  process.exit(1);
} else {
  console.log('✅ すべてのチェックに合格しました！');
  console.log('ダミーデータは正常に生成されています。');
}

console.log('='.repeat(80));

