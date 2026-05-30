"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { RetryPanel } from "@/components/ui/retry-panel";
import type { CommunityReview } from "@/types/community";
import { ReviewCard, SectionTitle } from "./community-cards";
import {
  CommunityAutoLoadState,
  type CommunityAutoPaginationProps,
  useCommunityAutoLoad,
} from "./community-list-pagination";
import {
  emptyReviewFilters,
  hasActiveReviewFilters,
  ReviewCompactToolbar,
  ReviewSearchField,
  type CommunityReviewFilterState,
} from "./community-review-filters";
import { CommunityListSkeleton, EmptyState } from "./community-shared";

export function ReviewList({
  action,
  compact = false,
  filters = emptyReviewFilters,
  hasLoadMoreError = false,
  hasNextPage = false,
  isError = false,
  isFetchingNextPage = false,
  isLoading = false,
  onFiltersChange,
  onLoadMore,
  onRetryInitialLoad,
  onRetryLoadMore,
  reviews,
}: {
  action?: ReactNode;
  reviews: CommunityReview[];
  compact?: boolean;
  filters?: CommunityReviewFilterState;
  onFiltersChange?: (next: CommunityReviewFilterState) => void;
} & CommunityAutoPaginationProps) {
  const t = useTranslations("community.lists");
  const tErrors = useTranslations("community.errors");
  const hasFilters = hasActiveReviewFilters(filters);
  const loadMoreSentinelRef = useCommunityAutoLoad({
    compact,
    hasLoadMoreError,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    itemCount: reviews.length,
    onLoadMore,
  });
  const showAutoLoadState =
    !compact && (hasNextPage || isFetchingNextPage || hasLoadMoreError);

  const countLabel =
    reviews.length === 0
      ? undefined
      : compact
        ? t("reviewsTopN", { count: reviews.length })
        : t("reviewsLoaded", { count: reviews.length });

  /* Compact mode (home page) keeps the simple SectionTitle —
     no search, no filter strip, just title + action. The full
     list mode (Reviews tab) gets the new inline header where
     search lives in the title row and a compact filter toolbar
     sits directly below, replacing the previous full-width
     filter panel that ate a screenful of vertical space. */
  const isFullList = !compact && Boolean(onFiltersChange);

  return (
    <section>
      {isFullList && onFiltersChange ? (
        <header className="mb-3 space-y-2">
          {/* Mobile layout (default): title + action on row 1
              (action is right-aligned via `ml-auto`), search
              drops to its own full-width row via `w-full +
              order-3` which trumps `flex-wrap` and lands the
              input on a new line that spans the whole header.

              Desktop layout (sm:): the three siblings reflow
              into a single row via `order` overrides — title
              (order-1), search (order-2, flex-1, max-w-md),
              action (order-3). The search input is no longer
              forced full-width (`sm:w-auto`) so flex can size
              it between title and action.

              Why two layouts instead of one flex-wrap row: on
              a narrow phone, the search dropping below makes
              row 2 a comfortable, tap-friendly target. Having
              it share row 1 (the old behaviour) made the input
              fight the title for limited width and looked
              cramped at 320–375px. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="inline-flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-foreground sm:order-1">
              <Star aria-hidden className="h-4 w-4 text-accent" />
              {t("reviewsTitle")}
            </h2>
            {action ? (
              <div className="ml-auto flex shrink-0 items-center gap-2 sm:order-3 sm:ml-0">
                {action}
              </div>
            ) : null}
            <div className="order-3 w-full sm:order-2 sm:ml-auto sm:mr-0 sm:w-auto sm:max-w-md sm:flex-1">
              <ReviewSearchField
                value={filters.search}
                onChange={(search) =>
                  onFiltersChange({ ...filters, search })
                }
              />
            </div>
          </div>
          <ReviewCompactToolbar
            value={filters}
            onChange={onFiltersChange}
            countLabel={countLabel}
          />
        </header>
      ) : (
        <SectionTitle
          action={compact ? undefined : action}
          icon={<Star />}
          title={t("reviewsTitle")}
          count={countLabel}
        />
      )}
      {isLoading && reviews.length === 0 ? (
        <CommunityListSkeleton count={3} />
      ) : null}
      {isError && reviews.length === 0 ? (
        <RetryPanel
          title={tErrors("couldNotLoadTitle")}
          description={tErrors("couldNotLoadBody")}
          actionLabel={tErrors("tryAgain")}
          onAction={() => onRetryInitialLoad?.()}
          hideSupportLink
        />
      ) : null}
      {!isLoading && !isError && reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title={
            hasFilters ? t("reviewsFilterEmptyTitle") : t("reviewsEmptyTitle")
          }
          body={
            hasFilters ? t("reviewsFilterEmptyBody") : t("reviewsEmptyBody")
          }
        />
      ) : null}
      {reviews.length > 0 ? (
        /* `grid-cols-1` (not bare `grid`) is required so each
           card's column is sized as `minmax(0, 1fr)` — capped
           at the available width. Without it the implicit
           grid column is sized `auto` and grows to fit its
           widest child, so one card with a long URL or wide
           untruncated chip in its body would stretch the
           whole list past the viewport and trigger a page-
           level horizontal scrollbar on mobile. */
        <div className="grid grid-cols-1 gap-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : null}
      {showAutoLoadState ? (
        <CommunityAutoLoadState
          hasLoadMoreError={hasLoadMoreError}
          isFetchingNextPage={isFetchingNextPage}
          onRetryLoadMore={onRetryLoadMore}
          sentinelRef={loadMoreSentinelRef}
          testId="community-reviews-auto-load-sentinel"
        />
      ) : null}
    </section>
  );
}
