"use client";

import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  deleteSmartPicksWishlistItem,
  getSmartPicksOverview,
  getSmartPicksWishlist,
  updateSmartPicksBudget,
} from "@/services/smart-picks.service";
import type {
  SmartPicksMode,
  SmartPicksOverview,
  SmartPicksWishlistResponse,
  UpdateSmartPicksBudgetPayload,
} from "@/types/smart-picks";

export function useSmartPicksOverview(mode?: SmartPicksMode) {
  const isEnabled = useAuthEnabled();
  return useQuery<SmartPicksOverview>({
    queryKey: [QueryKey.SmartPicksOverview, mode ?? "auto"],
    queryFn: () => getSmartPicksOverview(mode),
    enabled: isEnabled,
    refetchInterval: (query) =>
      query.state.data?.productSuggestionsUnavailable ? 4_000 : false,
  });
}

export function useSmartPicksWishlist() {
  const isEnabled = useAuthEnabled();
  return useQuery<SmartPicksWishlistResponse>({
    queryKey: [QueryKey.SmartPicksWishlist],
    queryFn: getSmartPicksWishlist,
    enabled: isEnabled,
  });
}

export function useUpdateSmartPicksBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSmartPicksBudgetPayload) =>
      updateSmartPicksBudget(payload),
    onSuccess: (overview) => {
      queryClient.setQueryData(
        [QueryKey.SmartPicksOverview, overview.mode],
        overview,
      );
      void invalidateSmartPicks(queryClient);
    },
  });
}

export function useDeleteSmartPicksWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => deleteSmartPicksWishlistItem(actionId),
    onSuccess: () => {
      void invalidateSmartPicks(queryClient);
    },
  });
}

function invalidateSmartPicks(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [QueryKey.SmartPicksOverview] }),
    queryClient.invalidateQueries({ queryKey: [QueryKey.SmartPicksWishlist] }),
  ]);
}
