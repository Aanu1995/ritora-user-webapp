import { ProductGridSkeleton } from './product-grid-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

const FILTER_WIDTHS = ['w-20', 'w-24', 'w-24', 'w-28'] as const;

export function ShelfPageSkeleton() {
  return (
    <div data-testid="shelf-page-skeleton" className="mx-auto max-w-360">
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 pt-4 backdrop-blur sm:-mx-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-36 rounded-xl" />
            <Skeleton className="h-3.5 w-64 max-w-full rounded-full" />
          </div>
          <Skeleton className="h-9 w-28 shrink-0 rounded-full" />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <div className="flex flex-wrap gap-2">
            {FILTER_WIDTHS.map((width, index) => (
              <Skeleton
                key={`${width}-${index}`}
                className={`h-9 ${width} rounded-full`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
