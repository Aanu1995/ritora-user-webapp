import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

type NotificationsPageSkeletonProps = {
  includeHeader?: boolean;
};

const ROWS = [0, 1, 2, 3] as const;

function NotificationRowSkeleton({ unread }: { unread?: boolean }) {
  return (
    <div
      className={
        unread
          ? 'flex items-start gap-3 rounded-xl bg-accent/5 px-2.5 py-3.5'
          : 'flex items-start gap-3 border-b border-border py-3.5 last:border-b-0'
      }
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3 rounded-full" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-2.5 w-3/4 rounded-full" />
        <Skeleton className="h-2.5 w-28 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
    </div>
  );
}

export function NotificationsPageSkeleton({
  includeHeader = true,
}: NotificationsPageSkeletonProps) {
  return (
    <div data-testid="notifications-page-skeleton" className="">
      {includeHeader ? <PageHeaderSkeleton withAction /> : null}

      <div className="mt-2 max-w-2xl">
        <Skeleton className="mb-2 h-2.5 w-24 rounded-full" />
        <div className="space-y-1">
          {ROWS.slice(0, 3).map((row) => (
            <NotificationRowSkeleton key={row} unread />
          ))}
        </div>

        <Skeleton className="mb-2 mt-6 h-2.5 w-20 rounded-full" />
        <div>
          {ROWS.slice(0, 2).map((row) => (
            <NotificationRowSkeleton key={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
