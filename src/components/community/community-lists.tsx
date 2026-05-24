"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Flag,
  GitBranch,
  Lock,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wand2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { cn } from "@/lib/utils";
import {
  reportCommunityReview,
  reportCommunityRoutine,
} from "@/services/community.service";
import type {
  CommunityHome,
  CommunityReview,
  CommunityRoutine,
} from "@/types/community";
import {
  Chip,
  DisclosureBadge,
  EmptyState,
  InlineSpinner,
  MatchBadge,
  OutcomeChip,
  SafetyChip,
  type CommunityTab,
} from "./community-shared";

/* ===========================================================
 * Facet strip — replaces the old hero card. A single low-key
 * row that says "ranked for you" and lists what we're matching
 * against. Privacy detail lives behind a tiny "What does this
 * mean?" disclosure so it doesn't dominate the page.
 * ========================================================= */

export function FacetStrip({ data }: { data: CommunityHome }) {
  const [open, setOpen] = useState(false);
  const facets = data.profileFacets;
  const pills = [
    facets.skinType,
    facets.sensitivityLevel,
    facets.skinToneRange,
    facets.climateBucket,
    facets.routinePace,
    ...facets.concernTags.slice(0, 3),
  ].filter(Boolean);

  if (pills.length === 0) {
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground">
          Complete your skin profile for better matching. We&apos;ll start
          surfacing routines that fit you specifically.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-muted">
          <UserCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
          Matching
        </span>
        <div className="flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
            >
              {pill}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted transition hover:text-foreground"
        >
          <Lock className="h-3 w-3" aria-hidden />
          Privacy
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>
      {open ? (
        <p className="mt-2 max-w-3xl rounded-md bg-surface-muted/60 px-3 py-2 text-[11px] leading-5 text-muted">
          Only the facets above are used to rank community content for you.
          Your email, exact location, photos, medical context and private
          notes stay private.
        </p>
      ) : null}
    </div>
  );
}

/* ===========================================================
 * Sticky tab bar.
 *
 * Sits right beneath the (already-sticky) PageHeader using a
 * matching `top-` offset so the two-row sticky stack reads as a
 * single page chrome unit while content scrolls underneath.
 * ========================================================= */

