import { Skeleton } from "@/components/ui/skeleton";

export function SmartPicksSkeleton() {
  return (
    <div
      data-testid="smart-picks-skeleton"
      className="space-y-4 pt-4"
      aria-busy="true"
    >
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  );
}
