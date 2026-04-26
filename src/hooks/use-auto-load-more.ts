'use client';

import { useEffect, useRef } from 'react';

type UseAutoLoadMoreOptions = {
  enabled?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void | Promise<unknown>;
  rootMargin?: string;
};

export function useAutoLoadMore({
  enabled = true,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = '240px 0px',
}: UseAutoLoadMoreOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!isFetchingNextPage) {
      requestInFlightRef.current = false;
    }
  }, [isFetchingNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !enabled ||
      !hasNextPage ||
      !sentinel ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        if (requestInFlightRef.current || isFetchingNextPage || !hasNextPage) {
          return;
        }

        requestInFlightRef.current = true;
        void onLoadMoreRef.current();
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [enabled, hasNextPage, isFetchingNextPage, rootMargin]);

  return sentinelRef;
}
