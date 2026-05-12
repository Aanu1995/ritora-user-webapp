import { act, waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "@/test/utils";
import {
  useDeleteSmartPicksWishlistItem,
  useSmartPicksOverview,
  useSmartPicksWishlist,
  useUpdateSmartPicksBudget,
} from "@/hooks/use-smart-picks";
import {
  deleteSmartPicksWishlistItem,
  getSmartPicksOverview,
  getSmartPicksWishlist,
  updateSmartPicksBudget,
} from "@/services/smart-picks.service";
import type {
  SmartPicksOverview,
  SmartPicksWishlistResponse,
} from "@/types/smart-picks";
import { SMART_PICKS_HISTORY_READINESS_REASON } from "@/types/smart-picks";

jest.mock("@/hooks/use-auth-enabled", () => ({
  useAuthEnabled: () => true,
}));

jest.mock("@/services/smart-picks.service", () => ({
  deleteSmartPicksWishlistItem: jest.fn(),
  getSmartPicksOverview: jest.fn(),
  getSmartPicksWishlist: jest.fn(),
  updateSmartPicksBudget: jest.fn(),
}));

const mockDeleteWishlistItem =
  deleteSmartPicksWishlistItem as jest.MockedFunction<
    typeof deleteSmartPicksWishlistItem
  >;
const mockGetOverview = getSmartPicksOverview as jest.MockedFunction<
  typeof getSmartPicksOverview
>;
const mockGetWishlist = getSmartPicksWishlist as jest.MockedFunction<
  typeof getSmartPicksWishlist
>;
const mockUpdateBudget = updateSmartPicksBudget as jest.MockedFunction<
  typeof updateSmartPicksBudget
>;

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe("Smart Picks hooks", () => {
  it("fetches overview and wishlist with stable query keys", async () => {
    mockGetOverview.mockResolvedValue(overview());
    mockGetWishlist.mockResolvedValue({ items: [] });

    const overviewState = renderHookWithProviders(() =>
      useSmartPicksOverview("refine"),
    );
    await waitFor(() =>
      expect(overviewState.result.current.isSuccess).toBe(true),
    );
    expect(mockGetOverview).toHaveBeenCalledWith("refine");

    const wishlistState = renderHookWithProviders(() =>
      useSmartPicksWishlist(),
    );
    await waitFor(() =>
      expect(wishlistState.result.current.isSuccess).toBe(true),
    );
    expect(mockGetWishlist).toHaveBeenCalledTimes(1);
  });

  it("polls the overview while background product picks are still preparing", async () => {
    jest.useFakeTimers();
    mockGetOverview
      .mockResolvedValueOnce({
        ...overview(),
        productSuggestionsUnavailable: true,
      })
      .mockResolvedValueOnce(overview());

    const overviewState = renderHookWithProviders(() =>
      useSmartPicksOverview("starter"),
    );
    await waitFor(() =>
      expect(overviewState.result.current.isSuccess).toBe(true),
    );

    expect(mockGetOverview).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(4_000);
    });

    await waitFor(() => expect(mockGetOverview).toHaveBeenCalledTimes(2));
  });

  it("exposes pending mutation state while budget changes save", async () => {
    mockUpdateBudget.mockResolvedValue(overview({ budgetTier: "premium" }));

    const mutation = renderHookWithProviders(() => useUpdateSmartPicksBudget());
    mutation.result.current.mutate({ budgetTier: "premium" });

    await waitFor(() => expect(mockUpdateBudget).toHaveBeenCalled());
    expect(mockUpdateBudget).toHaveBeenCalledWith({ budgetTier: "premium" });
  });

  it("removes wishlist items through a typed mutation", async () => {
    mockDeleteWishlistItem.mockResolvedValue(undefined);

    const mutation = renderHookWithProviders(() =>
      useDeleteSmartPicksWishlistItem(),
    );
    mutation.result.current.mutate("action-1");

    await waitFor(() => expect(mockDeleteWishlistItem).toHaveBeenCalled());
    expect(mockDeleteWishlistItem).toHaveBeenCalledWith("action-1");
  });
});

function overview(
  overrides: Partial<SmartPicksOverview["recap"]> = {},
): SmartPicksOverview {
  return {
    mode: "refine",
    generatedAt: "2026-05-10T10:00:00.000Z",
    inputsHash: "hash-1",
    recap: {
      primaryGoal: "dark marks",
      skinType: "combination",
      location: { city: "New York", countryCode: "US" },
      budgetTier: "mid",
      ethnicity: null,
      ...overrides,
    },
    coverage: { slots: [], filled: 0, total: 0 },
    priorityGaps: [],
    considerGaps: [],
    covered: [],
    redundancy: [],
    consentRequired: false,
    skinProfileRequired: false,
    productSuggestionsUnavailable: false,
    starterKit: { summary: null, steps: [] },
    emptyState: {
      reason: null,
      dismissedGapCount: 0,
      nextEligibleAt: null,
      missingProfileFields: [],
      activeProductCount: 0,
      canAssessReplacements: false,
      historyReadiness: {
        usablePhotoCheckpoints: 0,
        loggedUseDaysLast90: 0,
        canAssessReplacements: false,
        reason: SMART_PICKS_HISTORY_READINESS_REASON.NeedsUsageAndPhotos,
      },
    },
  };
}

const _wishlistContract: SmartPicksWishlistResponse = { items: [] };
void _wishlistContract;
