'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { WorkType } from '@/types/job';

export interface JobFilters {
  searchQuery: string;
  workType: WorkType | 'all';
  minSalary: number;
  location: string;
}

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  availableLocations: string[];
}

/**
 * 求人フィルターコンポーネント
 */
export function JobFiltersComponent({
  filters,
  onFiltersChange,
  availableLocations,
}: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      searchQuery: '',
      workType: 'all',
      minSalary: 0,
      location: '',
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.workType !== 'all' ||
    filters.minSalary > 0 ||
    filters.location;

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="求人を検索（職種、企業名など）"
          value={filters.searchQuery}
          onChange={(e) =>
            onFiltersChange({ ...filters, searchQuery: e.target.value })
          }
          className="w-full rounded-lg border border-zinc-300 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400"
        />
      </div>

      {/* フィルター切り替えボタン */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            showAdvanced || hasActiveFilters
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          詳細フィルター
          {hasActiveFilters && !showAdvanced && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              !
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <X className="h-3.5 w-3.5" />
            クリア
          </button>
        )}
      </div>

      {/* 詳細フィルター */}
      {showAdvanced && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 勤務形態 */}
            <div>
              <label
                htmlFor="workType"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                勤務形態
              </label>
              <select
                id="workType"
                value={filters.workType}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    workType: e.target.value as WorkType | 'all',
                  })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="all">すべて</option>
                <option value="full-time">正社員</option>
                <option value="part-time">パートタイム</option>
                <option value="contract">契約社員</option>
                <option value="remote">リモート</option>
                <option value="hybrid">ハイブリッド</option>
              </select>
            </div>

            {/* 勤務地 */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                勤務地
              </label>
              <select
                id="location"
                value={filters.location}
                onChange={(e) =>
                  onFiltersChange({ ...filters, location: e.target.value })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">すべて</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* 最低給与 */}
            <div>
              <label
                htmlFor="minSalary"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                最低給与（万円）
              </label>
              <input
                id="minSalary"
                type="number"
                min="0"
                step="50"
                value={filters.minSalary}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minSalary: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="例: 300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

