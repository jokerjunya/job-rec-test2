'use client';

import { useState, useEffect, useMemo } from 'react';
import { jobs } from '@/data/jobs';
import { JobCard } from '@/components/job-card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { getFeedbackData } from '@/utils/local-storage';
import { getCurrentUserId } from '@/utils/auth';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * 比較ペアの型定義
 */
interface ComparisonPair {
  job1: number;
  job2: number;
}

/**
 * 比較結果の型定義
 */
interface ComparisonResult {
  pairId: string;
  selectedJobId: string | null;
  timestamp: string;
}

const COMPARISON_STORAGE_KEY = 'job-comparisons';

/**
 * すべてのペアを生成（組み合わせ）
 */
function generateAllPairs(jobCount: number): ComparisonPair[] {
  const pairs: ComparisonPair[] = [];
  for (let i = 0; i < jobCount; i++) {
    for (let j = i + 1; j < jobCount; j++) {
      pairs.push({ job1: i, job2: j });
    }
  }
  return pairs;
}

/**
 * 比較結果を取得
 */
function getComparisonResults(): ComparisonResult[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return [];
    }

    const data = localStorage.getItem(`${COMPARISON_STORAGE_KEY}-${userId}`);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as ComparisonResult[];
  } catch {
    return [];
  }
}

/**
 * 比較結果を保存
 */
function saveComparisonResult(pairId: string, selectedJobId: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return;
    }

    const key = `${COMPARISON_STORAGE_KEY}-${userId}`;
    const data = localStorage.getItem(key);
    const results: ComparisonResult[] = data ? JSON.parse(data) : [];

    const existingIndex = results.findIndex((r) => r.pairId === pairId);
    const newResult: ComparisonResult = {
      pairId,
      selectedJobId,
      timestamp: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      results[existingIndex] = newResult;
    } else {
      results.push(newResult);
    }

    localStorage.setItem(key, JSON.stringify(results));
  } catch (error) {
    console.error('Failed to save comparison result:', error);
  }
}

/**
 * ペアIDを生成
 */
function generatePairId(job1Index: number, job2Index: number): string {
  return `pair-${Math.min(job1Index, job2Index)}-${Math.max(job1Index, job2Index)}`;
}

/**
 * 比較ページ
 */
export default function ComparePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);

  // すべてのペアを生成
  const allPairs = useMemo(() => generateAllPairs(jobs.length), []);

  // 比較済みの結果を取得（リアルタイム更新のためuseStateを使用）
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);

  // localStorageから比較結果を読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const results = getComparisonResults();
      setComparisonResults(results);
      setComparisonCount(results.length);
    }
  }, []);

  // 未比較のペアをフィルタリング
  const remainingPairs = useMemo(() => {
    const completedPairIds = new Set(
      comparisonResults.map((r) => r.pairId)
    );
    return allPairs.filter(
      (pair) => !completedPairIds.has(generatePairId(pair.job1, pair.job2))
    );
  }, [allPairs, comparisonResults]);

  // 現在のペア（残りペアが0の場合はnull）
  const currentPair =
    remainingPairs.length > 0 && currentPairIndex < remainingPairs.length
      ? remainingPairs[currentPairIndex]
      : null;

  // currentPairIndexが範囲外の場合にリセット
  useEffect(() => {
    if (remainingPairs.length > 0 && currentPairIndex >= remainingPairs.length) {
      setCurrentPairIndex(0);
    }
  }, [remainingPairs.length, currentPairIndex]);

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  // すべてのペアを比較済みの場合
  if (!currentPair) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              求人を比較
            </h1>
          </div>
          <div className="flex min-h-[600px] items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                すべての比較が完了しました
              </p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                比較回数: {comparisonCount}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const job1 = jobs[currentPair.job1];
  const job2 = jobs[currentPair.job2];
  const pairId = generatePairId(currentPair.job1, currentPair.job2);

  const handleSelect = (selectedJobId: string) => {
    saveComparisonResult(pairId, selectedJobId);
    
    // 比較結果を再読み込み
    const updatedResults = getComparisonResults();
    setComparisonResults(updatedResults);
    setComparisonCount(updatedResults.length);

    // 次のペアに進む
    if (currentPairIndex < remainingPairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      // すべてのペアを比較済みの場合、最初に戻る
      setCurrentPairIndex(0);
    }
  };

  const handleSkip = () => {
    saveComparisonResult(pairId, null);
    
    // 比較結果を再読み込み
    const updatedResults = getComparisonResults();
    setComparisonResults(updatedResults);
    setComparisonCount(updatedResults.length);

    // 次のペアに進む
    if (currentPairIndex < remainingPairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      // すべてのペアを比較済みの場合、最初に戻る
      setCurrentPairIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            求人を比較
          </h1>
          <p className="mt-2 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            どちらがいいですか?
          </p>
        </div>

        {/* 統計情報 */}
        <div className="mb-4 sm:mb-6 flex gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <div>比較回数: {comparisonCount}</div>
          <div>残りペア数: {remainingPairs.length}</div>
        </div>

        {/* 比較カード */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 左側の求人 */}
          <div className="relative">
            <JobCard job={job1} />
            <button
              type="button"
              onClick={() => handleSelect(job1.id)}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              こちらを選択
            </button>
          </div>

          {/* 右側の求人 */}
          <div className="relative">
            <JobCard job={job2} />
            <button
              type="button"
              onClick={() => handleSelect(job2.id)}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              こちらを選択
            </button>
          </div>
        </div>

        {/* スキップボタン */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-md border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            スキップ
          </button>
        </div>
      </main>
    </div>
  );
}

