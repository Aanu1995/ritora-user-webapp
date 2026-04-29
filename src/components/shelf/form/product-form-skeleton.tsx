import type { ReactNode } from 'react';
import { ProductPageHeader } from '../product-page-header';
import { Skeleton } from '@/components/ui/skeleton';

type ProductFormSkeletonMode = 'create' | 'edit';

type ProductFormSkeletonProps = {
  mode: ProductFormSkeletonMode;
};

const BASIC_FIELD_WIDTHS = ['w-28', 'w-32', 'w-24'] as const;
const ABOUT_FIELD_HEIGHTS = ['h-28', 'h-16', 'h-16'] as const;
const USER_FIELD_WIDTHS = ['w-full', 'w-full', 'w-full', 'w-full'] as const;
const MANUFACTURER_FIELD_WIDTHS = [
  'w-full',
  'w-full',
  'w-full',
  'w-full',
] as const;

function FieldSkeleton({ labelWidth }: { labelWidth: string }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={`h-2.5 ${labelWidth} rounded-full`} />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

function SectionShell({
  children,
  testId,
}: {
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section
      data-testid={testId}
      className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
    >
      {children}
    </section>
  );
}

function SectionHeaderSkeleton() {
  return (
    <div className="mb-5 space-y-2">
      <Skeleton className="h-4 w-40 rounded-full" />
      <Skeleton className="h-3 w-64 max-w-full rounded-full" />
    </div>
  );
}

function QuickLookupSkeleton() {
  return (
    <section
      data-testid="product-form-skeleton-lookup"
      className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-44 rounded-full" />
          <Skeleton className="h-3 w-72 max-w-full rounded-full" />
          <Skeleton className="h-3 w-56 max-w-full rounded-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </section>
  );
}

function IdentitySectionSkeleton() {
  return (
    <SectionShell testId="product-form-skeleton-identity">
      <SectionHeaderSkeleton />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {BASIC_FIELD_WIDTHS.map((width) => (
            <FieldSkeleton key={width} labelWidth={width} />
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function AboutSectionSkeleton() {
  return (
    <SectionShell>
      <SectionHeaderSkeleton />
      <div className="grid gap-4">
        {ABOUT_FIELD_HEIGHTS.map((height, index) => (
          <div key={`${height}-${index}`} className="space-y-1.5">
            <Skeleton className="h-2.5 w-28 rounded-full" />
            <Skeleton className={`${height} w-full rounded-xl`} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function UserFieldsSectionSkeleton() {
  return (
    <SectionShell>
      <SectionHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2">
        {USER_FIELD_WIDTHS.map((width, index) => (
          <FieldSkeleton key={`${width}-${index}`} labelWidth="w-28" />
        ))}
      </div>
    </SectionShell>
  );
}

function GuidanceSectionSkeleton() {
  return (
    <SectionShell testId="product-form-skeleton-guidance">
      <SectionHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2">
        <FieldSkeleton labelWidth="w-32" />
        <FieldSkeleton labelWidth="w-24" />
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-surface-muted p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </SectionShell>
  );
}

function ManufacturerSectionSkeleton() {
  return (
    <SectionShell>
      <SectionHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2">
        {MANUFACTURER_FIELD_WIDTHS.map((width, index) => (
          <FieldSkeleton key={`${width}-${index}`} labelWidth="w-32" />
        ))}
      </div>
    </SectionShell>
  );
}

function ProductFormBodySkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <IdentitySectionSkeleton />
      <AboutSectionSkeleton />
      <UserFieldsSectionSkeleton />
      <GuidanceSectionSkeleton />
      <ManufacturerSectionSkeleton />
    </div>
  );
}

export function ProductFormSkeleton({ mode }: ProductFormSkeletonProps) {
  return (
    <div
      data-testid="product-form-skeleton"
      data-skeleton-mode={mode}
      className="relative"
    >
      <ProductPageHeader
        leading={<Skeleton className="h-9 w-9 rounded-full" />}
        title=""
        actions={<Skeleton className="h-9 w-24 rounded-full" />}
      />

      <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-6">
        {mode === 'create' ? <QuickLookupSkeleton /> : null}
        <ProductFormBodySkeleton />
      </div>
    </div>
  );
}
