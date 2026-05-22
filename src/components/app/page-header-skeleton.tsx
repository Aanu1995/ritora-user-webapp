import { Skeleton } from '@/components/ui/skeleton';

type PageHeaderSkeletonProps = {
  withLeading?: boolean;
  withAction?: boolean;
};

export function PageHeaderSkeleton({
  withLeading = false,
  withAction = false,
}: PageHeaderSkeletonProps) {
  return (
    <div
      data-testid="page-header-skeleton"
      className="sticky top-0 z-10 bg-background pb-4 pt-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {withLeading ? (
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-48 max-w-full rounded-xl" />
            <Skeleton className="h-3.5 w-64 max-w-full rounded-full" />
          </div>
        </div>
        {withAction ? (
          <Skeleton className="mt-0.5 h-9 w-28 shrink-0 rounded-full" />
        ) : null}
      </div>
    </div>
  );
}
