"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { RetryPanel } from "@/components/ui/retry-panel";
import type { CommunityReview, CommunityRoutine } from "@/types/community";
import { ReviewCard, RoutineCard } from "./community-cards";
import {
  CommunityAutoLoadState,
  type CommunityAutoPaginationProps,
  useCommunityAutoLoad,
} from "./community-list-pagination";
import { CommunityListSkeleton, EmptyState } from "./community-shared";

export { ReviewList } from "./community-review-list";
export { RoutineList } from "./community-routine-list";

export function PeopleLikeMe({
  hasLoadMoreError = false,
  hasNextPage = false,
  isError = false,
  isFetchingNextPage = false,
  isLoading = false,
  items,
  onLoadMore,
  onRetryInitialLoad,
  onRetryLoadMore,
}: {
  items: Array<CommunityRoutine | CommunityReview>;
} & CommunityAutoPaginationProps) {
  const t = useTranslations("community.lists");
  const tErrors = useTranslations("community.errors");
  const loadMoreSentinelRef = useCommunityAutoLoad({
    compact: false,
    hasLoadMoreError,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    itemCount: items.length,
    onLoadMore,
  });
  const showAutoLoadState =
    hasNextPage || isFetchingNextPage || hasLoadMoreError;

  if (isLoading && items.length === 0) {
    return <CommunityListSkeleton count={3} />;
  }

  if (isError && items.length === 0) {
    return (
      <RetryPanel
        title={tErrors("couldNotLoadTitle")}
        description={tErrors("couldNotLoadBody")}
        actionLabel={tErrors("tryAgain")}
        onAction={() => onRetryInitialLoad?.()}
        hideSupportLink
      />
    );
  }

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
    <>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) =>
          item.type === "routine" ? (
            <RoutineCard key={item.id} routine={item} />
          ) : (
            <ReviewCard key={item.id} review={item} />
          ),
        )}
      </div>
      {showAutoLoadState ? (
        <CommunityAutoLoadState
          hasLoadMoreError={hasLoadMoreError}
          isFetchingNextPage={isFetchingNextPage}
          onRetryLoadMore={onRetryLoadMore}
          sentinelRef={loadMoreSentinelRef}
          testId="community-people-auto-load-sentinel"
        />
      ) : null}
    </>
  );
}
