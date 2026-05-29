import {
  NO_CLIENT_SIDE_REQUEST_TIMEOUT_MS,
  type ApiRequestOptions,
  deleteRequest,
  getRequest,
  patchRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  SmartPicksMode,
  SmartPicksOverview,
  SmartPicksWishlistResponse,
  UpdateSmartPicksBudgetPayload,
} from "@/types/smart-picks";

export const SMART_PICKS_OVERVIEW_REQUEST_TIMEOUT_MS =
  NO_CLIENT_SIDE_REQUEST_TIMEOUT_MS;

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function getSmartPicksOverview(
  mode?: SmartPicksMode,
  options?: ApiRequestOptions,
): Promise<SmartPicksOverview> {
  const params = new URLSearchParams();
  if (mode) params.set("mode", mode);
  const query = params.toString();
  return getWithOptions<SmartPicksOverview>(
    query ? `${ApiPath.SmartPicksOverview}?${query}` : ApiPath.SmartPicksOverview,
    { ...options, timeout: SMART_PICKS_OVERVIEW_REQUEST_TIMEOUT_MS },
  );
}

export async function getSmartPicksWishlist(
  options?: ApiRequestOptions,
): Promise<SmartPicksWishlistResponse> {
  return getWithOptions<SmartPicksWishlistResponse>(
    ApiPath.SmartPicksWishlist,
    options,
  );
}

export async function deleteSmartPicksWishlistItem(id: string): Promise<void> {
  await deleteRequest<unknown>(ApiPath.SmartPicksWishlistItem(id));
}

export async function updateSmartPicksBudget(
  payload: UpdateSmartPicksBudgetPayload,
): Promise<SmartPicksOverview> {
  return patchRequest<SmartPicksOverview>(ApiPath.SmartPicksBudget, payload);
}
