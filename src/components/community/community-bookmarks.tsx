"use client";

import { useTranslations } from "next-intl";
import { Bookmark } from "lucide-react";
import { RetryPanel } from "@/components/ui/retry-panel";
import type { CommunityBookmarkItem } from "@/types/community";
import { CommunityBookmarkButton } from "./community-bookmark-button";
import { ReviewCard, RoutineCard, SectionTitle } from "./community-cards";
import {
  CommunityAutoLoadState,
  type CommunityAutoPaginationProps,
  useCommunityAutoLoad,
} from "./community-list-pagination";
import { CommunityListSkeleton, EmptyState } from "./community-shared";

export function BookmarksList({
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
  items: CommunityBookmarkItem[];
} & CommunityAutoPaginationProps) {
  const t = useTranslations("community.bookmarks");
  const tErrors = useTranslations("community.errors");
  const visibleItems = items.filter(
    (item) => item.moderationStatus === "published",
  );
  const loadMoreSentinelRef = useCommunityAutoLoad({
    compact: false,
    hasLoadMoreError,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    itemCount: visibleItems.length,
    onLoadMore,
  });
  const showAutoLoadState =
    hasNextPage || isFetchingNextPage || hasLoadMoreError;

  return (
    <section>
      <SectionTitle
        count={
          visibleItems.length > 0
            ? t("loaded", { count: visibleItems.length })
            : undefined
        }
        icon={<Bookmark />}
        title={t("title")}
      />
      {isLoading && visibleItems.length === 0 ? (
        <CommunityListSkeleton count={3} />
      ) : null}
      {isError && visibleItems.length === 0 ? (
        <RetryPanel
          title={tErrors("couldNotLoadTitle")}
          description={tErrors("couldNotLoadBody")}
          actionLabel={tErrors("tryAgain")}
          onAction={() => onRetryInitialLoad?.()}
          hideSupportLink
        />
      ) : null}
      {!isLoading && !isError && visibleItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("emptyTitle")}
          body={t("emptyBody")}
        />
      ) : null}
      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {visibleItems.map((item) =>
            item.type === "routine" ? (
              <RoutineCard
                key={item.id}
                routine={item}
                bookmarkAction={
                  <CommunityBookmarkButton
                    contentId={item.id}
                    contentType="routine"
                    mode="remove"
                  />
                }
              />
            ) : (
              <ReviewCard
                key={item.id}
                review={item}
                bookmarkAction={
                  <CommunityBookmarkButton
                    contentId={item.id}
                    contentType="review"
                    mode="remove"
                  />
                }
              />
            ),
          )}
        </div>
      ) : null}
      {showAutoLoadState ? (
        <CommunityAutoLoadState
          hasLoadMoreError={hasLoadMoreError}
          isFetchingNextPage={isFetchingNextPage}
          onRetryLoadMore={onRetryLoadMore}
          sentinelRef={loadMoreSentinelRef}
          testId="community-bookmarks-auto-load-sentinel"
        />
      ) : null}
    </section>
  );
}
