import { Skeleton } from "@/components/ui/skeleton";

export function ProductListSkeleton() {
  return (
    <div
      data-testid="product-list-skeleton"
      className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-3 py-3">
          <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
