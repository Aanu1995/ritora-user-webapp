"use client";

import { useTranslations } from "next-intl";
import { History, Info } from "lucide-react";
import { RoutineMemoryTree } from "@/components/skin-journal/routine-memory-tree";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ROUTINE_MEMORY_DURATION_OPTIONS,
  RoutineMemoryDurationDay,
  type RoutineMemoryDurationDays,
  type RoutineMemoryProductTimeline,
  type RoutineMemoryResponse,
} from "@/types/routine-memory";

interface RoutineMemoryPanelProps {
  data: RoutineMemoryResponse | null | undefined;
  isLoading?: boolean;
  durationDays?: RoutineMemoryDurationDays;
  onDurationDaysChange?: (days: RoutineMemoryDurationDays) => void;
}

const summaryKeys = [
  "reactionSignalCount",
  "applicationLogCount",
  "productChangeCount",
] as const;

const summaryDot: Record<(typeof summaryKeys)[number], string> = {
  reactionSignalCount: "bg-danger",
  applicationLogCount: "bg-foreground/35",
  productChangeCount: "bg-[color:var(--warning)]",
};

export function RoutineMemoryPanel({
  data,
  durationDays = RoutineMemoryDurationDay.Thirty,
  isLoading = false,
  onDurationDaysChange,
}: RoutineMemoryPanelProps) {
  const t = useTranslations("journal.routineMemory");

  if (isLoading) {
    return <RoutineMemorySkeleton label={t("loadingLabel")} />;
  }

  const productTimelines = data ? resolveProductTimelines(data) : [];
  const hasMemory = Boolean(data) && productTimelines.length > 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            {t("subtitle")}
          </p>
        </div>
        <WindowControl
          durationDays={durationDays}
          onDurationDaysChange={onDurationDaysChange}
        />
      </header>

      {!data || !hasMemory ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--border-strong)] bg-surface px-6 py-16 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-muted text-muted"
          >
            <History className="h-6 w-6" />
          </span>
          <h3 className="mt-5 font-display text-lg font-bold text-foreground">
            {t("emptyTitle")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {t("emptyBody")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {summaryKeys.map((key) => (
              <div key={key} className="px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${summaryDot[key]}`}
                  />
                  <p className="font-display text-2xl font-bold leading-none text-foreground">
                    {data.summary[key]}
                  </p>
                </div>
                <p className="mt-2 text-xs font-medium text-muted">
                  {t(`summary.${key}`)}
                </p>
              </div>
            ))}
          </div>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t("disclaimer")}</span>
          </p>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {t("productTimelineTitle")}
            </h3>
            <RoutineMemoryTree productTimelines={productTimelines} />
          </div>
        </>
      )}
    </section>
  );
}

function WindowControl({
  durationDays,
  onDurationDaysChange,
}: {
  durationDays: RoutineMemoryDurationDays;
  onDurationDaysChange?: (days: RoutineMemoryDurationDays) => void;
}) {
  const t = useTranslations("journal.routineMemory");

  return (
    <div
      aria-label={t("durationLabel")}
      className="inline-flex w-full shrink-0 rounded-full border border-border bg-surface p-1 sm:w-auto"
      role="group"
    >
      {ROUTINE_MEMORY_DURATION_OPTIONS.map((days) => {
        const selected = durationDays === days;
        return (
          <button
            key={days}
            aria-pressed={selected}
            className={`min-h-8 flex-1 rounded-full px-3.5 text-xs font-semibold transition sm:flex-none ${
              selected
                ? "bg-foreground text-background shadow-soft"
                : "text-muted hover:text-foreground"
            }`}
            type="button"
            onClick={() => onDurationDaysChange?.(days)}
          >
            {t(`durationOptions.${days}`)}
          </button>
        );
      })}
    </div>
  );
}

function RoutineMemorySkeleton({ label }: { label: string }) {
  return (
    <section aria-label={label} className="space-y-6">
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-52 rounded-full" />
        <Skeleton className="h-4 w-80 max-w-full rounded-full" />
      </div>
      <Skeleton className="h-[88px] rounded-2xl" />
      <div className="space-y-4">
        {[0, 1].map((card) => (
          <div
            key={card}
            className="space-y-4 rounded-2xl border border-border bg-surface p-5"
          >
            <Skeleton className="h-4 w-44 rounded-full" />
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-4">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function resolveProductTimelines(
  data: RoutineMemoryResponse,
): RoutineMemoryProductTimeline[] {
  if (data.productTimelines) return data.productTimelines;

  const timelines = new Map<string, RoutineMemoryProductTimeline>();
  const suspiciousByProductId = new Map(
    data.suspiciousProducts.map((product) => [product.productId, product]),
  );

  for (const event of data.timeline) {
    const productId = event.product?.productId;
    if (!productId || !event.product) continue;
    const existing = timelines.get(productId);
    const suspicious = suspiciousByProductId.get(productId);
    if (existing) {
      existing.timeline.push(event);
      existing.eventCount = existing.timeline.length;
      continue;
    }
    timelines.set(productId, {
      product: event.product,
      suspicionLevel: suspicious?.suspicionLevel ?? null,
      reasonCodes: suspicious?.reasonCodes ?? [],
      firstUseDate: suspicious?.firstUseDate ?? null,
      lastUseDate: suspicious?.lastUseDate ?? null,
      nearestReactionDate: suspicious?.nearestReactionDate ?? null,
      eventCount: 1,
      timeline: [event],
    });
  }

  for (const suspicious of data.suspiciousProducts) {
    if (timelines.has(suspicious.productId)) continue;
    timelines.set(suspicious.productId, {
      product: {
        productId: suspicious.productId,
        brand: suspicious.brand,
        name: suspicious.name,
        category: suspicious.category,
        imageUrl: suspicious.imageUrl ?? null,
      },
      suspicionLevel: suspicious.suspicionLevel,
      reasonCodes: suspicious.reasonCodes,
      firstUseDate: suspicious.firstUseDate,
      lastUseDate: suspicious.lastUseDate,
      nearestReactionDate: suspicious.nearestReactionDate,
      eventCount: 0,
      timeline: [],
    });
  }

  return Array.from(timelines.values());
}
