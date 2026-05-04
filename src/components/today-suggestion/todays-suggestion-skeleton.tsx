import { Skeleton } from "@/components/ui/skeleton";

export function TodaysSuggestionSkeleton() {
  const pillWidths = ["w-20", "w-24", "w-28", "w-16"];

  return (
    <div className="mx-auto w-full lg:w-[70%]" aria-hidden="true">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {pillWidths.map((width) => (
          <Skeleton
            key={width}
            className={`h-8 rounded-full ${width}`}
          />
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1].map((section) => (
          <section key={section}>
            <Skeleton className="mb-2 h-3 w-24 rounded-full" />
            <div className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <div>
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="mt-2 h-4 w-32 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex items-center gap-3">
                    <Skeleton className="h-11 w-10 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-2.5 w-20 rounded-full" />
                      <Skeleton className="mt-2 h-3.5 w-3/4 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
