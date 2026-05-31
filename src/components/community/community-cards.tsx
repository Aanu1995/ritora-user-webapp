"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, GitBranch, ListOrdered, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommunityReview, CommunityRoutine } from "@/types/community";
import { PublishedDateBadge } from "./community-card-date-badge";
import { GoalPlaybookEvidence } from "./community-goal-playbook-evidence";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { CommunityOutcomeSignals } from "./community-outcome-signals";
import { CommunityRoutineDetailSheet } from "./community-routine-detail-sheet";
import {
  Chip,
  DisclosureBadge,
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

/* === Content-type avatar ===
   Small tone-coded icon circle that sits at the start of
   each feed card so the user can tell "Playbook" from
   "Review" at a glance — without reading the title or any
   chip. Uses the same icon vocabulary as the Mine tab's
   submission cards (`Star` for review, `GitBranch` for
   routine) so the visual language is consistent across
   the app. */
function CardTypeAvatar({
  type,
  label,
}: {
  type: "review" | "routine";
  label: string;
}) {
  const Icon = type === "review" ? Star : GitBranch;
  /* Tone classes match the Mine tab's TYPE_META:
       review  → accent-soft / accent-strong (positive
                 evaluation tone)
       routine → ai-bg / ai-strong (structured guidance tone) */
  const toneClass =
    type === "review"
      ? "bg-accent-soft text-accent-strong"
      : "bg-ai-bg text-ai-strong";
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        toneClass,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

export function RoutineCard({ routine }: { routine: CommunityRoutine }) {
  const t = useTranslations("community.cards");
  const options = useCommunityTranslatedOptions();
  const [detailOpen, setDetailOpen] = useState(false);

  /* Card carries enough decision-relevant info that a user
     can judge "is this playbook worth opening?" without
     clicking through. Layer order (top → bottom):
       1. Header: title + match + disclosure + View action.
       2. Summary: one-line value prop.
       3. Safety flag chips (when present) — critical warnings
          surface first so they're never buried.
       4. Goal evidence block: goal tags, claimed result,
          timeframe, avoid/habit/warning tag rows. This is
          the meat of "what is this routine for and what
          should I know going in".
       5. Step strip: numbered category chips so the shape
          of the routine is visible at a glance.
       6. Community outcome signals: social proof, the
          ultimate "did this work for others like me?" input.

     Each layer is bounded by tight spacing/dividers so the
     card stays scannable even with all the layers stacked.
     The detail sheet still owns the *deep* per-step info
     (slots, notes, per-product details) and the full,
     untruncated tag lists — but the card itself has enough
     surface to make a decision. */
  return (
    <>
      <article
        id={`community-routine-${routine.id}`}
        className="scroll-mt-24 min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 transition target:border-accent target:bg-accent-soft/30 target:ring-2 target:ring-accent/30 hover:border-border-strong"
      >
        {/* Type avatar sits at the start of the card so the
            user instantly recognizes "this is a Playbook"
            vs "this is a Review" without reading anything.
            The avatar + title block + actions live in a
            single flex row at the top of the article. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <CardTypeAvatar type="routine" label={t("typePlaybook")} />
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
              {/* Relevance reasons + safety flag chips share
                one wrap row. Reasons answer "why we're
                showing this to you" (matches dry skin,
                barrier focus, etc.); safety flags carry the
                severity warnings. Limited to the top 4
                reasons so a noisy match doesn't blow up
                vertical space; the detail sheet shows the
                full set. */}
              {(routine.relevanceReasons.length > 0 ||
                routine.safetyFlags.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {routine.relevanceReasons.slice(0, 4).map((reason) => (
                    <Chip
                      key={reason}
                      className="max-w-full truncate"
                      title={reason}
                    >
                      {reason}
                    </Chip>
                  ))}
                  {routine.safetyFlags.map((flag) => (
                    <SafetyChip key={flag.code} severity={flag.severity}>
                      <span
                        className="max-w-full truncate"
                        title={flag.message}
                      >
                        {flag.message}
                      </span>
                    </SafetyChip>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <PublishedDateBadge createdAt={routine.createdAt} />
            <Button size="sm" onClick={() => setDetailOpen(true)}>
              <BookOpen className="h-4 w-4" />
              {t("viewPlaybook")}
            </Button>
          </div>
        </div>

        {/* Goal / result / timeframe + avoid/habit/warning
            tag rows. Stays on the card because these are the
            primary "is this for me, is this safe for me"
            data points. The detail sheet renders the same
            block with the same component for consistency. */}
        <GoalPlaybookEvidence routine={routine} />

        {/* Step strip — numbered chips so the shape of the
            routine is visible at a glance ("cleanser → serum
            → moisturizer → spf"). Each chip shows the
            product name + category if available, otherwise
            just the category. The detail sheet renders the
            full per-step layout (slot, notes, full product
            details).

            The "Routine steps" label sits at the start of
            the row using the same icon+label pattern as the
            TagRows above (`Avoided`, `Habits`, `Warnings`)
            so the row reads as a labelled group, not an
            anonymous chip pile. Without the label the
            numbered chips required users to mentally infer
            "what is this row?" from context. */}
        {routine.steps.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-[11px]">
            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-muted">
              <ListOrdered className="h-3 w-3" aria-hidden />
              {t("routineStepsLabel")}
            </span>
            {routine.steps.slice(0, 5).map((step) => (
              <span
                key={`${routine.id}-${step.stepOrder}`}
                className="inline-flex max-w-full shrink-0 items-center gap-1 truncate rounded-md bg-surface-muted px-2 py-0.5"
              >
                <span className="font-semibold text-foreground">
                  {step.stepOrder}.
                </span>
                <span
                  className="truncate text-foreground"
                  title={routineStepProductLabel(
                    step,
                    options.productCategories,
                  )}
                >
                  {routineStepProductLabel(step, options.productCategories)}
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
          contentTitle={routine.title}
          contentType="routine"
          counts={routine.outcomeSignalCounts}
          canSignalOutcome={routine.canSignalOutcome}
        />
      </article>
      {detailOpen ? (
        <CommunityRoutineDetailSheet
          open={detailOpen}
          routineId={routine.id}
          routineTitle={routine.title}
          onOpenChange={setDetailOpen}
        />
      ) : null}
    </>
  );
}

/* Step label resolver. Prefer the explicit "{brand}
   {productName}" if the author shared one, otherwise fall
   back to the translated category label. We never show
   raw category slugs to the user — `humaniseCommunityTag`
   covers the case where a category exists in the data but
   not in the translations table. */
function routineStepProductLabel(
  step: CommunityRoutine["steps"][number],
  productCategories: ReturnType<
    typeof useCommunityTranslatedOptions
  >["productCategories"],
): string {
  const categoryLabel =
    labelFromOptions(productCategories, step.category) ??
    humaniseCommunityTag(step.category);
  const productLabel = [step.productBrand, step.productName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return productLabel ? `${productLabel} · ${categoryLabel}` : categoryLabel;
}

export function ReviewCard({ review }: { review: CommunityReview }) {
  const t = useTranslations("community.cards");
  const options = useCommunityTranslatedOptions();
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
    review.routineContextUsage === "with_products" && contextLabels.length > 0
      ? t("context")
      : review.routineContextUsage === "used_alone"
        ? t("usedAloneContextLabel")
        : review.routineContextUsage === "not_sure"
          ? t("notSureContextLabel")
          : null;
  const showContextChips =
    review.routineContextUsage === "with_products" && contextLabels.length > 0;

  return (
    <article
      id={`community-review-${review.id}`}
      className="scroll-mt-24 min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 transition target:border-accent target:bg-accent-soft/30 target:ring-2 target:ring-accent/30 hover:border-border-strong"
    >
      {/* Type avatar prefixes the title block so users
          recognize "this is a Review" at a glance — paired
          to the Playbook avatar on routine cards so the two
          card types are visually distinct in mixed feeds. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CardTypeAvatar type="review" label={t("typeReview")} />
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-display text-base font-bold leading-tight tracking-tight text-foreground">
              {review.productBrand} {review.productName}
            </h3>
            <p className="mt-1 text-xs text-muted">{categoryLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:shrink-0 sm:justify-end">
          <PublishedDateBadge createdAt={review.createdAt} />
          <MatchBadge score={review.matchScore} />
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
