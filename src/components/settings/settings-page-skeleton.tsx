import { Skeleton } from '@/components/ui/skeleton';

const TAB_WIDTHS = ['w-20', 'w-24', 'w-20', 'w-20'] as const;

export function SettingsPageSkeleton() {
  return (
    <div data-testid="settings-page-skeleton">
      <div className="sticky top-0 z-10 bg-background pt-6">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="mt-2 h-3.5 w-72 max-w-full rounded-full" />
        <div className="mx-auto max-w-2xl">
          <div className="mt-6 inline-flex h-10 w-full items-center gap-1 border-b border-border">
            {TAB_WIDTHS.map((width, index) => (
              <Skeleton
                key={`${width}-${index}`}
                className={`h-8 ${width} rounded-full`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-2xl space-y-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <Skeleton className="h-4 w-36 rounded-full" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-3 h-3 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
        </section>
      </div>
    </div>
  );
}
