"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Flag, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
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
    <article className="rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {routine.title}
            </h3>
            <MatchBadge score={routine.matchScore} />
            <DisclosureBadge value={routine.disclosureType} />
          </div>
          {routine.summary ? (
            <p className="mt-1.5 text-xs leading-5 text-muted">
              {routine.summary}
            </p>
          ) : null}
          {(routine.relevanceReasons.length > 0 ||
            routine.safetyFlags.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {routine.relevanceReasons.slice(0, 4).map((reason) => (
                <Chip key={reason}>{reason}</Chip>
              ))}
              {routine.safetyFlags.map((flag) => (
                <SafetyChip key={flag.code} severity={flag.severity}>
                  {flag.message}
                </SafetyChip>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 md:shrink-0">
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
            disabled={report.isPending}
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
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3 text-[11px]">
          {routine.steps.slice(0, 5).map((step) => (
            <span
              key={`${routine.id}-${step.stepOrder}`}
              className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5"
            >
              <span className="font-semibold text-foreground">
                {step.stepOrder}.
              </span>
              <span className="text-muted">
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
      />
    </article>
  );
}

export function ReviewCard({ review }: { review: CommunityReview }) {
  const t = useTranslations("community.cards");
  const tToast = useTranslations("community.toasts");
  const options = useCommunityTranslatedOptions();
  const report = useMutation({
    mutationFn: () => reportCommunityReview(review.id, "unsafe_advice"),
    onSuccess: () => toast.success(tToast("reportSubmitted")),
    onError: () => toast.error(tToast("reportFailed")),
  });

  return (
    <article className="rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {review.productBrand} {review.productName}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {labelFromOptions(options.productCategories, review.productCategory) ??
              humaniseCommunityTag(review.productCategory)}
          </p>
        </div>
        <MatchBadge score={review.matchScore} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <DisclosureBadge value={review.disclosureType} />
        {review.outcomes.map((outcome) => (
          <OutcomeChip key={outcome} value={outcome} />
        ))}
      </div>
      <ReviewEvidenceSummary review={review} />
      {review.body ? (
        <p className="mt-2 text-xs leading-5 text-foreground line-clamp-3">
          {review.body}
        </p>
      ) : null}
      {review.routineContext.length > 0 ? (
        <p className="mt-2 text-[11px] leading-5 text-muted">
          <span className="font-semibold text-foreground">{t("context")} </span>
          {review.routineContext
            .map((item) => item.productName ?? item.category)
            .map(
              (value) =>
                labelFromOptions(options.productCategories, value) ??
                humaniseCommunityTag(value),
            )
            .join(" · ")}
        </p>
      ) : null}
      <CommunityOutcomeSignals
        contentId={review.id}
        contentType="review"
        counts={review.outcomeSignalCounts}
      />
      <div className="mt-3 flex justify-end">
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
      </div>
    </article>
  );
}
