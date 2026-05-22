import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { ScheduleSkeleton } from './schedule-skeleton';

export function ScheduleRouteSkeleton() {
  return (
    <div data-testid="schedule-route-skeleton">
      <PageHeaderSkeleton />
      <div className="mx-auto w-full max-w-3xl">
        <ScheduleSkeleton />
      </div>
    </div>
  );
}
