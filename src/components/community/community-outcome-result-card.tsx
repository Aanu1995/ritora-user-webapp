"use client";

import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, UserCheck, type LucideIcon } from "lucide-react";
import { parseUtcDate } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type {
  CommunityOutcomeFollowedPart,
  CommunityOutcomeSignalProduct,
  CommunityReviewResult,
} from "@/types/community";
import {
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import {
  isPrimarySignal,
  SIGNAL_ICON_CLASS,
  SIGNAL_META,
} from "./community-outcome-signal-meta";
import { Badge } from "./community-shared";

type CommunityOutcomeResultCardProps = {
  contentType: "routine" | "review";
  item: CommunityReviewResult;
};

export function CommunityOutcomeResultCard({
  contentType,
  item,
}: CommunityOutcomeResultCardProps) {
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
  const matchedPartLabels = item.followedParts.map((part) =>
    getFollowedPartLabel(part, contentType, options),
  );
  /* Render the timestamp as relative time ("3 hours ago",
     "2 days ago", "a year ago") so the recency of evidence
     is immediately legible, matching how RoutineCard and
     ReviewCard display their published dates. The absolute
     date (e.g. "May 30, 2026") is preserved as the `title`
     attribute for hover discovery and as the `dateTime`
     machine-readable value for screen readers / browsers.
     `parseUtcDate` returns a dayjs instance with the
     `relativeTime` plugin already loaded at app bootstrap. */
  const dateInstance = parseUtcDate(item.createdAt);
  const relativeDate = dateInstance?.locale(locale).fromNow() ?? null;
  const absoluteDate = dateInstance?.locale(locale).format("LL");

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
        {relativeDate ? (
          <time
            dateTime={item.createdAt}
            title={absoluteDate}
            className="shrink-0 whitespace-nowrap text-[11px] text-muted"
          >
            {relativeDate}
          </time>
        ) : null}
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
              {formatOutcomeProductLabel(product, options)}
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

function formatOutcomeProductLabel(
  product: CommunityOutcomeSignalProduct,
  options: ReturnType<typeof useCommunityTranslatedOptions>,
) {
  return (
    [product.productBrand, product.productName].filter(Boolean).join(" ") ||
    labelFromOptions(options.productCategories, product.category) ||
    product.category
  );
}

function getFollowedPartLabel(
  part: CommunityOutcomeFollowedPart,
  contentType: "routine" | "review",
  options: ReturnType<typeof useCommunityTranslatedOptions>,
) {
  const primary =
    contentType === "review"
      ? options.reviewOutcomeFollowedParts
      : options.outcomeFollowedParts;
  const fallback =
    contentType === "review"
      ? options.outcomeFollowedParts
      : options.reviewOutcomeFollowedParts;

  return (
    labelFromOptions(primary, part) ?? labelFromOptions(fallback, part) ?? part
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
