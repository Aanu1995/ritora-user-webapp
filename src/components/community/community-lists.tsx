"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  GitBranch,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type {
  CommunityHome,
  CommunityReview,
  CommunityRoutine,
} from "@/types/community";
import { ReviewCard, RoutineCard, SectionTitle } from "./community-cards";
import {
  CommunityPlaybookFilters,
  emptyPlaybookFilters,
} from "./community-playbook-filters";
import {
  EmptyState,
  type CommunityTab,
} from "./community-shared";

const communityPatternTranslations = {
  "similar-users": {
    titleKey: "patterns.similarUsers.title",
    bodyKey: "patterns.similarUsers.body",
  },
  "routine-context": {
    titleKey: "patterns.routineContext.title",
    bodyKey: "patterns.routineContext.body",
  },
  "safe-facets": {
    titleKey: "patterns.safeFacets.title",
    bodyKey: "patterns.safeFacets.body",
  },
} as const;

type CommunityPatternId = keyof typeof communityPatternTranslations;

function isCommunityPatternId(id: string): id is CommunityPatternId {
  return id in communityPatternTranslations;
}

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
  const t = useTranslations("community.forYou");
  const matchedPatternCount = useMemo(
    () =>
      [...data.routines, ...data.reviews].filter(
        (item) => item.matchScore >= 40,
      ).length,
    [data.reviews, data.routines],
  );
  const patternCounts = {
    "similar-users": matchedPatternCount,
    "routine-context": 0,
    "safe-facets": data.profileFacets.concernTags.length,
  } satisfies Record<CommunityPatternId, number>;

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle icon={<TrendingUp />} title={t("patternsTitle")} />
        {data.patterns.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title={t("patternsEmptyTitle")}
            body={t("patternsEmptyBody")}
          />
        ) : (
          <ul className="grid gap-2">
            {data.patterns.map((pattern) => {
              const copy = isCommunityPatternId(pattern.id)
                ? {
                    title: t(
                      communityPatternTranslations[pattern.id].titleKey,
                    ),
                    body: t(communityPatternTranslations[pattern.id].bodyKey, {
                      count: patternCounts[pattern.id],
                    }),
                  }
                : {
                    title: pattern.title,
                    body: pattern.body,
                  };

              return (
                <li
                  key={pattern.id}
                  className="rounded-xl border border-border bg-surface px-4 py-3"
                >
                  {/* Dot + title share an `items-center` row so the bullet
                      sits on the title's visual midline. The body is
                      indented by `dot width + gap` so it lines up with
                      the title text instead of the dot. */}
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <h3 className="text-sm font-semibold text-foreground">
                      {copy.title}
                    </h3>
                  </div>
                  <p className="mt-0.5 pl-[1.125rem] text-xs leading-5 text-muted">
                    {copy.body}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <RoutineList routines={data.routines.slice(0, 3)} compact />
      <ReviewList reviews={data.reviews.slice(0, 3)} compact />
    </div>
  );
}

export function PeopleLikeMe({ data }: { data: CommunityHome }) {
  const t = useTranslations("community.lists");
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
        title={t("peopleEmptyTitle")}
        body={t("peopleEmptyBody")}
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
  action,
  routines,
  compact = false,
}: {
  action?: ReactNode;
  routines: CommunityRoutine[];
  compact?: boolean;
}) {
  const t = useTranslations("community.lists");
  const [filters, setFilters] = useState(emptyPlaybookFilters);
  const filteredRoutines = useMemo(
    () =>
      routines.filter((routine) => {
        if (filters.goal && !routine.goalTags.includes(filters.goal)) {
          return false;
        }
        if (filters.result && routine.goalResult !== filters.result) {
          return false;
        }
        if (filters.timeframe && routine.timeframe !== filters.timeframe) {
          return false;
        }
        if (
          filters.productRole &&
          !routine.steps.some((step) => step.category === filters.productRole)
        ) {
          return false;
        }
        if (filters.avoidTag && !routine.avoidTags.includes(filters.avoidTag)) {
          return false;
        }
        if (filters.habitTag && !routine.habitTags.includes(filters.habitTag)) {
          return false;
        }
        if (
          filters.warningTag &&
          !routine.warningTags.includes(filters.warningTag)
        ) {
          return false;
        }
        return true;
      }),
    [filters, routines],
  );

  return (
    <section>
      <SectionTitle
        action={compact ? undefined : action}
        icon={<GitBranch />}
        title={t("playbooksTitle")}
        count={
          routines.length === 0
            ? undefined
            : compact
              ? t("playbooksTopN", { count: filteredRoutines.length })
              : t("playbooksShownTotal", {
                  shown: filteredRoutines.length,
                  total: routines.length,
                })
        }
      />
      {routines.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={t("playbooksEmptyTitle")}
          body={t("playbooksEmptyBody")}
        />
      ) : null}
      {routines.length > 0 && !compact ? (
        <div className="mb-3">
          <CommunityPlaybookFilters value={filters} onChange={setFilters} />
        </div>
      ) : null}
      {routines.length > 0 && filteredRoutines.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={t("playbooksFilterEmptyTitle")}
          body={t("playbooksFilterEmptyBody")}
        />
      ) : null}
      {filteredRoutines.length > 0 ? (
        <div className="grid gap-3">
          {filteredRoutines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ReviewList({
  action,
  reviews,
  compact = false,
}: {
  action?: ReactNode;
  reviews: CommunityReview[];
  compact?: boolean;
}) {
  const t = useTranslations("community.lists");
  return (
    <section>
      <SectionTitle
        action={compact ? undefined : action}
        icon={<Star />}
        title={t("reviewsTitle")}
        count={
          reviews.length === 0
            ? undefined
            : compact
              ? t("reviewsTopN", { count: reviews.length })
              : t("reviewsTotal", { count: reviews.length })
        }
      />
      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title={t("reviewsEmptyTitle")}
          body={t("reviewsEmptyBody")}
        />
      ) : (
        <div className="grid gap-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
