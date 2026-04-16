import { Skeleton } from "@/components/ui/skeleton";

export function SkinProfileSkeleton() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-4">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-1 flex-1 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="mt-8 space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </div>
  );
}
