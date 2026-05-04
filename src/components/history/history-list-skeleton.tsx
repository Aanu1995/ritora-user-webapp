import { Skeleton } from "@/components/ui/skeleton";

export function HistoryListSkeleton() {
  return (
    <div className="mt-2 space-y-3" aria-hidden="true">
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      {[0, 1, 2].map((day) => (
        <div
          key={day}
          className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="mt-2 h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <div className="mt-4 space-y-3">
            {[0, 1].map((slot) => (
              <div key={slot} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-28 rounded-full" />
                  <Skeleton className="mt-2 h-2.5 w-2/3 rounded-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
