"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAutoLoadMore } from "@/hooks/use-auto-load-more";
import { InlineSpinner } from "./community-shared";

export type CommunityAutoPaginationProps = {
  isLoading?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  hasLoadMoreError?: boolean;
  onLoadMore?: () => Promise<unknown> | void;
  onRetryLoadMore?: () => Promise<unknown> | void;
  onRetryInitialLoad?: () => void;
};

export function useCommunityAutoLoad({
  compact,
  hasLoadMoreError,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  itemCount,
  onLoadMore,
}: {
  compact: boolean;
  hasLoadMoreError: boolean;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  itemCount: number;
  onLoadMore?: () => Promise<unknown> | void;
}) {
  return useAutoLoadMore({
    enabled:
      !compact &&
      !isLoading &&
      !isError &&
      itemCount > 0 &&
      !hasLoadMoreError &&
      typeof onLoadMore === "function",
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: () => onLoadMore?.(),
  });
}

export function CommunityAutoLoadState({
  hasLoadMoreError,
  isFetchingNextPage,
  onRetryLoadMore,
  sentinelRef,
  testId,
}: {
  hasLoadMoreError: boolean;
  isFetchingNextPage: boolean;
  onRetryLoadMore?: () => void;
  sentinelRef: ReturnType<typeof useAutoLoadMore>;
  testId: string;
}) {
  const t = useTranslations("community.lists");

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {hasLoadMoreError ? (
        <>
          <p className="text-center text-sm text-danger" role="alert">
            {t("loadMoreError")}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onRetryLoadMore?.()}
          >
            {t("retry")}
          </Button>
        </>
      ) : isFetchingNextPage ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <InlineSpinner />
          <span>{t("loadingMore")}</span>
        </div>
      ) : null}
      <div
        ref={sentinelRef}
        data-testid={testId}
        aria-hidden="true"
        className="h-px w-full"
      />
    </div>
  );
}
