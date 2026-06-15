import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

const TAB_WIDTHS = ['w-20', 'w-16', 'w-20', 'w-20', 'w-16'] as const;
const STAT_WIDTHS = ['w-24', 'w-28', 'w-24'] as const;
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
const CALENDAR_CELLS = Array.from({ length: 42 }, (_, index) => index);
const RATING_ROWS = Array.from({ length: 7 }, (_, index) => index);

function JournalTabsSkeleton() {
  return (
    <div className="sticky top-0 z-20 bg-background pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto max-w-5xl space-y-3 pb-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STAT_WIDTHS.map((width, index) => (
            <div
              key={`${width}-${index}`}
              className="rounded-2xl border border-border bg-surface px-3 py-2.5"
            >
              <Skeleton className="h-2.5 w-20 rounded-full" />
              <Skeleton className={`mt-2 h-6 ${width} rounded-full`} />
              <Skeleton className="mt-1.5 h-2.5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl border-b border-border">
        <div className="inline-flex h-10 items-center gap-1 border-b border-border">
          {TAB_WIDTHS.map((width, index) => (
            <Skeleton
              key={`${width}-${index}`}
              className={`h-8 ${width} rounded-full`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function JournalCalendarSkeleton() {
  return (
    <div
      data-testid="journal-calendar-skeleton"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <Skeleton key={day} className="mx-auto h-2.5 w-3 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {CALENDAR_CELLS.map((cell) => (
          <Skeleton key={cell} className="aspect-square rounded-xl" />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {TAB_WIDTHS.map((width, index) => (
          <Skeleton
            key={`${width}-${index}`}
            className={`h-3 ${width} rounded-full`}
          />
        ))}
      </div>
    </div>
  );
}

interface JournalDayDetailSkeletonProps {
  ariaLabel?: string;
}

export function JournalDayDetailSkeleton({
  ariaLabel,
}: JournalDayDetailSkeletonProps) {
  return (
    <div
      data-testid="journal-day-detail-skeleton"
      className="space-y-3"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-28 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <Skeleton className="aspect-[5/6] w-full rounded-none" />
        <div className="space-y-2 p-3.5">
          <Skeleton className="h-2.5 w-1/2 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-3.5 w-32 rounded-full" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-full rounded-full" />
        <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="aspect-[1/1.1] rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="h-7 w-full rounded-full" />
            <Skeleton className="h-7 w-4/5 rounded-full" />
            <Skeleton className="mt-2 h-2.5 w-20 rounded-full" />
            <Skeleton className="h-7 w-2/3 rounded-full" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RATING_ROWS.map((row) => (
            <div
              key={row}
              className="grid grid-cols-[130px_1fr] items-center gap-3 border-b border-dashed border-border py-1.5 last:border-b-0"
            >
              <Skeleton className="h-3 w-20 rounded-full" />
              <div className="flex gap-1">
                {WEEKDAYS.slice(0, 5).map((day) => (
                  <Skeleton key={day} className="h-7 w-7 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JournalPageSkeleton() {
  return (
    <div data-testid="journal-page-skeleton" className="">
      <PageHeaderSkeleton withAction />
      <JournalTabsSkeleton />
      <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <JournalCalendarSkeleton />
        <JournalDayDetailSkeleton />
      </div>
    </div>
  );
}

function ComparePhotoSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24 rounded-full" />
      <div data-testid="journal-compare-photo-skeleton">
        <Skeleton className="aspect-square w-full rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-border bg-surface-muted p-3">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function JournalCompareSkeleton() {
  return (
    <div data-testid="journal-compare-skeleton" className="">
      <PageHeaderSkeleton withLeading withAction />
      <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
        <ComparePhotoSkeleton />
        <ComparePhotoSkeleton />
      </div>
      <div className="mx-auto mt-4 max-w-5xl rounded-2xl border border-border bg-surface p-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="mt-3 h-4 w-48 rounded-full" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-5/6 rounded-full" />
          <Skeleton className="h-3 w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function JournalDayPageSkeleton() {
  return (
    <div data-testid="journal-day-page-skeleton" className="">
      <PageHeaderSkeleton withLeading />
      <div className="mt-2 max-w-3xl">
        <JournalDayDetailSkeleton />
      </div>
    </div>
  );
}

export function JournalUploadSkeleton() {
  return (
    <div data-testid="journal-upload-skeleton" className="">
      <PageHeaderSkeleton withLeading />
      <div className="mx-auto mt-3 max-w-5xl space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44 rounded-full" />
              <Skeleton className="h-3 w-72 max-w-full rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {WEEKDAYS.slice(0, 3).map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-surface-muted p-3"
              >
                <Skeleton className="h-3.5 w-24 rounded-full" />
                <Skeleton className="mt-2 h-3 w-full rounded-full" />
                <Skeleton className="mt-1.5 h-3 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {WEEKDAYS.slice(0, 3).map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border bg-surface p-3"
            >
              <Skeleton className="h-3.5 w-28 rounded-full" />
              <Skeleton className="mt-3 aspect-[4/5] w-full rounded-2xl" />
              <Skeleton className="mt-3 h-8 w-full rounded-full" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
          <Skeleton className="h-3 w-64 max-w-full rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function JournalWrappedSkeleton() {
  return (
    <div data-testid="journal-wrapped-skeleton" className="">
      <PageHeaderSkeleton withLeading />
      <div className="mt-4 rounded-2xl bg-foreground/95 p-6 sm:p-10">
        <div className="mx-auto flex max-w-[360px] flex-col items-center">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-background/20" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-9 w-9 rounded-full bg-background/20" />
            <Skeleton className="h-9 w-9 rounded-full bg-background/20" />
            <Skeleton className="h-9 w-9 rounded-full bg-background/20" />
          </div>
          <Skeleton className="mt-3 h-3 w-48 rounded-full bg-background/20" />
        </div>
      </div>
    </div>
  );
}

export function JournalSimplificationSkeleton() {
  return (
    <div data-testid="journal-simplification-skeleton" className="">
      <PageHeaderSkeleton withLeading withAction />
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SimplificationCardSkeleton />
        <SimplificationCardSkeleton />
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="mt-2 h-3 w-2/3 rounded-full" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SimplificationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <Skeleton className="h-4 w-36 rounded-full" />
      <Skeleton className="mt-2 h-3 w-full rounded-full" />
      <Skeleton className="mt-2 h-3 w-4/5 rounded-full" />
      <div className="mt-3 rounded-xl border border-border bg-surface-muted p-3">
        <Skeleton className="h-3 w-40 rounded-full" />
        <Skeleton className="mt-2 h-3 w-full rounded-full" />
        <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
      </div>
    </div>
  );
}
