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
import type { SmartPicksWishlistItem } from "@/types/smart-picks";

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

type SmartPicksWishlistQueryResult = ReturnType<typeof useSmartPicksWishlist>;
type DeleteSmartPicksWishlistMutationResult = ReturnType<
  typeof useDeleteSmartPicksWishlistItem
>;

function smartPicksWishlistQueryResult(
  result: Partial<SmartPicksWishlistQueryResult>,
): SmartPicksWishlistQueryResult {
  return result as SmartPicksWishlistQueryResult;
}

function deleteSmartPicksWishlistMutationResult(
  result: Partial<DeleteSmartPicksWishlistMutationResult>,
): DeleteSmartPicksWishlistMutationResult {
  return result as DeleteSmartPicksWishlistMutationResult;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("WishlistPage", () => {
  it("shows saved picks with their reason and seller names", () => {
    mockUseWishlist.mockReturnValue(smartPicksWishlistQueryResult({
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
    }));
    mockUseDeleteWishlistItem.mockReturnValue(deleteSmartPicksWishlistMutationResult({
      mutate: jest.fn(),
      isPending: false,
    }));

    renderWithProviders(<WishlistPage />);

    expect(screen.getByText("Smart Picks wishlist")).toBeInTheDocument();
    expect(
      screen.getByText("Picks you saved to revisit before buying."),
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
    mockUseWishlist.mockReturnValue(smartPicksWishlistQueryResult({
      data: { items: [wishlistItem()] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    mockUseDeleteWishlistItem.mockReturnValue(deleteSmartPicksWishlistMutationResult({
      mutate,
      isPending: false,
      variables: undefined,
    }));

    renderWithProviders(<WishlistPage />);

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(mutate).toHaveBeenCalledWith("action-1", expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      "Removed from your wishlist.",
    );
  });

  it("shows a removing indicator only for the wishlist item being removed", () => {
    mockUseWishlist.mockReturnValue(smartPicksWishlistQueryResult({
      data: {
        items: [
          wishlistItem({ actionId: "action-1" }),
          wishlistItem({ actionId: "action-2", productName: "Second Pick" }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    mockUseDeleteWishlistItem.mockReturnValue(deleteSmartPicksWishlistMutationResult({
      mutate: jest.fn(),
      isPending: true,
      variables: "action-1",
    }));

    renderWithProviders(<WishlistPage />);

    expect(screen.getByRole("button", { name: "Removing" })).toBeDisabled();
    expect(screen.queryByText("Removing")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });

  it("shows the wishlist empty state", () => {
    mockUseWishlist.mockReturnValue(smartPicksWishlistQueryResult({
      data: { items: [] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    mockUseDeleteWishlistItem.mockReturnValue(deleteSmartPicksWishlistMutationResult({
      mutate: jest.fn(),
      isPending: false,
    }));

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
): SmartPicksWishlistItem {
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
