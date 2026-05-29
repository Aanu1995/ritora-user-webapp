import { act, waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "@/test/utils";
import {
  getSmartPicksOverviewRefetchInterval,
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
import {
  SMART_PICKS_HISTORY_READINESS_REASON,
  SMART_PICKS_PRODUCT_GENERATION_REASON,
  SMART_PICKS_PRODUCT_GENERATION_STATUS,
  SMART_PICKS_STARTER_KIT_STEP_STATUS,
} from "@/types/smart-picks";

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
    expect(mockGetOverview).toHaveBeenCalledWith(
      "refine",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    const wishlistState = renderHookWithProviders(() =>
      useSmartPicksWishlist(),
    );
    await waitFor(() =>
      expect(wishlistState.result.current.isSuccess).toBe(true),
    );
    expect(mockGetWishlist).toHaveBeenCalledWith(
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("polls while product picks are being generated", async () => {
    jest.useFakeTimers();
    mockGetOverview.mockResolvedValue({
      ...overview(),
      productSuggestionsUnavailable: true,
      productGeneration: {
        status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending,
        reason: null,
        missingPickCount: 1,
        isProcessing: true,
        attemptedAt: null,
        retryAfter: null,
      },
    });

    const overviewState = renderHookWithProviders(() =>
      useSmartPicksOverview("starter"),
    );
    await waitFor(() =>
      expect(overviewState.result.current.isSuccess).toBe(true),
    );

    mockGetOverview.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    await waitFor(() => expect(mockGetOverview).toHaveBeenCalledTimes(1));
  });

  it("keeps retrying after a temporary backend outage", async () => {
    jest.useFakeTimers();
    mockGetOverview
      .mockRejectedValueOnce(new Error("backend unavailable"))
      .mockResolvedValueOnce(overview());

    const overviewState = renderHookWithProviders(() =>
      useSmartPicksOverview("starter"),
    );
    await waitFor(() => expect(overviewState.result.current.isError).toBe(true));

    mockGetOverview.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    await waitFor(() => expect(mockGetOverview).toHaveBeenCalledTimes(1));
  });

  it("uses the Smart Picks polling cadence while generation runs", () => {
    expect(getSmartPicksOverviewRefetchInterval(undefined)).toBe(false);
    expect(
      getSmartPicksOverviewRefetchInterval({
        ...overview(),
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending,
          reason: null,
          missingPickCount: 1,
          isProcessing: true,
          attemptedAt: null,
          retryAfter: null,
        },
      }),
    ).toBe(30_000);
    expect(
      getSmartPicksOverviewRefetchInterval({
        ...overview(),
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending,
          reason: null,
          missingPickCount: 1,
          isProcessing: false,
          attemptedAt: null,
          retryAfter: null,
        },
      }),
    ).toBe(30_000);
    expect(getSmartPicksOverviewRefetchInterval(overview())).toBe(false);
  });

  it("polls again after transient product matching failures become retryable", () => {
    expect(
      getSmartPicksOverviewRefetchInterval(
        {
          ...overview(),
          productGeneration: {
            status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Failed,
            reason: SMART_PICKS_PRODUCT_GENERATION_REASON.ProviderFailed,
            missingPickCount: 1,
            isProcessing: false,
            attemptedAt: "2026-05-10T10:00:00.000Z",
            retryAfter: "2026-05-10T10:01:00.000Z",
          },
        },
        Date.parse("2026-05-10T10:00:10.000Z"),
      ),
    ).toBe(50_000);
    expect(
      getSmartPicksOverviewRefetchInterval(
        {
          ...overview(),
          productGeneration: {
            status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Failed,
            reason: SMART_PICKS_PRODUCT_GENERATION_REASON.ProviderFailed,
            missingPickCount: 1,
            isProcessing: false,
            attemptedAt: "2026-05-10T10:00:00.000Z",
            retryAfter: "2026-05-10T10:01:00.000Z",
          },
        },
        Date.parse("2026-05-10T10:01:05.000Z"),
      ),
    ).toBe(30_000);
  });

  it("does not keep polling when product matching cannot run without configuration", () => {
    expect(
      getSmartPicksOverviewRefetchInterval({
        ...overview(),
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Failed,
          reason: SMART_PICKS_PRODUCT_GENERATION_REASON.MissingApiKey,
          missingPickCount: 1,
          isProcessing: false,
          attemptedAt: "2026-05-10T10:00:00.000Z",
          retryAfter: "2026-05-10T10:01:00.000Z",
        },
      }),
    ).toBe(false);
  });

  it("keeps polling while the backend has pending product picks to return", async () => {
    jest.useFakeTimers();
    mockGetOverview.mockResolvedValue({
      ...overview(),
      productSuggestionsUnavailable: true,
      productGeneration: {
        status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending,
        reason: null,
        missingPickCount: 1,
        isProcessing: false,
        attemptedAt: null,
        retryAfter: null,
      },
    });

    const overviewState = renderHookWithProviders(() =>
      useSmartPicksOverview("starter"),
    );
    await waitFor(() =>
      expect(overviewState.result.current.isSuccess).toBe(true),
    );

    mockGetOverview.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    await waitFor(() => expect(mockGetOverview).toHaveBeenCalledTimes(1));
  });

  it("keeps polling while visible Smart Pick products are still unmatched", () => {
    expect(
      getSmartPicksOverviewRefetchInterval({
        ...overview(),
        productSuggestionsUnavailable: true,
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Ready,
          reason: null,
          missingPickCount: 0,
          isProcessing: false,
          attemptedAt: null,
          retryAfter: null,
        },
        priorityGaps: [
          {
            ...overview().priorityGaps[0]!,
            pick: null,
          },
        ],
      }),
    ).toBe(30_000);
  });

  it("keeps polling while Starter Kit recommended steps are still unmatched", () => {
    expect(
      getSmartPicksOverviewRefetchInterval({
        ...overview(),
        mode: "starter",
        productSuggestionsUnavailable: true,
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Ready,
          reason: null,
          missingPickCount: 0,
          isProcessing: false,
          attemptedAt: null,
          retryAfter: null,
        },
        priorityGaps: [],
        starterKit: {
          summary: "Start with the basics.",
          steps: [
            {
              order: 1,
              role: "cleanse",
              title: "Cleanse",
              ingredientOrCategory: "Gentle cleanser",
              normalizedKey: "gentle-cleanser",
              status: SMART_PICKS_STARTER_KIT_STEP_STATUS.Recommended,
              ownedProductId: null,
              ownedProductName: null,
              reason: "Start here.",
              pick: null,
              sourceIds: [],
            },
          ],
        },
      }),
    ).toBe(30_000);
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
    productGeneration: {
      status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Ready,
      reason: null,
      missingPickCount: 0,
      isProcessing: false,
      attemptedAt: null,
      retryAfter: null,
    },
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
