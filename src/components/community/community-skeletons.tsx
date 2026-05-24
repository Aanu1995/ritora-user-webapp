import { Skeleton } from "@/components/ui/skeleton";

export function CommunitySkeleton() {
  return (
    <div
      aria-busy
      className="mx-auto max-w-6xl pb-10 motion-safe:animate-in motion-safe:fade-in"
    >
      <div className="flex items-start justify-between gap-3 pt-3 sm:pt-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-md sm:h-7 sm:w-40" />
          <Skeleton className="h-3.5 w-64 rounded-md sm:h-4 sm:w-80" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>

      <div className="mx-auto mt-2 w-full max-w-[54rem]">
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Skeleton className="h-3 w-16 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-16 rounded-md" />
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-1 overflow-hidden rounded-xl border border-border bg-surface-muted/60 p-1 shadow-soft">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-8 w-24 shrink-0 rounded-lg"
            />
          ))}
        </div>

        <div className="mt-4 space-y-8">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-56 rounded-md" />
            </div>
            <ul className="grid gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="mt-2 h-3 w-5/6 rounded-md" />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
            <CommunityListSkeleton count={2} />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <CommunityCardSkeleton />
              <CommunityCardSkeleton />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function CommunityCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/5 rounded-md" />
          <Skeleton className="h-3 w-2/5 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-full rounded-md" />
      <Skeleton className="mt-1.5 h-3 w-4/5 rounded-md" />
    </div>
  );
}

export function CommunityListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      aria-busy
      className="grid gap-3 motion-safe:animate-in motion-safe:fade-in"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CommunityCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CommunityDetailSkeleton() {
  return (
    <div
      aria-busy
      className="mx-auto max-w-4xl space-y-6 pb-10 motion-safe:animate-in motion-safe:fade-in"
    >
      <div className="flex items-start justify-between gap-3 pt-3 sm:pt-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-72 rounded-md sm:h-7 sm:w-96" />
          <Skeleton className="h-3.5 w-56 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft via-surface to-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
        </div>
        <Skeleton className="mt-5 h-9 w-48 rounded-xl" />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <Skeleton className="h-5 w-56 rounded-md" />
        <Skeleton className="mt-2 h-3 w-3/4 rounded-md" />
        <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CommunityAdaptResultSkeleton() {
  return (
    <div
      aria-busy
      className="mt-5 grid gap-4 motion-safe:animate-in motion-safe:fade-in"
    >
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  );
}
