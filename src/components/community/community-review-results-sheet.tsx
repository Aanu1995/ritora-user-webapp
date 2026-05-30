"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BadgeCheck,
  RefreshCw,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { listCommunityReviewResults } from "@/services/community.service";
import type {
  CommunityOutcomeSignal,
  CommunityReviewResult,
} from "@/types/community";
import {
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import {
  isPrimarySignal,
  PRIMARY_SIGNALS,
  SIGNAL_ICON_CLASS,
  SIGNAL_META,
  type PrimaryCommunityOutcomeSignal,
} from "./community-outcome-signal-meta";
import { Badge, EmptyState } from "./community-shared";

type CommunityReviewResultsSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  productName?: string;
  reviewId: string;
};

export function CommunityReviewResultsSheet({
  onOpenChange,
  open,
  productName,
  reviewId,
}: CommunityReviewResultsSheetProps) {
  const t = useTranslations("community.outcomeSignals");
  const [signalFilter, setSignalFilter] = useState<CommunityOutcomeSignal | "">(
    "",
  );
  const query = useQuery({
    enabled: open,
    queryKey: [QueryKey.CommunityReviewResults, reviewId, signalFilter],
    queryFn: ({ signal }) =>
      listCommunityReviewResults(reviewId, signalFilter, signal),
  });
  const resultCount = query.data?.items.length ?? 0;
  const showResultCount = Boolean(query.data);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
        <div className="space-y-3 border-b border-border py-4 pl-4 pr-12 sm:pl-6 sm:pr-14">
          <div>
            {productName ? (
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-medium text-muted">
                  {t("resultsTitle")}
                </p>
                {showResultCount ? (
                  <p
                    className="text-[11px] font-medium tabular-nums text-muted"
                    aria-live="polite"
                  >
                    {t("resultsCount", { count: resultCount })}
                  </p>
                ) : null}
              </div>
            ) : null}
            <SheetTitle
              className={cn(
                "block truncate font-display font-bold leading-tight text-foreground",
                productName ? "mt-0.5 text-base" : "text-lg",
              )}
              title={productName}
            >
              {productName ?? t("resultsTitle")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("resultsDescription")}
            </SheetDescription>
          </div>
          <FilterBar
            activeSignal={signalFilter}
            onSignalChange={setSignalFilter}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {query.isLoading ? <ResultsSkeleton /> : null}

          {query.isError ? (
            <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {t("resultsLoadError")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void query.refetch()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("retry")}
                </Button>
              </div>
            </div>
          ) : null}

          {query.data && query.data.items.length === 0 ? (
            <EmptyState
              title={t("resultsEmptyTitle")}
              body={t("resultsEmptyDescription")}
            />
          ) : null}

          {query.data && query.data.items.length > 0 ? (
            <div className="grid gap-2">
              {query.data.items.map((item) => (
                <ReviewResultCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterBar({
  activeSignal,
  onSignalChange,
}: {
  activeSignal: CommunityOutcomeSignal | "";
  onSignalChange: (next: CommunityOutcomeSignal | "") => void;
}) {
  const t = useTranslations("community.outcomeSignals");
  const tShort = useTranslations("community.outcomeSignals.shortLabels");

  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={t("filterLabel")}
    >
      <FilterPill
        active={activeSignal === ""}
        label={t("filterAll")}
        onClick={() => onSignalChange("")}
      />
      {PRIMARY_SIGNALS.map((signal) => (
        <FilterPill
          key={signal}
          active={activeSignal === signal}
          icon={SIGNAL_META[signal].Icon}
          label={tShort(signal)}
          onClick={() => onSignalChange(signal)}
          tone={signal}
        />
      ))}
    </div>
  );
}

function FilterPill({
  active,
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  active: boolean;
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: PrimaryCommunityOutcomeSignal;
}) {
  const activeClass = tone
    ? cn(SIGNAL_ICON_CLASS[SIGNAL_META[tone].tone], "border-transparent")
    : "border-border-strong bg-surface-muted text-foreground";
  const inactiveClass =
    "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition",
        active ? activeClass : inactiveClass,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
      {label}
    </button>
  );
}

function ReviewResultCard({ item }: { item: CommunityReviewResult }) {
  const locale = useLocale();
  const t = useTranslations("community.outcomeSignals");
  const options = useCommunityTranslatedOptions();
  const signalLabel =
    labelFromOptions(options.outcomeSignals, item.signal) ?? item.signal;
  const durationLabel =
    labelFromOptions(options.outcomeTrialDurations, item.trialDuration) ??
    item.trialDuration;
  const irritationLabel =
    labelFromOptions(options.outcomeIrritations, item.irritationLevel) ??
    item.irritationLevel;
  const routineSlotLabel = labelFromOptions(
    options.reviewRoutineSlots,
    item.routineSlot,
  );
  const matchedPartLabels = item.followedParts.map(
    (part) =>
      labelFromOptions(options.reviewOutcomeFollowedParts, part) ??
      labelFromOptions(options.outcomeFollowedParts, part) ??
      part,
  );
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(item.createdAt));

  const meta = isPrimarySignal(item.signal) ? SIGNAL_META[item.signal] : null;
  const SignalIcon: LucideIcon = meta?.Icon ?? BadgeCheck;
  const iconAvatarClass = meta
    ? SIGNAL_ICON_CLASS[meta.tone]
    : "bg-surface-muted text-muted";

  return (
    <article className="rounded-xl border border-border bg-surface p-3 sm:p-3.5">
      <header className="flex items-center gap-2 sm:gap-2.5">
        <span
          aria-hidden
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
            iconAvatarClass,
          )}
        >
          <SignalIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
        <p
          className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
          title={signalLabel}
        >
          {signalLabel}
        </p>
        <time
          dateTime={item.createdAt}
          title={date}
          className="shrink-0 whitespace-nowrap text-[11px] text-muted"
        >
          {date}
        </time>
      </header>

      {item.similarToViewer ? (
        <div className="mt-2">
          <Badge tone="accent">
            <UserCheck className="h-3 w-3" />
            {t("similarToYou")}
          </Badge>
        </div>
      ) : null}

      <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <ResultFact label={t("resultDuration")} value={durationLabel} />
        <ResultFact label={t("resultIrritation")} value={irritationLabel} />
        <ResultFact
          label={t("resultSameGoal")}
          value={item.sameGoal ? t("sameGoalYes") : t("sameGoalNo")}
        />
        {routineSlotLabel ? (
          <ResultFact
            label={t("resultRoutineSlotShort")}
            value={routineSlotLabel}
          />
        ) : null}
      </dl>

      {matchedPartLabels.length > 0 ? (
        <ChipRow label={t("resultMatchedPartsLabel")}>
          {matchedPartLabels.map((label, index) => (
            <ResultChip key={`matched-${index}`}>{label}</ResultChip>
          ))}
        </ChipRow>
      ) : null}

      {item.usedWithProducts.length > 0 ? (
        <ChipRow label={t("resultUsedWithLabel")}>
          {item.usedWithProducts.map((product, index) => (
            <ResultChip key={`used-${index}`}>
              {[product.productBrand, product.productName]
                .filter(Boolean)
                .join(" ") || product.category}
            </ResultChip>
          ))}
        </ChipRow>
      ) : null}

      {item.note ? (
        <blockquote className="mt-2.5 rounded-lg border border-accent/20 bg-surface-muted px-3 py-2 text-sm leading-6 text-foreground">
          {item.note}
        </blockquote>
      ) : null}
    </article>
  );
}

function ResultFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}

function ChipRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      {children}
    </div>
  );
}

function ResultChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-busy className="grid gap-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-border p-3 sm:p-3.5"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full sm:h-8 sm:w-8" />
            <Skeleton className="h-4 min-w-0 flex-1 rounded-md" />
            <Skeleton className="h-3 w-16 shrink-0 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-3 w-full rounded-md" />
          <Skeleton className="mt-1.5 h-3 w-2/3 rounded-md" />
        </div>
      ))}
    </div>
  );
}
