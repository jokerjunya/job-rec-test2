/**
 * レコメンド求人表示コンポーネント
 */
'use client';

import type { JobRecommendation } from '@/utils/recommendation';

interface RecommendedJobsProps {
  /** レコメンド求人のリスト */
  recommendations: JobRecommendation[];
  
  /** 求人クリック時のハンドラー */
  onJobClick?: (jobId: string) => void;
}

/**
 * 給与をフォーマット
 */
function formatSalary(min: number, max: number, currency: string): string {
  return `${min.toLocaleString()}〜${max.toLocaleString()}${currency}`;
}

/**
 * レコメンドスコアのカラーを取得
 */
function getScoreColor(score: number): string {
  if (score >= 0.8) return 'bg-green-500';
  if (score >= 0.6) return 'bg-blue-500';
  if (score >= 0.4) return 'bg-yellow-500';
  return 'bg-gray-500';
}

/**
 * レコメンドスコアのラベルを取得
 */
function getScoreLabel(score: number): string {
  if (score >= 0.8) return '強くおすすめ';
  if (score >= 0.6) return 'おすすめ';
  if (score >= 0.4) return 'まあまあ';
  return '参考程度';
}

/**
 * 働き方のラベル
 */
const WORK_TYPE_LABELS = {
  'full-time': 'フルタイム',
  'part-time': 'パートタイム',
  contract: '契約',
  remote: 'リモート',
  hybrid: 'ハイブリッド',
} as const;

/**
 * レコメンド求人表示コンポーネント
 */
export function RecommendedJobs({
  recommendations,
  onJobClick,
}: RecommendedJobsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">おすすめの求人</h2>
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600">
            現在おすすめの求人がありません。
            <br />
            もっと多くの求人を評価すると、あなたに合った求人がおすすめされます。
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        あなたへのおすすめ求人
      </h2>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const { job, score, scoreBreakdown, reason } = rec;
          const scorePercentage = Math.round(score * 100);
          const scoreColor = getScoreColor(score);
          const scoreLabel = getScoreLabel(score);
          
          return (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onJobClick?.(job.id)}
            >
              {/* ヘッダー: タイトルとスコア */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-500">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                  </div>
                  <p className="text-gray-700 font-medium">{job.company}</p>
                </div>
                
                {/* スコアバッジ */}
                <div className="ml-4 flex flex-col items-end">
                  <div
                    className={`${scoreColor} text-white px-3 py-1 rounded-full text-sm font-bold`}
                  >
                    {scorePercentage}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{scoreLabel}</div>
                </div>
              </div>
              
              {/* レコメンド理由 */}
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-purple-900">{reason}</p>
                </div>
              </div>
              
              {/* 求人詳細 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">💰 給与</div>
                  <div className="text-sm font-semibold">
                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">📍 勤務地</div>
                  <div className="text-sm font-semibold">{job.location}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">💼 働き方</div>
                  <div className="text-sm font-semibold">
                    {WORK_TYPE_LABELS[job.workType]}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">📅 掲載日</div>
                  <div className="text-sm font-semibold">
                    {new Date(job.postedDate).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
              
              {/* スキル */}
              {job.requiredSkills.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">🔧 必要スキル</div>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        +{job.requiredSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* スコア内訳（デバッグ用、本番では非表示推奨） */}
              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  スコア詳細を表示
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                  <div>
                    協調スコア:{' '}
                    {Math.round(scoreBreakdown.collaborativeScore * 100)}%
                  </div>
                  <div>
                    予測評価:{' '}
                    {Math.round(scoreBreakdown.predictedRating * 100)}%
                  </div>
                  <div>
                    寄与ユーザー数: {scoreBreakdown.contributingUsers}人
                  </div>
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}

