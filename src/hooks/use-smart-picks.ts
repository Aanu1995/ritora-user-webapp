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
import { SMART_PICKS_PRODUCT_GENERATION_STATUS } from "@/types/smart-picks";

const SMART_PICKS_PENDING_REFETCH_MS = 30_000;

export function useSmartPicksOverview(
  mode?: SmartPicksMode,
  options?: { enabled?: boolean },
) {
  const isEnabled = useAuthEnabled(options?.enabled ?? true);
  return useQuery<SmartPicksOverview>({
    queryKey: [QueryKey.SmartPicksOverview, mode ?? "auto"],
    queryFn: () => getSmartPicksOverview(mode),
    enabled: isEnabled,
    refetchInterval: (query) =>
      query.state.data?.productGeneration.status ===
        SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending &&
      query.state.data.productGeneration.isProcessing
        ? SMART_PICKS_PENDING_REFETCH_MS
        : false,
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