export function CommunityTabs({
  active,
  onChange,
}: {
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}) {
  const tabs: Array<[CommunityTab, string, ReactNode]> = [
    ["for-you", "For you", <Sparkles key="i" className="h-4 w-4" />],
    ["people", "People like me", <Users key="i" className="h-4 w-4" />],
    ["routines", "Routines", <GitBranch key="i" className="h-4 w-4" />],
    ["reviews", "Reviews", <Star key="i" className="h-4 w-4" />],
    ["publish", "Share", <TrendingUp key="i" className="h-4 w-4" />],
    ["submissions", "Mine", <UserCheck key="i" className="h-4 w-4" />],
    ["trust", "Warnings", <AlertTriangle key="i" className="h-4 w-4" />],
  ];

  return (
    <div
      // -mx + matching px so the fade-on-scroll background bleeds across
      // the section padding and the sticky offset clears the page header.
      className="sticky top-14 z-[9] -mx-4 mt-3 bg-background/95 px-4 pt-1 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:top-[88px] sm:px-6 sm:pt-2 lg:-mx-8 lg:px-8"
    >
      <nav
        role="tablist"
        aria-label="Community sections"
        className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 shadow-soft"
      >
        {tabs.map(([key, label, icon]) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:text-sm",
                isActive
                  ? "bg-accent-soft text-accent-strong"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ===========================================================
 * For-you view — denser than before.
 *
 * Dropped the 3 redundant entry-tiles (the tab bar already has
 * People / Routines / Warnings). Dropped the gradient info
 * note. Patterns now render as a tight inline list, not a
 * 3-card grid. Routine and review previews still appear but
 * use the compact card variants.
 * ========================================================= */

export function ForYou({
  data,
}: {
  data: CommunityHome;
  /**
   * Accepted but unused — kept so the call site doesn't have to change when
   * we move navigation responsibilities back into the entry cards in future.
   */
  onChangeTab?: (tab: CommunityTab) => void;
}) {
  return (
    <div className="space-y-8">
      <section>
        <SectionTitle
          icon={<TrendingUp />}
          title="Patterns from shelves like yours"
        />
        {data.patterns.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No shelf patterns yet"
            body="Add a few products to your shelf and Ritora will start surfacing what users like you do with them."
          />
        ) : (
          <ul className="grid gap-2">
            {data.patterns.map((pattern) => (
              <li
                key={pattern.id}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      {pattern.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      {pattern.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RoutineList routines={data.routines.slice(0, 3)} compact />
      <ReviewList reviews={data.reviews.slice(0, 3)} compact />
    </div>
  );
}

export function PeopleLikeMe({ data }: { data: CommunityHome }) {
  const items = useMemo(
    () =>
      [...data.routines, ...data.reviews].sort(
        (a, b) => b.matchScore - a.matchScore,
      ),
    [data.reviews, data.routines],
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No community evidence yet"
        body="Published routines and reviews will appear here once users with shelves like yours share them."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) =>
        item.type === "routine" ? (
          <RoutineCard key={item.id} routine={item} />
        ) : (
          <ReviewCard key={item.id} review={item} />
        ),
      )}
    </div>
  );
}

export function RoutineList({
  routines,
  compact = false,
}: {
  routines: CommunityRoutine[];
  compact?: boolean;
}) {
  if (routines.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No published routines yet"
        body="Routines must pass Ritora's safety checks before they appear here."
      />
    );
  }

  return (
    <section>
      <SectionTitle
        icon={<GitBranch />}
        title="Community routines"
        count={compact ? `Top ${routines.length}` : `${routines.length} total`}
      />
      <div className="grid gap-3">
        {routines.map((routine) => (
          <RoutineCard key={routine.id} routine={routine} />
        ))}
      </div>
    </section>
  );
}

export function ReviewList({
  reviews,
  compact = false,
}: {
  reviews: CommunityReview[];
  compact?: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No published reviews yet"
        body="Reviews require disclosure, duration, outcomes and routine context before they go live."
      />
    );
  }

  return (
    <section>
      <SectionTitle
        icon={<Star />}
        title="Product reviews with routine context"
        count={compact ? `Top ${reviews.length}` : `${reviews.length} total`}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

/* ===========================================================
 * Slim section header — used by lists and patterns. Replaces
 * the over-styled `sub-title` from the dashboard pattern.
 * ========================================================= */

function SectionTitle({
  count,
  icon,
  title,
}: {
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
      {count ? (
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {count}
        </span>
      ) : null}
    </div>
  );
}

/* ===========================================================
 * Routine card — slimmer than before (p-4, lighter hover, no
 * shadow promotion on hover). Step preview moved into a single
 * compact line, not a 2×2 grid that made the card balloon.
 * ========================================================= */

function RoutineCard({ routine }: { routine: CommunityRoutine }) {
  const report = useMutation({
    mutationFn: () => reportCommunityRoutine(routine.id, "unsafe_advice"),
    onSuccess: () => toast.success("Report submitted for moderation."),
    onError: () => toast.error("Could not submit report."),
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
              Adapt
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => report.mutate()}
            disabled={report.isPending}
            aria-label="Report routine"
          >
            {report.isPending ? (
              <InlineSpinner />
            ) : (
              <Flag className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
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
              <span className="text-muted">{step.category}</span>
            </span>
          ))}
          {routine.steps.length > 5 ? (
            <span className="text-[11px] font-medium text-muted">
              +{routine.steps.length - 5} more
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/* ===========================================================
 * Review card — same compaction pass.
 * ========================================================= */

function ReviewCard({ review }: { review: CommunityReview }) {
  const report = useMutation({
    mutationFn: () => reportCommunityReview(review.id, "unsafe_advice"),
    onSuccess: () => toast.success("Report submitted for moderation."),
    onError: () => toast.error("Could not submit report."),
  });

  return (
    <article className="rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {review.productBrand} {review.productName}
          </h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
            {review.usageDuration} · {review.frequency}
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
      {review.body ? (
        <p className="mt-2 text-xs leading-5 text-foreground line-clamp-3">
          {review.body}
        </p>
      ) : null}
      {review.routineContext.length > 0 ? (
        <p className="mt-2 text-[11px] leading-5 text-muted">
          <span className="font-semibold uppercase tracking-wide">
            Context:{" "}
          </span>
          {review.routineContext
            .map((item) => item.productName ?? item.category)
            .join(" · ")}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => report.mutate()}
          disabled={report.isPending}
          aria-label="Report review"
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

/* ===========================================================
 * Legacy export shim — `FacetPills` was renamed to `FacetStrip`.
 * Keep this alias so existing call sites continue to compile
 * without churn.
 * ========================================================= */

export const FacetPills = FacetStrip;
