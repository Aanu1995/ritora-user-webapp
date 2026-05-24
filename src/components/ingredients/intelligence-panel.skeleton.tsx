import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for the Ingredients tab's intelligence panel. Mirrors the live
 * layout exactly so hydration is a calm swap, not a layout jump:
 *   - Small icon + label header
 *   - Two per-active cards: name + category pill + summary + (sometimes)
 *     an inline pairing block
 */
export function IntelligencePanelSkeleton() {
  return (
    <div
      data-testid="intelligence-panel-skeleton"
      className="flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-4/5" />
          </div>
          {i === 0 ? (
            <div className="border-t border-border bg-surface-muted px-3.5 py-3">
              <div className="flex items-start gap-2">
                <Skeleton className="mt-0.5 h-3.5 w-3.5 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-1.5 pt-0.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
