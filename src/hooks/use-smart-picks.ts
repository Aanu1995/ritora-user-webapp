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
  SmartPicksProductGenerationState,
  SmartPicksWishlistResponse,
  UpdateSmartPicksBudgetPayload,
} from "@/types/smart-picks";
import {
  SMART_PICKS_PRODUCT_GENERATION_REASON,
  SMART_PICKS_PRODUCT_GENERATION_STATUS,
  SMART_PICKS_STARTER_KIT_STEP_STATUS,
} from "@/types/smart-picks";

const SMART_PICKS_PENDING_REFETCH_MS = 30_000;

export function useSmartPicksOverview(
  mode?: SmartPicksMode,
  options?: { enabled?: boolean },
) {
  const isEnabled = useAuthEnabled(options?.enabled ?? true);
  return useQuery<SmartPicksOverview>({
    queryKey: [QueryKey.SmartPicksOverview, mode ?? "auto"],
    queryFn: ({ signal }) => getSmartPicksOverview(mode, { signal }),
    enabled: isEnabled,
    refetchInterval: (query) =>
      query.state.error
        ? SMART_PICKS_PENDING_REFETCH_MS
        : getSmartPicksOverviewRefetchInterval(query.state.data),
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

export function getSmartPicksOverviewRefetchInterval(
  data: SmartPicksOverview | undefined,
  nowMs = Date.now(),
): number | false {
  if (!data) return false;

  const productGeneration = data?.productGeneration;
  if (hasUnrecoverableSmartPicksProductGeneration(productGeneration)) {
    return false;
  }

  if (hasPendingSmartPicksProductGeneration(productGeneration)) {
    return SMART_PICKS_PENDING_REFETCH_MS;
  }

  const retryInterval = getRetryableSmartPicksProductGenerationInterval(
    productGeneration,
    nowMs,
  );
  if (retryInterval) return retryInterval;

  return hasUnmatchedSmartPicksProducts(data)
    ? SMART_PICKS_PENDING_REFETCH_MS
    : false;
}

export function hasPendingSmartPicksProductGeneration(
  productGeneration: SmartPicksProductGenerationState | undefined,
): boolean {
  return (
    productGeneration?.status === SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending &&
    (productGeneration.missingPickCount > 0 || productGeneration.isProcessing)
  );
}

export function hasActiveSmartPicksProductMatching(
  data: SmartPicksOverview | undefined,
): boolean {
  if (!data) return false;
  if (hasPendingSmartPicksProductGeneration(data.productGeneration)) {
    return true;
  }

  return (
    data.productGeneration.status ===
      SMART_PICKS_PRODUCT_GENERATION_STATUS.Ready &&
    hasUnmatchedSmartPicksProducts(data)
  );
}

function hasUnmatchedSmartPicksProducts(data: SmartPicksOverview): boolean {
  if (!data.productSuggestionsUnavailable) return false;

  return (
    data.priorityGaps.some((gap) => !gap.pick) ||
    data.considerGaps.some((gap) => !gap.pick) ||
    data.starterKit.steps.some(
      (step) =>
        step.status === SMART_PICKS_STARTER_KIT_STEP_STATUS.Recommended &&
        !step.pick,
    )
  );
}

function hasUnrecoverableSmartPicksProductGeneration(
  productGeneration: SmartPicksProductGenerationState | undefined,
): boolean {
  return (
    productGeneration?.reason ===
    SMART_PICKS_PRODUCT_GENERATION_REASON.MissingApiKey
  );
}

function getRetryableSmartPicksProductGenerationInterval(
  productGeneration: SmartPicksProductGenerationState | undefined,
  nowMs: number,
): number | false {
  if (!productGeneration || productGeneration.missingPickCount <= 0) {
    return false;
  }
  if (
    productGeneration.reason ===
    SMART_PICKS_PRODUCT_GENERATION_REASON.MissingApiKey
  ) {
    return false;
  }
  if (
    productGeneration.status !== SMART_PICKS_PRODUCT_GENERATION_STATUS.Failed &&
    productGeneration.status !== SMART_PICKS_PRODUCT_GENERATION_STATUS.Skipped
  ) {
    return false;
  }

  const retryAfterMs = productGeneration.retryAfter
    ? Date.parse(productGeneration.retryAfter)
    : Number.NaN;
  if (!Number.isFinite(retryAfterMs)) {
    return SMART_PICKS_PENDING_REFETCH_MS;
  }

  return Math.max(retryAfterMs - nowMs, SMART_PICKS_PENDING_REFETCH_MS);
}

export function useSmartPicksWishlist() {
  const isEnabled = useAuthEnabled();
  return useQuery<SmartPicksWishlistResponse>({
    queryKey: [QueryKey.SmartPicksWishlist],
    queryFn: ({ signal }) => getSmartPicksWishlist({ signal }),
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
