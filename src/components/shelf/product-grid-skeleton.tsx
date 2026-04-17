import { Skeleton } from '@/components/ui/skeleton';

export function ProductGridSkeleton() {
  return (
    <div
      data-testid="product-grid-skeleton"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-2.5 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-2.5 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
