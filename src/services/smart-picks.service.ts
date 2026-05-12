import { deleteRequest, getRequest, patchRequest } from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  SmartPicksMode,
  SmartPicksOverview,
  SmartPicksWishlistResponse,
  UpdateSmartPicksBudgetPayload,
} from "@/types/smart-picks";

export async function getSmartPicksOverview(
  mode?: SmartPicksMode,
): Promise<SmartPicksOverview> {
  const params = new URLSearchParams();
  if (mode) params.set("mode", mode);
  const query = params.toString();
  return getRequest<SmartPicksOverview>(
    query ? `${ApiPath.SmartPicksOverview}?${query}` : ApiPath.SmartPicksOverview,
  );
}

export async function getSmartPicksWishlist(): Promise<SmartPicksWishlistResponse> {
  return getRequest<SmartPicksWishlistResponse>(ApiPath.SmartPicksWishlist);
}

export async function deleteSmartPicksWishlistItem(id: string): Promise<void> {
  await deleteRequest<unknown>(ApiPath.SmartPicksWishlistItem(id));
}

export async function updateSmartPicksBudget(
  payload: UpdateSmartPicksBudgetPayload,
): Promise<SmartPicksOverview> {
  return patchRequest<SmartPicksOverview>(ApiPath.SmartPicksBudget, payload);
}
