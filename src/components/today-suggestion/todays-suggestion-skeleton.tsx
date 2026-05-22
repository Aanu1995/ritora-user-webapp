import { Skeleton } from "@/components/ui/skeleton";

export function TodaysSuggestionSkeleton() {
  return (
    <div className="mx-auto w-full lg:w-[70%]" aria-hidden="true">
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {[0, 1].map((section) => (
        <section key={section} className="mt-6">
          <Skeleton className="mb-2 ml-1 h-3 w-20 rounded-full" />

          <article className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
            <header className="mb-3 flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="mt-1.5 h-2.5 w-16 rounded-full" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </header>

            <Skeleton className="h-10 w-full rounded-xl" />

            <ol className="mt-3 flex flex-col gap-2.5">
              {[0, 1, 2].map((row) => (
                <li
                  key={row}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted p-2.5"
                >
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="mt-1.5 h-3.5 w-3/4 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
                </li>
              ))}
            </ol>

            <div className="mt-3.5 flex items-center gap-2">
              <Skeleton className="h-10 flex-1 rounded-full" />
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            </div>
          </article>
        </section>
      ))}
    </div>
  );
}
