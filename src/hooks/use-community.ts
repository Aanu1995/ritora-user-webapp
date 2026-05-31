"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  getPeopleLikeMe,
  listCommunityReviews,
  listCommunityRoutines,
  listMyCommunitySubmissions,
} from "@/services/community.service";
import type { CommunityList, CommunityListQuery } from "@/types/community";

const COMMUNITY_LIST_PAGE_SIZE = 12;

function getSafeNextCursor<T>(
  lastPage: CommunityList<T>,
  _allPages: CommunityList<T>[],
  lastPageParam: string | null,
  allPageParams: Array<string | null>,
): string | undefined {
  const nextCursor = lastPage.nextCursor ?? null;
  if (!nextCursor) {
    return undefined;
  }

  if (nextCursor === lastPageParam || allPageParams.includes(nextCursor)) {
    return undefined;
  }

  return nextCursor;
}

export function useCommunityRoutines(
  filters: CommunityListQuery = {},
  enabled: boolean = true,
) {
  const isEnabled = useAuthEnabled(enabled);
  const query = useInfiniteQuery({
    queryKey: [QueryKey.CommunityRoutines, filters],
    queryFn: ({ pageParam, signal }) =>
      listCommunityRoutines(
        {
          ...filters,
          cursor: pageParam,
          limit: COMMUNITY_LIST_PAGE_SIZE,
        },
        signal,
      ),
    enabled: isEnabled,
    initialPageParam: null as string | null,
    getNextPageParam: getSafeNextCursor,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

export function useCommunityReviews(
  filters: CommunityListQuery = {},
  enabled: boolean = true,
) {
  const isEnabled = useAuthEnabled(enabled);
  const query = useInfiniteQuery({
    queryKey: [QueryKey.CommunityReviews, filters],
    queryFn: ({ pageParam, signal }) =>
      listCommunityReviews(
        {
          ...filters,
          cursor: pageParam,
          limit: COMMUNITY_LIST_PAGE_SIZE,
        },
        signal,
      ),
    enabled: isEnabled,
    initialPageParam: null as string | null,
    getNextPageParam: getSafeNextCursor,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

export function useCommunityPeopleLikeMe(enabled: boolean = true) {
  const isEnabled = useAuthEnabled(enabled);
  const query = useInfiniteQuery({
    queryKey: [QueryKey.CommunityPeopleLikeMe],
    queryFn: ({ pageParam, signal }) =>
      getPeopleLikeMe(
        {
          cursor: pageParam,
          limit: COMMUNITY_LIST_PAGE_SIZE,
        },
        signal,
      ),
    enabled: isEnabled,
    initialPageParam: null as string | null,
    getNextPageParam: getSafeNextCursor,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.items) ?? [],
    profileFacets: query.data?.pages[0]?.profileFacets ?? null,
  };
}

export function useMyCommunitySubmissions(enabled: boolean = true) {
  const isEnabled = useAuthEnabled(enabled);
  const query = useInfiniteQuery({
    queryKey: [QueryKey.CommunityMySubmissions],
    queryFn: ({ pageParam, signal }) =>
      listMyCommunitySubmissions(
        {
          cursor: pageParam,
          limit: COMMUNITY_LIST_PAGE_SIZE,
        },
        signal,
      ),
    enabled: isEnabled,
    initialPageParam: null as string | null,
    getNextPageParam: getSafeNextCursor,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}
