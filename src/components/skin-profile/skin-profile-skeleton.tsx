import { Skeleton } from "@/components/ui/skeleton";

type SkinProfileSkeletonMode =
  | "generic"
  | "onboarding"
  | "overview"
  | "section"
  | "active-tolerance-section"
  | "reaction-section";

interface SkinProfileSkeletonProps {
  mode?: SkinProfileSkeletonMode;
}

const CHIP_WIDTHS = ["w-16", "w-20", "w-24", "w-14", "w-28"] as const;
const OVERVIEW_VALUE_WIDTHS = [
  "w-24",
  "w-20",
  "w-52",
  "w-36",
  "w-48",
  "w-40",
  "w-32",
] as const;

export function SkinProfileSaveActionSkeleton() {
  return <Skeleton className="h-8 w-20 rounded-full" />;
}

export function SkinProfileSkeleton({
  mode = "onboarding",
}: SkinProfileSkeletonProps) {
  if (mode === "overview") {
    return <OverviewSkeleton />;
  }

  if (mode === "section") {
    return <SectionSkeleton />;
  }

  if (mode === "active-tolerance-section") {
    return <ActiveToleranceSectionSkeleton />;
  }

  if (mode === "reaction-section") {
    return <ReactionSectionSkeleton />;
  }

  return <OnboardingSkeleton mode={mode === "generic" ? "onboarding" : mode} />;
}

function OnboardingSkeleton({ mode }: { mode: "onboarding" }) {
  return (
    <div
      data-testid="skin-profile-skeleton"
      data-skeleton-mode={mode}
      className="mx-auto max-w-3xl scroll-mt-32"
    >
      <div
        data-testid="skin-profile-skeleton-sticky-actions"
        className="sticky top-[88px] z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          <div className="mt-3 min-w-0 flex-1">
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-1 flex-1 rounded-full" />
              ))}
            </div>
            <Skeleton className="mt-2 h-3 w-20 rounded-full" />
          </div>
          <div className="flex shrink-0 items-start gap-2 pl-16">
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-5">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-2 h-3.5 w-4/5" />
        </div>

        <div className="divide-y divide-border px-6">
          <ChipFieldRow widths={["w-16", "w-20", "w-28", "w-24"]} />
          <ChipFieldRow widths={["w-20", "w-24", "w-16", "w-28"]} />
          <BirthdayFieldRow />
          <ChipFieldRow widths={["w-20", "w-24", "w-28"]} />
          <ChipFieldRow widths={["w-24", "w-28", "w-20", "w-32"]} />
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div
      data-testid="skin-profile-skeleton"
      data-skeleton-mode="overview"
      className="mx-auto max-w-2xl space-y-6"
    >
      <div
        data-testid="skin-profile-skeleton-completeness"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
      </div>

      <div data-testid="skin-profile-skeleton-essentials">
        <SectionHeadingSkeleton />
        <div className="rounded-2xl border border-border bg-surface px-5">
          {OVERVIEW_VALUE_WIDTHS.map((width, index) => (
            <OverviewRowSkeleton key={index} valueWidth={width} />
          ))}
        </div>
      </div>

      <div data-testid="skin-profile-skeleton-optional">
        <SectionHeadingSkeleton />
        <div className="space-y-2.5">
          {Array.from({ length: 5 }, (_, index) => (
            <OptionalCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent-soft/50 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-7 w-7 flex-none rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div
      data-testid="skin-profile-skeleton"
      data-skeleton-mode="section"
      className="mx-auto mt-6 max-w-3xl"
    >
      <div className="space-y-1 divide-y divide-border rounded-2xl border border-border bg-surface px-5">
        {Array.from({ length: 6 }, (_, index) => (
          <SectionQuestionSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function ActiveToleranceSectionSkeleton() {
  return (
    <div
      data-testid="skin-profile-skeleton"
      data-skeleton-mode="active-tolerance-section"
      className="mx-auto mt-6 max-w-3xl"
    >
      <Skeleton className="mb-3 h-3 w-3/4 rounded-full" />
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <Skeleton className="h-3.5 w-32" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CHIP_WIDTHS.slice(0, 4).map((width, chipIndex) => (
                <Skeleton
                  key={`${index}-${chipIndex}`}
                  className={`h-7 rounded-full ${width}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReactionSectionSkeleton() {
  return (
    <div
      data-testid="skin-profile-skeleton"
      data-skeleton-mode="reaction-section"
      className="mx-auto mt-6 max-w-5xl"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ReactionColumnSkeleton />
        <ReactionColumnSkeleton withForm />
      </div>
    </div>
  );
}

function ChipFieldRow({ widths }: { widths: readonly string[] }) {
  return (
    <div data-testid="skin-profile-skeleton-field-row" className="py-5">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="mt-1.5 h-3 w-2/3" />
      <div className="mt-3 flex flex-wrap gap-2.5">
        {widths.map((width, index) => (
          <Skeleton key={index} className={`h-10 rounded-full ${width}`} />
        ))}
      </div>
    </div>
  );
}

function BirthdayFieldRow() {
  return (
    <div data-testid="skin-profile-skeleton-field-row" className="py-5">
      <Skeleton className="h-3.5 w-28" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="mb-3 px-1">
      <div className="flex items-baseline justify-between gap-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="mt-1 h-3 w-2/3" />
    </div>
  );
}

function OverviewRowSkeleton({ valueWidth }: { valueWidth: string }) {
  return (
    <div className="flex items-start justify-between border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className={`mt-2 h-5 ${valueWidth}`} />
      </div>
      <Skeleton className="ml-4 mt-1 h-4 w-10 shrink-0" />
    </div>
  );
}

function OptionalCardSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-56 max-w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
    </div>
  );
}

function SectionQuestionSkeleton() {
  return (
    <div
      data-testid="skin-profile-skeleton-section-row"
      className="space-y-3 py-5"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-44" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CHIP_WIDTHS.map((width, index) => (
          <Skeleton key={index} className={`h-7 rounded-full ${width}`} />
        ))}
      </div>
    </div>
  );
}

function ReactionColumnSkeleton({ withForm = false }: { withForm?: boolean }) {
  return (
    <div data-testid="skin-profile-skeleton-reaction-column">
      <Skeleton className="mb-2 h-3 w-16" />
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between pb-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        {withForm ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex flex-wrap gap-1.5">
              {CHIP_WIDTHS.slice(0, 4).map((width, index) => (
                <Skeleton key={index} className={`h-7 rounded-full ${width}`} />
              ))}
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          <Skeleton className="h-16 w-full rounded-lg" />
        )}
      </div>
    </div>
  );
}
