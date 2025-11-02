/**
 * レコメンドページ
 * ユーザーベース協調フィルタリングによる求人推薦
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { SimilarUsers } from '@/components/similar-users';
import { RecommendedJobs } from '@/components/recommended-jobs';
import { findSimilarUsers } from '@/utils/user-similarity';
import { recommendJobs } from '@/utils/recommendation';
import type { UserSimilarity } from '@/utils/user-similarity';
import type { JobRecommendation } from '@/utils/recommendation';
import { dummyJobs, dummyUsers, dummyFeedbacks, getDummyDataStats } from '@/data/dummy-data';
import { getUserFeedbacks } from '@/utils/local-storage';

/**
 * レコメンドページコンポーネント
 */
export default function RecommendationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [similarUsers, setSimilarUsers] = useState<UserSimilarity[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealData, setUseRealData] = useState(false);
  
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    // レコメンデーションを計算
    calculateRecommendations();
  }, [user, router, useRealData]);
  
  /**
   * レコメンデーションを計算
   */
  const calculateRecommendations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // データソースを選択（ダミーデータまたは実データ）
      let feedbackData = dummyFeedbacks;
      let userId = 'user_001'; // デフォルトのダミーユーザー
      
      if (useRealData) {
        // 実際のユーザーフィードバックを使用
        const realFeedbacks = await getUserFeedbacks();
        
        if (realFeedbacks.length > 0) {
          // 実データとダミーデータを結合
          feedbackData = [...dummyFeedbacks, ...realFeedbacks];
          userId = user.id;
        }
      }
      
      // 類似ユーザーを検索（上位10人を取得し、3人表示）
      const similar = findSimilarUsers(
        feedbackData,
        userId,
        10,
        'hybrid',
        3
      );
      setSimilarUsers(similar);
      
      // レコメンド求人を取得（5件）
      const recs = recommendJobs(
        userId,
        dummyJobs,
        feedbackData,
        5,
        {
          similarUsersCount: 10,
          minCommonItems: 3,
          similarityMethod: 'hybrid',
        }
      );
      setRecommendations(recs);
      
    } catch (error) {
      console.error('Failed to calculate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 求人クリックハンドラー
   */
  const handleJobClick = (jobId: string) => {
    router.push(`/?jobId=${jobId}`);
  };
  
  /**
   * データソース切り替え
   */
  const toggleDataSource = () => {
    setUseRealData(!useRealData);
  };
  
  if (!user) {
    return null;
  }
  
  const stats = getDummyDataStats();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            あなたへのおすすめ
          </h1>
          <p className="text-gray-600">
            協調フィルタリングによる求人推薦システム
          </p>
        </div>
        
        {/* データソース切り替え */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                📊 デモモード
              </h3>
              <p className="text-sm text-blue-800">
                現在は{useRealData ? '実データ' : 'ダミーデータ'}を使用しています。
                {!useRealData && (
                  <>
                    <br />
                    35人のダミーユーザーと{stats.totalFeedbacks}件の評価データに基づいて
                    レコメンドを生成しています。
                  </>
                )}
              </p>
            </div>
            
            <button
              onClick={toggleDataSource}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {useRealData ? 'ダミーデータに切替' : '実データに切替'}
            </button>
          </div>
        </div>
        
        {/* ローディング状態 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">レコメンドを計算中...</p>
          </div>
        )}
        
        {/* メインコンテンツ */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左カラム: 類似ユーザー */}
            <div className="lg:col-span-1">
              <SimilarUsers
                similarUsers={similarUsers}
                userProfiles={dummyUsers}
                maxDisplay={3}
              />
              
              {/* 統計情報 */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-3 text-gray-900">統計情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">総ユーザー数:</span>
                    <span className="font-semibold">{stats.totalUsers}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">総求人数:</span>
                    <span className="font-semibold">{stats.totalJobs}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">総評価数:</span>
                    <span className="font-semibold">{stats.totalFeedbacks}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均評価数/人:</span>
                    <span className="font-semibold">{stats.avgFeedbacksPerUser}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Like率:</span>
                    <span className="font-semibold">{stats.likeRate}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 右カラム: レコメンド求人 */}
            <div className="lg:col-span-2">
              <RecommendedJobs
                recommendations={recommendations}
                onJobClick={handleJobClick}
              />
              
              {/* アルゴリズム説明 */}
              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold mb-3 text-purple-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
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
                  レコメンドの仕組み
                </h3>
                <div className="text-sm text-purple-900 space-y-2">
                  <p>
                    <strong>1. ユーザー類似度計算:</strong> あなたの評価履歴と他のユーザーの
                    評価履歴を比較し、コサイン類似度とピアソン相関係数で類似度を計算します。
                  </p>
                  <p>
                    <strong>2. 協調フィルタリング:</strong> あなたと似た好みのユーザーが
                    高く評価した求人を、あなたも気に入る可能性が高いと判断します。
                  </p>
                  <p>
                    <strong>3. スコアリング:</strong> 複数の類似ユーザーの評価を
                    類似度で重み付けし、最終的なレコメンドスコアを算出します。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            このレコメンドシステムは、協調フィルタリング手法を使用しています。
            <br />
            より多くの求人を評価することで、レコメンドの精度が向上します。
          </p>
        </div>
      </div>
    </div>
  );
}

