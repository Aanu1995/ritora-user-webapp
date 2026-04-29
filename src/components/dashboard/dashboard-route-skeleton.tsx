import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { DashboardSkeleton } from './dashboard-skeleton';

export function DashboardRouteSkeleton() {
  return (
    <div data-testid="dashboard-route-skeleton">
      <PageHeaderSkeleton />
      <DashboardSkeleton />
    </div>
  );
}
