import { Skeleton } from "@/components/ui/skeleton";

export function HistoryListSkeleton() {
  return (
    <div className="mt-2" aria-hidden="true">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {[0, 1, 2].map((day) => (
        <article key={day} className="mb-6">
          <header className="mb-2.5 flex items-center gap-3">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40 max-w-full rounded-full" />
              <div className="mt-1.5 flex flex-wrap gap-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            </div>
          </header>

          <ol className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-soft)]">
            {[0, 1].map((slot) => (
              <li
                key={slot}
                className={
                  slot > 0
                    ? "flex items-center gap-3 border-t border-border px-4 py-3.5"
                    : "flex items-center gap-3 px-4 py-3.5"
                }
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-32 rounded-full" />
                  <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}
