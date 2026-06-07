"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import { QueryKey } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import {
  adaptCommunityRoutine,
  getCommunityRoutine,
} from "@/services/community.service";
import { GoalPlaybookEvidence } from "./community-goal-playbook-evidence";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { CommunityOutcomeSignals } from "./community-outcome-signals";
import { SafetyBanner } from "./community-routine-detail-helpers";
import { CommunityRoutineShelfCheck } from "./community-routine-shelf-check";
import type { CommunityAdaptation } from "@/types/community";
import {
  Badge,
  Chip,
  CommunityDetailSkeleton,
  DisclosureBadge,
  MatchBadge,
} from "./community-shared";

export function CommunityRoutineDetailSurface({
  routineId,
  variant = "page",
}: {
  routineId: string;
  variant?: "page" | "sheet";
}) {
  const t = useTranslations("community.routineDetail");
  const tToast = useTranslations("community.toasts");
  const options = useCommunityTranslatedOptions();
  const [adaptation, setAdaptation] = useState<CommunityAdaptation | null>(
    null,
  );
  const query = useQuery({
    queryKey: [QueryKey.CommunityRoutine, routineId],
    queryFn: ({ signal }) => getCommunityRoutine(routineId, signal),
  });
  const adapt = useMutation({
    mutationFn: () => adaptCommunityRoutine(routineId),
    onSuccess: (result) => {
      setAdaptation(result);
      toast.success(tToast("routineAdapted"));
    },
    onError: () => toast.error(tToast("routineAdaptFailed")),
  });
  if (query.isLoading) {
    return <CommunityDetailSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <RetryPanel
        title={t("loadErrorTitle")}
        description={t("loadErrorBody")}
        actionLabel={t("tryAgain")}
        onAction={() => void query.refetch()}
        hideSupportLink
      />
    );
  }

  const routine = query.data;
  const flagged = routine.safetyFlags.length > 0;
  const isSheet = variant === "sheet";

  return (
    <div
      className={cn(
        "space-y-5 motion-safe:animate-in motion-safe:fade-in",
        isSheet ? "pb-8" : "mx-auto max-w-4xl pb-10",
      )}
    >
      {/* Page variant keeps the PageHeader for nav back to
          the community list. Sheet variant skips its own
          title block entirely — the sheet header above
          already shows the routine title as the SheetTitle,
          so re-rendering it here was redundant and made the
          sheet read as "two titles followed by content". */}
      {!isSheet ? (
        <PageHeader
          title={routine.title}
          subtitle={t("subtitle")}
          action={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={AppRoute.Community}>
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToCommunity")}
                </Link>
              </Button>
            </div>
          }
        />
      ) : null}

      {/* === Hero / At-a-glance block ===
          Replaces the previous gradient-background hero that
          packed match + chips + summary + evidence + signals
          + safety into one dense box. Now uses a clean
          neutral surface and stacks meta in clear layers:
            1. Summary (if present) at the top so the user
               immediately reads what this playbook is for.
            2. Meta strip: match score · disclosure · safety
               status — all on one line, the three decision-
               critical facts.
            3. "Why this matches you" labelled chips so the
               relevance reasons are explicitly framed
               (previously they sat next to the match badge
               with no label and read as decoration).
            4. Goal evidence (goals/result/timeframe +
               avoid/habit/warning rows).
            5. Outcome signals row.
            6. Safety banners (only when flagged — the "All
               clear" trophy was visual noise on healthy
               playbooks). */}
      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        {routine.summary ? (
          <p className="break-words text-sm leading-6 text-foreground [overflow-wrap:anywhere]">
            {routine.summary}
          </p>
        ) : null}

        {/* Decision-critical meta strip. Safety status pill
            renders here too — green check when clean, sits
            next to match/disclosure so the user gets the
            three at-a-glance facts in one read. When
            flagged, the safety banners below take over. */}
        <div className="flex flex-wrap items-center gap-2">
          <MatchBadge score={routine.matchScore} />
          <DisclosureBadge value={routine.disclosureType} />
          {!flagged ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-strong">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              {t("safetyScanned")}
            </span>
          ) : null}
        </div>

        {routine.relevanceReasons.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t("matchReasonsLabel")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {routine.relevanceReasons.slice(0, 3).map((reason) => (
                <Chip key={reason}>
                  <Check className="h-3 w-3 text-accent-strong" />
                  {reason}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        <GoalPlaybookEvidence routine={routine} />

        <CommunityOutcomeSignals
          contentId={routine.id}
          contentTitle={routine.title}
          contentType="routine"
          counts={routine.outcomeSignalCounts}
          canSignalOutcome={routine.canSignalOutcome}
        />

        {/* Safety banners only render when there ARE flags.
            The previous "no flags = green trophy banner" felt
            congratulatory for nothing and added visual noise
            on the majority of healthy playbooks. The clean
            state is now signalled by the small green pill in
            the meta strip above — present, but not loud. */}
        {flagged ? (
          <div className="grid gap-2 border-t border-border pt-4">
            {routine.safetyFlags.map((flag) => (
              <SafetyBanner key={flag.code} severity={flag.severity}>
                {flag.message}
              </SafetyBanner>
            ))}
          </div>
        ) : null}
      </section>

      {/* === Routine steps ===
          Previously each step rendered as its own
          rounded-2xl + shadow-soft card. Stacked, this gave
          the steps section a "cards-in-a-card" look that
          fought the rest of the sheet's visual hierarchy.
          Switched to a single bordered container with row
          dividers — every step reads as a row in one
          coherent list, the way numbered routines read in
          print. The number circle keeps its avatar treatment
          but in accent-soft (matches the playbook's identity)
          instead of generic surface-muted, so the eye lands
          on the step number as the row anchor.

          Step header row stacks differently per breakpoint:
            - mobile: name + chips wrap natively
            - sm+: name flexes, chips align right
          This keeps long product names from squeezing the
          category/slot chips off the visible line. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold tracking-tight text-foreground">
            {t("stepsTitle")}
          </h2>
          <Badge tone="muted">
            {t("stepsCount", { count: routine.steps.length })}
          </Badge>
        </div>
        <ol className="overflow-hidden rounded-2xl border border-border bg-surface">
          {routine.steps.map((step, index) => {
            const productLabel =
              [step.productBrand, step.productName]
                .filter(Boolean)
                .join(" ") || t("categoryOnlyStep");
            const categoryLabel =
              labelFromOptions(options.productCategories, step.category) ??
              humaniseCommunityTag(step.category);
            const slotLabel =
              labelFromOptions(options.reviewRoutineSlots, step.slot) ??
              humaniseCommunityTag(step.slot);
            return (
              <li
                key={`${routine.id}-${step.stepOrder}`}
                className={cn(
                  "px-4 py-3",
                  /* Row divider — every step EXCEPT the
                     last carries a bottom border so the
                     list reads as a unified block, not a
                     stack of cards. */
                  index < routine.steps.length - 1 &&
                    "border-b border-border",
                )}
              >
                {/* Single center-aligned row: icon + title
                    block + trailing badges. Using
                    `items-center` so the number circle
                    visually centers with the title text and
                    badges instead of top-aligning (which
                    made the 32px circle float above the
                    ~20px text line).

                    The inner title-and-badges flex uses
                    `flex-col sm:flex-row` so mobile stacks
                    them (title on top, badges below) and
                    sm+ shows them inline, with badges
                    right-aligned. `sm:items-center` keeps
                    everything centered on the desktop row. */}
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent-strong"
                  >
                    {step.stepOrder}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p
                      className="min-w-0 break-words text-sm font-semibold text-foreground [overflow-wrap:anywhere]"
                      title={productLabel}
                    >
                      {productLabel}
                    </p>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <Badge tone="muted">{categoryLabel}</Badge>
                      <Badge tone="muted">{slotLabel}</Badge>
                    </div>
                  </div>
                </div>
                {/* Notes drop below the main row, indented
                    to match the title's left edge (icon
                    width 32px + gap-3 12px = 44px = `ml-11`).
                    Lives OUTSIDE the centered flex so the
                    icon stays centered with the title row
                    even when notes are several lines long —
                    the previous layout put notes inside the
                    centered column which pushed the icon
                    down to vertically center against the
                    full title+notes block. */}
                {step.notes ? (
                  <p className="ml-11 mt-1.5 break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                    {step.notes}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <CommunityRoutineShelfCheck
        adaptation={adaptation}
        isError={adapt.isError}
        isPending={adapt.isPending}
        onCheck={() => adapt.mutate()}
      />
    </div>
  );
}
