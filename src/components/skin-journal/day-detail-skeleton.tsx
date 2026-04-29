const ANALYSIS_CHIP_SKELETONS = ["first", "second", "third"] as const;
const CONTEXT_RATING_ROWS = [
  "oiliness",
  "dryness",
  "redness",
  "breakouts",
  "texture",
  "irritation",
  "sensitivity",
] as const;
const RATING_DOTS = ["one", "two", "three", "four", "five"] as const;

interface DayDetailSkeletonProps {
  label: string;
}

export function DayDetailSkeleton({ label }: DayDetailSkeletonProps) {
  return (
    <div className="space-y-3" aria-label={label}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-2.5 w-28 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-4 w-36 animate-pulse rounded-full bg-surface-muted" />
        </div>
        <div className="h-5 w-32 animate-pulse rounded-full bg-surface-muted" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="aspect-[5/6] animate-pulse bg-surface-muted" />
        <div className="space-y-2 p-3.5">
          <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-surface-muted" />
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-9 w-20 animate-pulse rounded-full bg-surface-muted" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-surface-muted" />
          </div>
          <div className="h-5 w-20 animate-pulse rounded-full bg-surface-muted" />
        </div>
        <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-surface-muted" />
        <div className="mt-2 h-3 w-3/4 animate-pulse rounded-full bg-surface-muted" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="aspect-[1/1.1] animate-pulse rounded-2xl bg-surface-muted" />
          <div className="space-y-2">
            <div className="h-2.5 w-24 animate-pulse rounded-full bg-surface-muted" />
            <div className="flex flex-wrap gap-1.5">
              {ANALYSIS_CHIP_SKELETONS.map((key) => (
                <div
                  key={key}
                  className="h-7 w-32 animate-pulse rounded-full bg-surface-muted"
                />
              ))}
            </div>
            <div className="mt-2 h-2.5 w-20 animate-pulse rounded-full bg-surface-muted" />
            <div className="flex flex-wrap gap-1.5">
              {ANALYSIS_CHIP_SKELETONS.map((key) => (
                <div
                  key={key}
                  className="h-7 w-24 animate-pulse rounded-full bg-surface-muted"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-muted" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTEXT_RATING_ROWS.map((row) => (
            <div
              key={row}
              className="grid grid-cols-[130px_1fr] items-center gap-3 border-b border-dashed border-border py-1.5 last:border-b-0"
            >
              <div className="h-3 w-20 animate-pulse rounded-full bg-surface-muted" />
              <div className="flex gap-1">
                {RATING_DOTS.map((dot) => (
                  <div
                    key={dot}
                    className="h-7 w-7 animate-pulse rounded-full bg-surface-muted"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
