'use client';

import type { EnhancedJob, WorkType } from '@/types/job';
import { MapPin, Calendar, Briefcase, DollarSign, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * 勤務形態の日本語ラベル
 */
const workTypeLabels: Record<WorkType, string> = {
  'full-time': '正社員',
  'part-time': 'パートタイム',
  'contract': '契約社員',
  'remote': 'リモート',
  'hybrid': 'ハイブリッド',
};

/**
 * 勤務形態の表示名を取得
 */
function getWorkTypeLabel(workType: WorkType): string {
  return workTypeLabels[workType] || workType;
}

/**
 * 日付をフォーマット（YYYY-MM-DD → YYYY年MM月DD日）
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

interface JobDetailModalProps {
  job: EnhancedJob;
  onClose: () => void;
}

/**
 * 求人詳細モーダルコンポーネント
 */
export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // スクロールを防止
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {job.title}
              </h2>
              <p className="mt-1 text-lg font-medium text-zinc-600 dark:text-zinc-400">
                {job.company}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="閉じる"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="p-6 space-y-6">
            {/* 給与情報 */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <DollarSign className="h-4 w-4" />
                給与
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {job.salary.min}〜{job.salary.max}
                <span className="ml-2 text-base font-normal text-zinc-600 dark:text-zinc-400">
                  {job.salary.currency}
                </span>
              </p>
            </div>

            {/* 勤務地・勤務形態 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <MapPin className="h-4 w-4" />
                  勤務地
                </div>
                <p className="text-zinc-900 dark:text-zinc-50">{job.location}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Briefcase className="h-4 w-4" />
                  勤務形態
                </div>
                <p className="text-zinc-900 dark:text-zinc-50">
                  {getWorkTypeLabel(job.workType)}
                </p>
              </div>
            </div>

            {/* 説明 */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                求人概要
              </h3>
              <p className="whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* 必要なスキル */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                必要なスキル
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-blue-100 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 日付情報 */}
            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="font-medium">開始予定日</p>
                    <p>{formatDate(job.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="font-medium">投稿日</p>
                    <p>{formatDate(job.postedDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="sticky bottom-0 border-t border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

