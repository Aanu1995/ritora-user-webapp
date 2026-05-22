import { PageHeaderSkeleton } from "@/components/app/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationsPageSkeletonProps = {
  includeHeader?: boolean;
};

function NotificationRowSkeleton({ unread }: { unread?: boolean }) {
  return (
    <div
      className={
        unread
          ? "-mx-2.5 my-1 flex items-start gap-3 rounded-xl bg-[color:var(--accent-strong)]/[0.04] px-2.5 py-3.5"
          : "flex items-start gap-3 border-b border-border py-3.5 last:border-b-0"
      }
    >
      <Skeleton className="h-9 w-9 rounded-[10px]" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-full max-w-md" />
        <Skeleton className="mt-2 h-3 w-28" />
      </div>
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
  );
}

export function NotificationsPageSkeleton({
  includeHeader = true,
}: NotificationsPageSkeletonProps) {
  return (
    <div data-testid="notifications-page-skeleton" className="">
      {includeHeader ? <PageHeaderSkeleton /> : null}
      <div className="mx-auto mt-4 w-full lg:w-3/4">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="space-y-1">
            {[0, 1].map((row) => (
              <NotificationRowSkeleton key={row} unread />
            ))}
          </div>
          <Skeleton className="mb-2 mt-6 h-3 w-20" />
          <div>
            {[0, 1, 2].map((row) => (
              <NotificationRowSkeleton key={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
