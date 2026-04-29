import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the dashboard layout: optional alert + nudge card, then the
 * upcoming-features eyebrow and 3-column card grid.
 */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>

      <Skeleton className="h-2.5 w-32" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-dashed border-border-strong bg-surface/50 p-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
