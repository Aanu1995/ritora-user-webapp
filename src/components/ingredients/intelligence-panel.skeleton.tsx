import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the IntelligencePanel layout: heading row + safety-score card with
 * a circular score and label, then a stack of finding cards each with an icon
 * tile and 1–2 lines of supporting copy.
 */
export function IntelligencePanelSkeleton() {
  return (
    <div
      data-testid="intelligence-panel-skeleton"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3.5 w-3/4" />
          <div className="flex gap-1.5 pt-0.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
