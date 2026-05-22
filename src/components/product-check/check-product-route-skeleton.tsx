import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function CheckProductRouteSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mx-auto mt-6 grid max-w-5xl gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
        <Skeleton className="h-[36rem] rounded-2xl xl:h-[calc(100dvh-9rem)]" />
        <div className="flex flex-col gap-4 xl:max-h-[calc(100dvh-9rem)]">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
