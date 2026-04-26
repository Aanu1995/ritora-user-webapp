import { Skeleton } from '@/components/ui/skeleton';

export function IntelligencePanelSkeleton() {
  return (
    <div
      data-testid="intelligence-panel-skeleton"
      className="flex flex-col gap-3"
    >
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
