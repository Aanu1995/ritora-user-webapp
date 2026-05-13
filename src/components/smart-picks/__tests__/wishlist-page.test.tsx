import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import { WishlistPage } from "@/components/smart-picks/wishlist-page";
import {
  useDeleteSmartPicksWishlistItem,
  useSmartPicksWishlist,
} from "@/hooks/use-smart-picks";
import { SuggestionEvidenceSourceId } from "@/types/suggestions";

jest.mock("@/hooks/use-smart-picks", () => ({
  useDeleteSmartPicksWishlistItem: jest.fn(),
  useSmartPicksWishlist: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
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
  it("shows saved picks with their reason and seller names", () => {
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
              sellerNames: ["Stylevana"],
              reasoningChips: [],
              reasoningFacts: {},
              ruledOut: [],
              sourceIds: [SuggestionEvidenceSourceId.AadAcneTreatment],
              alternatives: [],
              recommendationRankReason:
                "Best fit comes first because the formula better matches the dark-mark goal.",
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

    expect(screen.getByText("Smart Picks wishlist")).toBeInTheDocument();
    expect(
      screen.getByText("Saved picks from your product gap analysis."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Why this is here")).not.toBeInTheDocument();
    expect(screen.getByText("Stylevana")).toBeInTheDocument();
    expect(
      screen.getByText(/Your goal needs a targeted treatment/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Best fit comes first because the formula better matches the dark-mark goal.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Availability unknown")).not.toBeInTheDocument();
    expect(screen.queryByText("$24.00")).not.toBeInTheDocument();
  });

  it("shows remove progress for one item and confirms when it is removed", async () => {
    const mutate = jest.fn((_actionId, options) => {
      options?.onSuccess?.(undefined, "action-1", undefined);
    });
    mockUseWishlist.mockReturnValue({
      data: { items: [wishlistItem()] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksWishlist>);
    mockUseDeleteWishlistItem.mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    } as Pick<
      ReturnType<typeof useDeleteSmartPicksWishlistItem>,
      "mutate" | "isPending" | "variables"
    > as ReturnType<typeof useDeleteSmartPicksWishlistItem>);

    renderWithProviders(<WishlistPage />);

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(mutate).toHaveBeenCalledWith("action-1", expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      "Removed from your wishlist.",
    );
  });

  it("shows a removing indicator only for the wishlist item being removed", () => {
    mockUseWishlist.mockReturnValue({
      data: {
        items: [
          wishlistItem({ actionId: "action-1" }),
          wishlistItem({ actionId: "action-2", productName: "Second Pick" }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksWishlist>);
    mockUseDeleteWishlistItem.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      variables: "action-1",
    } as Pick<
      ReturnType<typeof useDeleteSmartPicksWishlistItem>,
      "mutate" | "isPending" | "variables"
    > as ReturnType<typeof useDeleteSmartPicksWishlistItem>);

    renderWithProviders(<WishlistPage />);

    expect(screen.getByRole("button", { name: "Removing" })).toBeDisabled();
    expect(screen.queryByText("Removing")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });

  it("shows the wishlist empty state", () => {
    mockUseWishlist.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksWishlist>);
    mockUseDeleteWishlistItem.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useDeleteSmartPicksWishlistItem>);

    renderWithProviders(<WishlistPage />);

    expect(screen.getByText("No saved Smart Picks yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tap the heart on any Smart Pick recommendation to save it here. You can review saved products before comparing sellers.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("This is a shortlist, not a shopping cart."),
    ).not.toBeInTheDocument();
  });
});

function wishlistItem(
  overrides: {
    actionId?: string;
    productName?: string;
  } = {},
) {
  return {
    actionId: overrides.actionId ?? "action-1",
    savedAt: "2026-05-11T10:00:00.000Z",
    ingredientOrCategory: "PIH-aware brightening serum",
    normalizedKey: "pih-aware-brightening-serum",
    reason: "Your goal needs a targeted treatment.",
    goalAlignment: "dark marks",
    pick: {
      id: "pick-1",
      brand: "K-Beauty Brand",
      productName: overrides.productName ?? "Tone Support Serum",
      budgetTier: "mid",
      sellerNames: ["Stylevana"],
      reasoningChips: [],
      reasoningFacts: {},
      ruledOut: [],
      sourceIds: [SuggestionEvidenceSourceId.AadAcneTreatment],
      alternatives: [],
      recommendationRankReason:
        "Best fit comes first because the formula better matches the dark-mark goal.",
      userAction: "saved",
      createdAt: "2026-05-11T09:00:00.000Z",
    },
  };
}
