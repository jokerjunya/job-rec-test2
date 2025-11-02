'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ONBOARDING_STORAGE_KEY = 'jobrectest2-onboarding-completed';

interface OnboardingStep {
  title: string;
  description: string;
  emoji: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'ようこそ！',
    description:
      '求人マッチングアプリへようこそ！簡単なチュートリアルで使い方をご紹介します。',
    emoji: '👋',
  },
  {
    title: 'スワイプで評価',
    description:
      '求人カードを左右にスワイプ、または矢印キー（←/→）で「いいね」「スキップ」を選択できます。',
    emoji: '👆',
  },
  {
    title: '詳細を確認',
    description:
      '「詳細を見る」ボタンをクリックすると、求人の詳細情報を確認できます。',
    emoji: '👁️',
  },
  {
    title: '検索とフィルター',
    description:
      '検索バーや詳細フィルターを使って、条件に合う求人を絞り込めます。',
    emoji: '🔍',
  },
  {
    title: '履歴と統計',
    description:
      '「履歴」ページで、あなたのフィードバック履歴と統計を確認できます。',
    emoji: '📊',
  },
  {
    title: '求人を比較',
    description:
      '「比較」ページで、2つの求人を並べて比較し、より良い選択ができます。',
    emoji: '⚖️',
  },
  {
    title: '準備完了！',
    description: 'それでは、あなたにぴったりの求人を見つけましょう！',
    emoji: '🎉',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

/**
 * オンボーディングツアーコンポーネント
 */
export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl dark:bg-zinc-900"
      >
        {/* スキップボタン */}
        {!isLastStep && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="スキップ"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* コンテンツ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="mb-6 text-6xl">{step.emoji}</div>
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {step.title}
            </h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* プログレスインジケーター */}
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-600'
                  : index < currentStep
                  ? 'bg-blue-400'
                  : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
            戻る
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLastStep ? '始める' : '次へ'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * オンボーディングが完了しているかチェック
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

/**
 * オンボーディングをリセット（デバッグ用）
 */
export function resetOnboarding(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }
}

