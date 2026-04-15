import { Skeleton } from "@/components/ui/skeleton";

export function SkinProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="space-y-3">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-1.5 flex-1 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-6 rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
    </div>
  );
}
