import { ProductPageHeader } from '../product-page-header';
import { Skeleton } from '@/components/ui/skeleton';

const ACTION_WIDTHS = ['w-20', 'w-24', 'w-24', 'w-20'] as const;
const META_CARDS = ['w-24', 'w-28', 'w-20', 'w-24'] as const;
const TAB_WIDTHS = ['w-20', 'w-24', 'w-28', 'w-24'] as const;
const CHIP_WIDTHS = ['w-16', 'w-20'] as const;

function HeaderActionsSkeleton() {
  return (
    <>
      {ACTION_WIDTHS.map((width, index) => (
        <Skeleton key={`${width}-${index}`} className={`h-9 ${width} rounded-full`} />
      ))}
    </>
  );
}

function ProductSummarySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-3 w-32 rounded-full" />
      <Skeleton className="h-8 w-4/5 rounded-xl" />

      <dl className="grid gap-2 sm:grid-cols-2">
        {META_CARDS.map((width, index) => (
          <div
            key={`${width}-${index}`}
            className="flex items-center gap-3 rounded-2xl bg-surface-muted px-3 py-3"
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-2.5 w-16 rounded-full" />
              <Skeleton className={`h-3 ${width} rounded-full`} />
            </div>
          </div>
        ))}
      </dl>

      <div className="rounded-2xl bg-surface-muted p-4">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <Skeleton className="h-2.5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-full" />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <Skeleton className="h-full w-2/3 rounded-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CHIP_WIDTHS.map((width) => (
          <Skeleton key={width} className={`h-7 ${width} rounded-full`} />
        ))}
      </div>
    </div>
  );
}

function DetailTabsSkeleton() {
  return (
    <div
      data-testid="product-detail-skeleton-tabs"
      className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="flex w-full justify-start gap-2 overflow-x-auto rounded-none border-b border-border bg-surface-muted px-3 py-2">
        {TAB_WIDTHS.map((width, index) => (
          <Skeleton key={`${width}-${index}`} className={`h-9 ${width} rounded-full`} />
        ))}
      </div>
      <div className="space-y-4 px-6 py-6">
        <Skeleton className="h-4 w-36 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-11/12 rounded-full" />
          <Skeleton className="h-3 w-2/3 rounded-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div data-testid="product-detail-skeleton" className="relative">
      <ProductPageHeader
        leading={<Skeleton className="h-9 w-9 rounded-full" />}
        actionClassName="flex flex-wrap items-center justify-end gap-2"
        actions={<HeaderActionsSkeleton />}
      />

      <div className="mx-auto mt-4 grid max-w-5xl gap-6 md:grid-cols-[minmax(220px,260px)_1fr] md:gap-8">
        <div className="mx-auto w-full max-w-[200px] sm:max-w-[240px] md:mx-0 md:max-w-none">
          <Skeleton className="aspect-square w-full rounded-2xl" />
        </div>
        <ProductSummarySkeleton />
      </div>

      <DetailTabsSkeleton />
    </div>
  );
}
