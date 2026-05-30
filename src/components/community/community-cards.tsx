"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Flag, Quote, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { parseUtcDate, utcNow } from "@/lib/dayjs";
import {
  reportCommunityReview,
  reportCommunityRoutine,
} from "@/services/community.service";
import type { CommunityReview, CommunityRoutine } from "@/types/community";
import { GoalPlaybookEvidence } from "./community-goal-playbook-evidence";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { CommunityOutcomeSignals } from "./community-outcome-signals";
import {
  Badge,
  Chip,
  DisclosureBadge,
  InlineSpinner,
  MatchBadge,
  OutcomeChip,
  SafetyChip,
} from "./community-shared";
import { ReviewEvidenceSummary } from "./community-review-evidence";

export function SectionTitle({
  action,
  count,
  icon,
  title,
}: {
  action?: ReactNode;
  count?: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-foreground [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-accent">
        {icon}
        {title}
      </h2>
      <div className="flex shrink-0 items-center gap-2">
        {count ? (
          <span className="text-xs font-medium text-muted">{count}</span>
        ) : null}
        {action}
      </div>
    </div>
  );
}

export function RoutineCard({ routine }: { routine: CommunityRoutine }) {
  const t = useTranslations("community.cards");
  const tToast = useTranslations("community.toasts");
  const options = useCommunityTranslatedOptions();
  const report = useMutation({
    mutationFn: () => reportCommunityRoutine(routine.id, "unsafe_advice"),
    onSuccess: () => toast.success(tToast("reportSubmitted")),
    onError: () => toast.error(tToast("reportFailed")),
  });

  return (
    <article
      id={`community-routine-${routine.id}`}
      className="scroll-mt-24 min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 transition target:border-accent target:bg-accent-soft/30 target:ring-2 target:ring-accent/30 hover:border-border-strong"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-display text-base font-bold leading-tight tracking-tight text-foreground">
              {routine.title}
            </h3>
            <MatchBadge score={routine.matchScore} />
            <DisclosureBadge value={routine.disclosureType} />
          </div>
          {routine.summary ? (
            <p className="mt-1.5 break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">
              {routine.summary}
            </p>
          ) : null}
          {(routine.relevanceReasons.length > 0 ||
            routine.safetyFlags.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {routine.relevanceReasons.slice(0, 4).map((reason) => (
                <Chip key={reason} className="max-w-full truncate" title={reason}>
                  {reason}
                </Chip>
              ))}
              {routine.safetyFlags.map((flag) => (
                <SafetyChip key={flag.code} severity={flag.severity}>
                  <span className="max-w-full truncate" title={flag.message}>
                    {flag.message}
                  </span>
                </SafetyChip>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button asChild size="sm">
            <Link href={`${AppRoute.Community}/routines/${routine.id}`}>
              <Wand2 className="h-4 w-4" />
              {t("adapt")}
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => report.mutate()}
            disabled={report.isPending || !routine.canReportContent}
            aria-label={t("reportRoutine")}
          >
            {report.isPending ? (
              <InlineSpinner />
            ) : (
              <Flag className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <GoalPlaybookEvidence routine={routine} />
      {routine.steps.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-[11px]">
          {routine.steps.slice(0, 5).map((step) => (
            <span
              key={`${routine.id}-${step.stepOrder}`}
              className="inline-flex max-w-full shrink-0 items-center gap-1 truncate rounded-md bg-surface-muted px-2 py-0.5"
            >
              <span className="font-semibold text-foreground">
                {step.stepOrder}.
              </span>
              <span className="truncate text-muted">
                {labelFromOptions(options.productCategories, step.category) ??
                  humaniseCommunityTag(step.category)}
              </span>
            </span>
          ))}
          {routine.steps.length > 5 ? (
            <span className="text-[11px] font-medium text-muted">
              {t("moreSteps", { count: routine.steps.length - 5 })}
            </span>
          ) : null}
        </div>
      ) : null}
      <CommunityOutcomeSignals
        contentId={routine.id}
        contentType="routine"
        counts={routine.outcomeSignalCounts}
        canSignalOutcome={routine.canSignalOutcome}
      />
    </article>
  );
}

export function ReviewCard({ review }: { review: CommunityReview }) {
  const t = useTranslations("community.cards");
  const tToast = useTranslations("community.toasts");
  const locale = useLocale();
  const options = useCommunityTranslatedOptions();
  const report = useMutation({
    mutationFn: () => reportCommunityReview(review.id, "unsafe_advice"),
    onSuccess: () => toast.success(tToast("reportSubmitted")),
    onError: () => toast.error(tToast("reportFailed")),
  });
  const categoryLabel =
    labelFromOptions(options.productCategories, review.productCategory) ??
    humaniseCommunityTag(review.productCategory);
  const contextLabels = review.routineContext.map((item) => {
    const value = item.productName ?? item.category;
    return (
      labelFromOptions(options.productCategories, value) ??
      humaniseCommunityTag(value)
    );
  });
  const contextDisplayLabel: string | null =
    review.routineContextUsage === "with_products" &&
    contextLabels.length > 0
      ? t("context")
      : review.routineContextUsage === "used_alone"
        ? t("usedAloneContextLabel")
        : review.routineContextUsage === "not_sure"
          ? t("notSureContextLabel")
          : null;
  const showContextChips =
    review.routineContextUsage === "with_products" &&
    contextLabels.length > 0;
  const publishedDate = parseUtcDate(review.createdAt);
  const publishedRelative = publishedDate
    ? publishedDate.locale(locale).fromNow()
    : null;
  const publishedAbsolute = publishedDate
    ? publishedDate.locale(locale).format("LL")
    : undefined;
  const isRecentReview =
    publishedDate !== null &&
    publishedDate.isAfter(utcNow().subtract(30, "day"));

  return (
    <article
      id={`community-review-${review.id}`}
      className="scroll-mt-24 min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 transition target:border-accent target:bg-accent-soft/30 target:ring-2 target:ring-accent/30 hover:border-border-strong"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-base font-bold leading-tight tracking-tight text-foreground">
            {review.productBrand} {review.productName}
          </h3>
          <p className="mt-1 text-xs text-muted">{categoryLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:shrink-0 sm:justify-end">
          {publishedRelative ? (
            <Badge tone={isRecentReview ? "accent" : "muted"}>
              <Clock className="h-3 w-3" />
              <time
                dateTime={review.createdAt}
                title={publishedAbsolute}
                className="whitespace-nowrap"
              >
                {publishedRelative}
              </time>
            </Badge>
          ) : null}
          <MatchBadge score={review.matchScore} />
          {review.canReportContent ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => report.mutate()}
              disabled={report.isPending}
              aria-label={t("reportReview")}
            >
              {report.isPending ? (
                <InlineSpinner />
              ) : (
                <Flag className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <DisclosureBadge value={review.disclosureType} />
        {review.outcomes.map((outcome) => (
          <OutcomeChip key={outcome} value={outcome} />
        ))}
      </div>

      <ReviewEvidenceSummary review={review} />

      {review.body ? (
        <blockquote className="mt-3 flex min-w-0 gap-3 rounded-xl border border-accent/20 bg-surface-muted px-4 py-3">
          <Quote
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong"
          />
          <p className="min-w-0 break-words text-sm leading-relaxed text-foreground line-clamp-4 [overflow-wrap:anywhere]">
            {review.body}
          </p>
        </blockquote>
      ) : null}

      {contextDisplayLabel ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted">
            {contextDisplayLabel}
          </span>
          {showContextChips
            ? contextLabels.map((label, index) => (
                <span
                  key={`${review.id}-context-${index}`}
                  title={label}
                  className="inline-flex max-w-full items-center truncate rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground"
                >
                  {label}
                </span>
              ))
            : null}
        </div>
      ) : null}

      <CommunityOutcomeSignals
        contentId={review.id}
        contentTitle={`${review.productBrand} ${review.productName}`.trim()}
        contentType="review"
        counts={review.outcomeSignalCounts}
        canSignalOutcome={review.canSignalOutcome}
      />
    </article>
  );
}
