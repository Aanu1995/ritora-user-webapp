import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

type NotificationSettingsSkeletonProps = {
  includeHeader?: boolean;
};

const TOGGLE_ROWS = [0, 1] as const;

function ToggleRowSkeleton({ wide }: { wide?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <Skeleton
        className={`h-3 rounded-full ${wide ? 'w-3/4' : 'w-2/3'}`}
      />
      <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
    </div>
  );
}

function SettingsSectionSkeleton({ fields = false }: { fields?: boolean }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <Skeleton className="h-3.5 w-36 rounded-full" />
      <div className="mt-3">
        <ToggleRowSkeleton />
      </div>
      {fields ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-2.5 w-1/2 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
      ) : (
        TOGGLE_ROWS.map((row) => <ToggleRowSkeleton key={row} wide />)
      )}
    </section>
  );
}

export function NotificationSettingsSkeleton({
  includeHeader = true,
}: NotificationSettingsSkeletonProps) {
  return (
    <div data-testid="notification-settings-skeleton" className="">
      {includeHeader ? <PageHeaderSkeleton /> : null}
      <div className="mt-4 max-w-2xl space-y-4">
        <SettingsSectionSkeleton fields />
        <SettingsSectionSkeleton />
        <SettingsSectionSkeleton />
      </div>
    </div>
  );
}
