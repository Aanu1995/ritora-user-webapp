import { Skeleton } from "@/components/ui/skeleton";

export function HistoryDayDetailSkeleton() {
  return (
    <div className="mx-auto w-full lg:w-[70%]" aria-hidden="true">
      <ul className="mt-3 flex flex-col gap-3.5">
        {[0, 1].map((slot) => (
          <li key={slot}>
            <article className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <header className="mb-3 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="mt-1.5 h-2.5 w-20 rounded-full" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </header>

              <Skeleton className="h-3.5 w-2/3 rounded-full" />

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[0, 1].map((column) => (
                  <div
                    key={column}
                    className="rounded-2xl border border-border bg-surface-muted p-3.5"
                  >
                    <Skeleton className="mb-3 h-3 w-24 rounded-full" />
                    <div className="flex flex-col gap-2.5">
                      {[0, 1, 2].map((row) => (
                        <div
                          key={row}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5"
                        >
                          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <Skeleton className="h-2.5 w-16 rounded-full" />
                            <Skeleton className="mt-1.5 h-3 w-3/4 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
