import type { EnhancedJob } from '@/types/job';
import { JobCard } from './job-card';

interface JobListProps {
  jobs: EnhancedJob[];
}

/**
 * 求人一覧コンポーネント
 */
export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          求人情報が見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

