/**
 * 類似ユーザー表示コンポーネント
 */
'use client';

import type { UserSimilarity } from '@/utils/user-similarity';
import type { UserProfile } from '@/types/user-profile';

interface SimilarUsersProps {
  /** 類似ユーザーのリスト */
  similarUsers: UserSimilarity[];
  
  /** ユーザープロファイル情報 */
  userProfiles: UserProfile[];
  
  /** 最大表示件数 */
  maxDisplay?: number;
}

/**
 * 経験レベルのラベル
 */
const EXPERIENCE_LEVEL_LABELS = {
  junior: 'ジュニア',
  mid: 'ミドル',
  senior: 'シニア',
  expert: 'エキスパート',
} as const;

/**
 * 興味分野のラベル
 */
const INTEREST_AREA_LABELS = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  fullstack: 'フルスタック',
  mobile: 'モバイル',
  'ai-ml': 'AI/ML',
  data: 'データ',
  devops: 'DevOps',
  security: 'セキュリティ',
  design: 'デザイン',
  product: 'プロダクト',
  marketing: 'マーケティング',
  sales: '営業',
} as const;

/**
 * 類似度スコアのカラーを取得
 */
function getSimilarityColor(score: number): string {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-blue-600';
  if (score >= 0.4) return 'text-yellow-600';
  return 'text-gray-600';
}

/**
 * 類似度スコアのラベルを取得
 */
function getSimilarityLabel(score: number): string {
  if (score >= 0.8) return '非常に似ています';
  if (score >= 0.6) return '似ています';
  if (score >= 0.4) return 'やや似ています';
  return '少し似ています';
}

/**
 * 類似ユーザー表示コンポーネント
 */
export function SimilarUsers({
  similarUsers,
  userProfiles,
  maxDisplay = 3,
}: SimilarUsersProps) {
  // プロファイルをMapに変換
  const profileMap = new Map(userProfiles.map((p) => [p.id, p]));
  
  // 表示するユーザーを制限
  const displayUsers = similarUsers.slice(0, maxDisplay);
  
  if (displayUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">類似ユーザー</h2>
        <p className="text-gray-600">
          まだ類似ユーザーが見つかりませんでした。
          <br />
          もっと多くの求人を評価すると、あなたと似た好みのユーザーが表示されます。
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        あなたと好みが似ているユーザー
      </h2>
      
      <div className="space-y-4">
        {displayUsers.map((similarUser) => {
          const profile = profileMap.get(similarUser.userId);
          
          if (!profile) return null;
          
          const similarityPercentage = Math.round(similarUser.similarityScore * 100);
          const similarityColor = getSimilarityColor(similarUser.similarityScore);
          const similarityLabel = getSimilarityLabel(similarUser.similarityScore);
          
          return (
            <div
              key={similarUser.userId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* アバター */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{profile.name}</h3>
                    <p className="text-sm text-gray-600">
                      {EXPERIENCE_LEVEL_LABELS[profile.experienceLevel]} · {profile.yearsOfExperience}年
                    </p>
                  </div>
                </div>
                
                {/* 類似度スコア */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${similarityColor}`}>
                    {similarityPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">{similarityLabel}</div>
                </div>
              </div>
              
              {/* 興味分野 */}
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">興味分野:</div>
                <div className="flex flex-wrap gap-1">
                  {profile.interestAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {INTEREST_AREA_LABELS[area]}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 共通評価数 */}
              <div className="text-xs text-gray-500 mt-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {similarUser.commonItemsCount}件の共通評価
              </div>
            </div>
          );
        })}
      </div>
      
      {similarUsers.length > maxDisplay && (
        <div className="mt-4 text-center text-sm text-gray-500">
          他にも{similarUsers.length - maxDisplay}人の類似ユーザーがいます
        </div>
      )}
    </div>
  );
}

