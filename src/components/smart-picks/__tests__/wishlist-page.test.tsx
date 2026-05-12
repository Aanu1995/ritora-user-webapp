import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { WishlistPage } from "@/components/smart-picks/wishlist-page";
import {
  useDeleteSmartPicksWishlistItem,
  useSmartPicksWishlist,
} from "@/hooks/use-smart-picks";
import { SuggestionEvidenceSourceId } from "@/types/suggestions";
import {
  SMART_PICKS_AVAILABILITY_STATUS,
  SMART_PICKS_VERIFICATION_STATUS,
} from "@/types/smart-picks";

jest.mock("@/hooks/use-smart-picks", () => ({
  useDeleteSmartPicksWishlistItem: jest.fn(),
  useSmartPicksWishlist: jest.fn(),
}));

const mockUseWishlist = useSmartPicksWishlist as jest.MockedFunction<
  typeof useSmartPicksWishlist
>;
const mockUseDeleteWishlistItem =
  useDeleteSmartPicksWishlistItem as jest.MockedFunction<
    typeof useDeleteSmartPicksWishlistItem
  >;

afterEach(() => {
  jest.clearAllMocks();
});

describe("WishlistPage", () => {
  it("keeps availability and best-fit reasoning visible for saved picks", () => {
    mockUseWishlist.mockReturnValue({
      data: {
        items: [
          {
            actionId: "action-1",
            savedAt: "2026-05-11T10:00:00.000Z",
            ingredientOrCategory: "PIH-aware brightening serum",
            normalizedKey: "pih-aware-brightening-serum",
            reason: "Your goal needs a targeted treatment.",
            goalAlignment: "dark marks",
            pick: {
              id: "pick-1",
              brand: "K-Beauty Brand",
              productName: "Tone Support Serum",
              budgetTier: "mid",
              priceCents: 2400,
              currency: "USD",
              retailers: [],
              reasoningChips: [],
              reasoningFacts: {},
              ruledOut: [],
              sourceIds: [SuggestionEvidenceSourceId.AadAcneTreatment],
              alternatives: [],
              availabilityStatus: SMART_PICKS_AVAILABILITY_STATUS.ImportOnly,
              recommendationRankReason:
                "Best fit comes first because the formula better matches the dark-mark goal.",
              localAlternativeReason: null,
              retailerDataCheckedAt: "2026-05-01T09:00:00.000Z",
              retailerDataStale: true,
              verificationStatus: SMART_PICKS_VERIFICATION_STATUS.AiNamed,
              userAction: "saved",
              createdAt: "2026-05-11T09:00:00.000Z",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksWishlist>);
    mockUseDeleteWishlistItem.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useDeleteSmartPicksWishlistItem>);

    renderWithProviders(<WishlistPage />);

    expect(screen.getByText("Import-only")).toBeInTheDocument();
    expect(screen.getByText("Best match")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Best fit comes first because the formula better matches the dark-mark goal.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Retailer details may be stale. Recheck price, stock, shipping, and ingredients before buying.",
      ),
    ).toBeInTheDocument();
  });
});
