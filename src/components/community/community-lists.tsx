"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  AlertTriangle,
  Flag,
  GitBranch,
  Info,
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
  Badge,
  Chip,
  DisclosureBadge,
  EmptyState,
  InlineSpinner,
  MatchBadge,
  OutcomeChip,
  SafetyChip,
  type CommunityTab,
} from "./community-shared";

export function FacetPills({ data }: { data: CommunityHome }) {
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
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Complete your skin profile for better matching. We&apos;ll start
          surfacing routines that fit you specifically.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {pills.map((pill) => (
        <span
          key={pill}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
        >
          {pill}
        </span>
      ))}
    </div>
  );
}

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
      role="tablist"
      aria-label="Community sections"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-muted/60 p-1"
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
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              isActive
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted hover:bg-surface/60 hover:text-foreground",
            )}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function ForYou({
  data,
  onChangeTab,
}: {
  data: CommunityHome;
  onChangeTab: (tab: CommunityTab) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <EntryCard
          body={`${data.routines.length + data.reviews.length} matched routines and reviews.`}
          icon={<UserCheck />}
          onClick={() => onChangeTab("people")}
          title="People like me"
          tone="accent"
        />
        <EntryCard
          body="Map shared routines onto products you already own."
          icon={<Wand2 />}
          onClick={() => onChangeTab("routines")}
          title="Adapt a routine"
          tone="ai"
        />
        <EntryCard
          body={`${data.warnings.length} active warnings and safety notices.`}
          icon={<AlertTriangle />}
          onClick={() => onChangeTab("trust")}
          title="Community warnings"
          tone="warning"
        />
      </div>

      {/* Informational note — uses the cool/AI palette tokens. */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-ai-border bg-ai-soft px-4 py-3 text-sm leading-6 text-ai-fg"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Community is signed-in only at launch. New reviews and routines may
          publish instantly when low-risk, or enter moderation when Ritora
          detects medical claims, sponsorship risk, or unsafe routine patterns.
        </span>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
          <TrendingUp className="h-5 w-5 text-accent" />
          Patterns from shelves like yours
        </h2>
        {data.patterns.length === 0 ? (
          <EmptyState
            title="No shelf patterns yet"
            body="Add a few products to your shelf and Ritora will start surfacing what users like you do with them."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {data.patterns.map((pattern) => (
              <article
                key={pattern.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-soft"
              >
                <h3 className="font-display text-sm font-bold tracking-tight text-foreground">
                  {pattern.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {pattern.body}
                </p>
              </article>
            ))}
          </div>
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
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
        <GitBranch className="h-5 w-5 text-accent" />
        Community routines
        {compact ? <Badge tone="muted">Top {routines.length}</Badge> : null}
      </h2>
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
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
        <Star className="h-5 w-5 text-accent" />
        Product reviews with routine context
        {compact ? <Badge tone="muted">Top {reviews.length}</Badge> : null}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

const entryTone: Record<
  "accent" | "ai" | "warning",
  { iconBg: string; iconFg: string; border: string }
> = {
  accent: {
    iconBg: "bg-accent",
    iconFg: "text-white",
    border: "hover:border-accent/50",
  },
  ai: {
    iconBg: "bg-ai-bg",
    iconFg: "text-ai-fg",
    border: "hover:border-ai-border",
  },
  warning: {
    iconBg: "bg-warning-soft",
    iconFg: "text-warning",
    border: "hover:border-warning/40",
  },
};

function EntryCard({
  body,
  icon,
  onClick,
  title,
  tone = "accent",
}: {
  body: string;
  icon: ReactNode;
  onClick: () => void;
  title: string;
  tone?: "accent" | "ai" | "warning";
}) {
  const palette = entryTone[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition outline-none focus-visible:ring-2 focus-visible:ring-accent/30 hover:shadow-hero",
        palette.border,
      )}
    >
      <div
        className={cn(
          "mb-3 flex h-11 w-11 items-center justify-center rounded-2xl [&_svg]:h-5 [&_svg]:w-5",
          palette.iconBg,
          palette.iconFg,
        )}
      >
        {icon}
      </div>
      <h3 className="font-display text-base font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
    </button>
  );
}

function RoutineCard({ routine }: { routine: CommunityRoutine }) {
  const report = useMutation({
    mutationFn: () => reportCommunityRoutine(routine.id, "unsafe_advice"),
    onSuccess: () => toast.success("Report submitted for moderation."),
    onError: () => toast.error("Could not submit report."),
  });

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-hero">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold tracking-tight text-foreground">
              {routine.title}
            </h3>
            <MatchBadge score={routine.matchScore} />
            <DisclosureBadge value={routine.disclosureType} />
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {routine.summary ?? "Shared routine with safety-scanned steps."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {routine.relevanceReasons.map((reason) => (
              <Chip key={reason}>{reason}</Chip>
            ))}
            {routine.safetyFlags.map((flag) => (
              <SafetyChip key={flag.code} severity={flag.severity}>
                {flag.message}
              </SafetyChip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
          >
            {report.isPending ? (
              <InlineSpinner />
            ) : (
              <Flag className="h-4 w-4" />
            )}
            Report
          </Button>
        </div>
      </div>
      {routine.steps.length > 0 ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {routine.steps.slice(0, 4).map((step) => (
            <div
              key={`${routine.id}-${step.stepOrder}`}
              className="rounded-xl border border-border bg-surface-muted/60 px-3 py-2 text-sm"
            >
              <span className="font-semibold text-foreground">
                {step.stepOrder}. {step.category}
              </span>
              <span className="ml-2 text-muted">
                {[step.productBrand, step.productName]
                  .filter(Boolean)
                  .join(" ") || "Category gap"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function ReviewCard({ review }: { review: CommunityReview }) {
  const report = useMutation({
    mutationFn: () => reportCommunityReview(review.id, "unsafe_advice"),
    onSuccess: () => toast.success("Report submitted for moderation."),
    onError: () => toast.error("Could not submit report."),
  });

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-hero">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground">
            {review.productBrand} {review.productName}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted">
            {review.usageDuration} · {review.frequency}
          </p>
        </div>
        <MatchBadge score={review.matchScore} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <DisclosureBadge value={review.disclosureType} />
        {review.outcomes.map((outcome) => (
          <OutcomeChip key={outcome} value={outcome} />
        ))}
      </div>
      {review.body ? (
        <p className="mt-3 text-sm leading-6 text-foreground">{review.body}</p>
      ) : null}
      {review.routineContext.length > 0 ? (
        <div className="mt-3 rounded-xl border border-border bg-surface-muted/60 p-3 text-xs">
          <div className="font-semibold uppercase tracking-wide text-muted">
            Routine context
          </div>
          <div className="mt-1 text-foreground">
            {review.routineContext
              .map((item) => item.productName ?? item.category)
              .join(" · ")}
          </div>
        </div>
      ) : null}
      <Button
        className="mt-4"
        variant="ghost"
        size="sm"
        onClick={() => report.mutate()}
        disabled={report.isPending}
      >
        {report.isPending ? (
          <InlineSpinner />
        ) : (
          <Flag className="h-4 w-4" />
        )}
        Report
      </Button>
    </article>
  );
}
