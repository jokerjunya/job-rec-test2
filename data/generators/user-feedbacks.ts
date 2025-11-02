/**
 * ダミーユーザーフィードバック生成器
 * リアルなユーザー行動パターンを再現
 */
import type { JobFeedback, EnhancedJob } from '@/types/job';
import type { UserProfile } from '@/types/user-profile';
import { randomInt } from './utils';

/**
 * 求人とユーザープロファイルのマッチ度を計算（0-1）
 * この値が高いほどユーザーがLikeする確率が高くなる
 */
function calculateJobMatchScore(job: EnhancedJob, profile: UserProfile): number {
  let score = 0;
  let totalWeight = 0;
  
  // 1. スキルマッチ（重み: 0.3）
  const skillWeight = 0.3;
  const matchingSkills = job.requiredSkills.filter((skill) =>
    profile.skills.some((userSkill) =>
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  ).length;
  const skillMatchRate = job.requiredSkills.length > 0
    ? matchingSkills / job.requiredSkills.length
    : 0.5;
  score += skillMatchRate * skillWeight;
  totalWeight += skillWeight;
  
  // 2. 給与マッチ（重み: 0.25）
  const salaryWeight = 0.25;
  const jobAvgSalary = (job.salary.min + job.salary.max) / 2;
  const userAvgExpectation = (profile.salaryExpectationMin + profile.salaryExpectationMax) / 2;
  
  // 給与が期待値の80%以上ならポジティブ
  const salaryMatchRate = jobAvgSalary >= userAvgExpectation * 0.8 ? 1 : 0.5;
  score += salaryMatchRate * salaryWeight;
  totalWeight += salaryWeight;
  
  // 3. 働き方マッチ（重み: 0.2）
  const workTypeWeight = 0.2 * profile.remoteWorkImportance;
  const workTypeMatch = profile.preferredWorkTypes.includes(job.workType);
  score += (workTypeMatch ? 1 : 0.3) * workTypeWeight;
  totalWeight += workTypeWeight;
  
  // 4. 企業属性マッチ（重み: 0.15）
  if (job.companyAttributes) {
    const companyWeight = 0.15;
    let companyScore = 0;
    
    // 企業規模マッチ
    const companySizeMatch = profile.companySizePreferences.includes(
      job.companyAttributes.size
    );
    companyScore += companySizeMatch ? 1 : 0.3;
    
    // 成長段階マッチ（早期/成長期を好む傾向を成長機会の重要度と関連付け）
    if (profile.growthOpportunityImportance > 0.7) {
      const isGrowthStage = ['early', 'growth'].includes(job.companyAttributes.stage);
      companyScore += isGrowthStage ? 0.5 : 0.2;
    }
    
    // ストックオプション（福利厚生の重要度と関連付け）
    if (profile.benefitsImportance > 0.7 && job.companyAttributes.hasStockOptions) {
      companyScore += 0.3;
    }
    
    // 企業文化マッチ（ワークライフバランス重視の文化）
    if (profile.workLifeBalanceImportance > 0.7) {
      const hasWLBCulture = job.companyAttributes.companyCulture.some(
        (culture) => culture.includes('ワークライフバランス') || culture.includes('リモート')
      );
      companyScore += hasWLBCulture ? 0.5 : 0.2;
    }
    
    // 正規化（最大2.3、最小0.9）
    const normalizedScore = Math.min(1, companyScore / 2.3);
    score += normalizedScore * companyWeight;
    totalWeight += companyWeight;
  }
  
  // 5. 経験レベルマッチ（重み: 0.1）
  const experienceWeight = 0.1;
  let experienceMatch = 0.5;
  
  // 求人タイトルから経験レベルを推測
  const title = job.title.toLowerCase();
  if (profile.experienceLevel === 'junior' && (title.includes('ジュニア') || title.includes('新卒'))) {
    experienceMatch = 1;
  } else if (profile.experienceLevel === 'mid' && !title.includes('シニア') && !title.includes('リード')) {
    experienceMatch = 1;
  } else if (profile.experienceLevel === 'senior' && (title.includes('シニア') || title.includes('リード'))) {
    experienceMatch = 1;
  } else if (profile.experienceLevel === 'expert' && (title.includes('マネージャー') || title.includes('アーキテクト'))) {
    experienceMatch = 1;
  }
  
  score += experienceMatch * experienceWeight;
  totalWeight += experienceWeight;
  
  // 正規化
  return totalWeight > 0 ? Math.min(1, Math.max(0, score / totalWeight)) : 0.5;
}

/**
 * マッチ度に基づいてフィードバックを決定
 * リアルなユーザー行動を再現するため、確率的に決定
 */
function decideFeedback(matchScore: number): 'like' | 'dislike' | null {
  // マッチ度が高いほどLikeの確率が上がる
  // ランダム性を加えてリアルな行動を再現
  const randomFactor = Math.random();
  
  // マッチ度0.7以上: 70-90%の確率でLike
  if (matchScore >= 0.7) {
    return randomFactor < 0.8 ? 'like' : 'dislike';
  }
  
  // マッチ度0.5-0.7: 40-60%の確率でLike
  if (matchScore >= 0.5) {
    return randomFactor < 0.5 ? 'like' : 'dislike';
  }
  
  // マッチ度0.3-0.5: 20-40%の確率でLike
  if (matchScore >= 0.3) {
    return randomFactor < 0.3 ? 'like' : 'dislike';
  }
  
  // マッチ度0.3未満: 5-20%の確率でLike
  return randomFactor < 0.1 ? 'like' : 'dislike';
}

/**
 * ユーザーごとの評価する求人数を決定
 * リアルな分布を再現（パレートの法則を適用）
 */
function getNumberOfFeedbacksForUser(userIndex: number, totalUsers: number): number {
  // 一部のアクティブユーザーは多く評価し、大半は少なめに評価
  const percentile = userIndex / totalUsers;
  
  if (percentile < 0.2) {
    // 上位20%のユーザー: 20-30件
    return randomInt(20, 30);
  } else if (percentile < 0.5) {
    // 次の30%のユーザー: 15-25件
    return randomInt(15, 25);
  } else if (percentile < 0.8) {
    // 次の30%のユーザー: 10-20件
    return randomInt(10, 20);
  } else {
    // 残り20%のユーザー: 5-15件
    return randomInt(5, 15);
  }
}

/**
 * ユーザー用のフィードバックを生成
 */
export function generateUserFeedbacks(
  profile: UserProfile,
  jobs: EnhancedJob[],
  userIndex: number,
  totalUsers: number
): JobFeedback[] {
  const feedbacks: JobFeedback[] = [];
  
  // このユーザーが評価する求人数を決定
  const numberOfFeedbacks = getNumberOfFeedbacksForUser(userIndex, totalUsers);
  
  // 各求人のマッチ度を計算
  const jobScores = jobs.map((job) => ({
    job,
    matchScore: calculateJobMatchScore(job, profile),
  }));
  
  // マッチ度でソートし、上位の求人を優先的に評価
  // ただし、完全にマッチ度順ではなく、一部ランダム性を加える
  const sortedJobs = jobScores.sort((a, b) => {
    // 80%の確率でマッチ度順、20%の確率でランダム
    if (Math.random() < 0.8) {
      return b.matchScore - a.matchScore;
    }
    return Math.random() - 0.5;
  });
  
  // 上位N件の求人を評価
  const jobsToEvaluate = sortedJobs.slice(0, numberOfFeedbacks);
  
  // 時系列でフィードバックを生成（過去30日間に分散）
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  jobsToEvaluate.forEach((item, index) => {
    const feedback = decideFeedback(item.matchScore);
    
    if (feedback !== null) {
      // タイムスタンプを古い順から新しい順に生成
      const timestamp = new Date(
        thirtyDaysAgo + (now - thirtyDaysAgo) * (index / numberOfFeedbacks)
      ).toISOString();
      
      feedbacks.push({
        jobId: item.job.id,
        userId: profile.id,
        feedback,
        timestamp,
      });
    }
  });
  
  return feedbacks;
}

/**
 * 全ユーザーのフィードバックを生成
 */
export function generateAllUserFeedbacks(
  profiles: UserProfile[],
  jobs: EnhancedJob[]
): JobFeedback[] {
  const allFeedbacks: JobFeedback[] = [];
  
  profiles.forEach((profile, index) => {
    const userFeedbacks = generateUserFeedbacks(profile, jobs, index, profiles.length);
    allFeedbacks.push(...userFeedbacks);
  });
  
  return allFeedbacks;
}

