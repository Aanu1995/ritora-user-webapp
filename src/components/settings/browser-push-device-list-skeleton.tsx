import { Skeleton } from "@/components/ui/skeleton";

export function PushDeviceListSkeleton() {
  return (
    <div
      data-testid="browser-push-devices-skeleton"
      className="mt-2 space-y-2"
    >
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-36 rounded-full" />
            <Skeleton className="mt-1.5 h-2.5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
