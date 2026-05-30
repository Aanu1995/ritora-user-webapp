"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GitBranch } from "lucide-react";
import { RetryPanel } from "@/components/ui/retry-panel";
import type { CommunityRoutine } from "@/types/community";
import { RoutineCard, SectionTitle } from "./community-cards";
import {
  CommunityAutoLoadState,
  type CommunityAutoPaginationProps,
  useCommunityAutoLoad,
} from "./community-list-pagination";
import {
  emptyPlaybookFilters,
  hasActivePlaybookFilters,
  PlaybookCompactToolbar,
  PlaybookSearchField,
  type CommunityPlaybookFilterState,
} from "./community-playbook-filters";
import { CommunityListSkeleton, EmptyState } from "./community-shared";

export function RoutineList({
  action,
  compact = false,
  filters = emptyPlaybookFilters,
  hasLoadMoreError = false,
  hasNextPage = false,
  isError = false,
  isFetchingNextPage = false,
  isLoading = false,
  onFiltersChange,
  onLoadMore,
  onRetryInitialLoad,
  onRetryLoadMore,
  routines,
}: {
  action?: ReactNode;
  routines: CommunityRoutine[];
  compact?: boolean;
  filters?: CommunityPlaybookFilterState;
  onFiltersChange?: (next: CommunityPlaybookFilterState) => void;
} & CommunityAutoPaginationProps) {
  const t = useTranslations("community.lists");
  const tErrors = useTranslations("community.errors");
  const hasFilters = hasActivePlaybookFilters(filters);
  const loadMoreSentinelRef = useCommunityAutoLoad({
    compact,
    hasLoadMoreError,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    itemCount: routines.length,
    onLoadMore,
  });
  const showAutoLoadState =
    !compact && (hasNextPage || isFetchingNextPage || hasLoadMoreError);

  const countLabel =
    routines.length === 0
      ? undefined
      : compact
        ? t("playbooksTopN", { count: routines.length })
        : t("playbooksLoaded", { count: routines.length });

  /* Compact mode (community home preview) keeps the simple
     SectionTitle. Full list mode (Playbooks tab) gets the new
     inline header where search lives in the title row and a
     compact filter toolbar sits directly below — same pattern
     applied to the Reviews tab so both lists feel consistent. */
  const isFullList = !compact && Boolean(onFiltersChange);

  return (
    <section>
      {isFullList && onFiltersChange ? (
        <header className="mb-3 space-y-2">
          {/* Mobile (default): title + action on row 1 (action
              right-aligned via `ml-auto`), search drops to its
              own full-width row via `w-full + order-3`.
              Desktop (sm:): the three reflow to title (order-1)
              | search (order-2, flex-1, max-w-md) | action
              (order-3) all on one row. Identical layout to the
              Reviews tab header for visual parity. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="inline-flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-foreground sm:order-1">
              <GitBranch aria-hidden className="h-4 w-4 text-accent" />
              {t("playbooksTitle")}
            </h2>
            {action ? (
              <div className="ml-auto flex shrink-0 items-center gap-2 sm:order-3 sm:ml-0">
                {action}
              </div>
            ) : null}
            <div className="order-3 w-full sm:order-2 sm:ml-auto sm:mr-0 sm:w-auto sm:max-w-md sm:flex-1">
              <PlaybookSearchField
                value={filters.search}
                onChange={(search) =>
                  onFiltersChange({ ...filters, search })
                }
              />
            </div>
          </div>
          <PlaybookCompactToolbar
            value={filters}
            onChange={onFiltersChange}
            countLabel={countLabel}
          />
        </header>
      ) : (
        <SectionTitle
          action={compact ? undefined : action}
          icon={<GitBranch />}
          title={t("playbooksTitle")}
          count={countLabel}
        />
      )}
      {isLoading && routines.length === 0 ? (
        <CommunityListSkeleton count={3} />
      ) : null}
      {isError && routines.length === 0 ? (
        <RetryPanel
          title={tErrors("couldNotLoadTitle")}
          description={tErrors("couldNotLoadBody")}
          actionLabel={tErrors("tryAgain")}
          onAction={() => onRetryInitialLoad?.()}
          hideSupportLink
        />
      ) : null}
      {!isLoading && !isError && routines.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={
            hasFilters
              ? t("playbooksFilterEmptyTitle")
              : t("playbooksEmptyTitle")
          }
          body={
            hasFilters ? t("playbooksFilterEmptyBody") : t("playbooksEmptyBody")
          }
        />
      ) : null}
      {routines.length > 0 ? (
        /* `grid-cols-1` (not bare `grid`) so each card's
           column is capped at `minmax(0, 1fr)` — without it
           the implicit column sizes to its widest child and
           a single card with a long summary/tag stretches
           the whole list past the viewport on mobile. Same
           overflow trap fixed on the Reviews list. */
        <div className="grid grid-cols-1 gap-3">
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      ) : null}
      {showAutoLoadState ? (
        <CommunityAutoLoadState
          hasLoadMoreError={hasLoadMoreError}
          isFetchingNextPage={isFetchingNextPage}
          onRetryLoadMore={onRetryLoadMore}
          sentinelRef={loadMoreSentinelRef}
          testId="community-routines-auto-load-sentinel"
        />
      ) : null}
    </section>
  );
}
