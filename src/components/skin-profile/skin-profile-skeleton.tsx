import { Skeleton } from "@/components/ui/skeleton";

const OVERVIEW_ROW_WIDTHS = [
  "w-32",
  "w-full",
  "w-3/5",
  "w-4/5",
  "w-28",
  "w-2/3",
] as const;

const CHIP_WIDTHS = [
  "w-20",
  "w-28",
  "w-24",
  "w-16",
] as const;

type SkinProfileSkeletonMode = "generic" | "overview";

interface SkinProfileSkeletonProps {
  mode?: SkinProfileSkeletonMode;
}

export function SkinProfileSkeleton({
  mode = "generic",
}: SkinProfileSkeletonProps) {
  if (mode === "overview") {
    return (
      <div data-testid="skin-profile-skeleton" className="mx-auto max-w-xl">
        {OVERVIEW_ROW_WIDTHS.map((valueWidth, index) => (
          <div
            key={index}
            className="flex items-start justify-between border-b border-border py-4 last:border-b-0"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className={`h-4 ${valueWidth}`} />
            </div>
            <Skeleton className="ml-4 mt-1 h-4 w-10 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div data-testid="skin-profile-skeleton" className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 gap-1.5">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-1 flex-1 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-3 w-20 shrink-0" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-7 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="flex flex-wrap gap-2">
            {CHIP_WIDTHS.map((width, index) => (
              <Skeleton key={index} className={`h-10 rounded-full ${width}`} />
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
