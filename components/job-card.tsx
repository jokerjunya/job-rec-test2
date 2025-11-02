import type { EnhancedJob, WorkType } from '@/types/job';
import { MapPin, Calendar, Briefcase, Eye } from 'lucide-react';
import { useState } from 'react';
import { JobDetailModal } from './job-detail-modal';

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

interface JobCardProps {
  job: EnhancedJob;
}

/**
 * 求人カードコンポーネント
 */
export function JobCard({ job }: JobCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        {/* ヘッダー */}
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {job.title}
          </h2>
          <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
            {job.company}
          </p>
        </div>

      {/* 給与情報 */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {job.salary.min}〜{job.salary.max}
          <span className="ml-1 text-base font-normal text-zinc-600 dark:text-zinc-400">
            {job.salary.currency}
          </span>
        </p>
      </div>

      {/* 勤務地・勤務形態 */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <Briefcase className="h-4 w-4" />
          <span>{getWorkTypeLabel(job.workType)}</span>
        </div>
      </div>

      {/* 説明 */}
      <p className="mb-4 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
        {job.description}
      </p>

      {/* 必要なスキル */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-500">
          必要なスキル
        </p>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              +{job.requiredSkills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="mt-auto space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>開始予定: {formatDate(job.startDate)}</span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            投稿日: {formatDate(job.postedDate)}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetailModal(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Eye className="h-4 w-4" />
          詳細を見る
        </button>
      </div>
    </div>

    {showDetailModal && (
      <JobDetailModal job={job} onClose={() => setShowDetailModal(false)} />
    )}
  </>
  );
}

