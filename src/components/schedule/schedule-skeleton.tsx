import { Skeleton } from '@/components/ui/skeleton';

export function ScheduleSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-12" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          {Array.from({ length: i === 0 ? 2 : 1 }).map((_, j) => (
            <div
              key={j}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-2/3" />
              </div>
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
