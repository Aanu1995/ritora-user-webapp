import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import { SmartPicksPage } from "@/components/smart-picks/smart-picks-page";
import { useSmartPicksOverview } from "@/hooks/use-smart-picks";
import { useRecordSuggestionGapAction } from "@/hooks/use-suggestions";
import { SuggestionEvidenceSourceId } from "@/types/suggestions";
import {
  SMART_PICKS_EMPTY_REASON,
  SMART_PICKS_GAP_KIND,
  SMART_PICKS_HISTORY_READINESS_REASON,
  SMART_PICKS_PRODUCT_GENERATION_STATUS,
  SMART_PICKS_STARTER_KIT_STEP_STATUS,
} from "@/types/smart-picks";
import type { SmartPicksOverview } from "@/types/smart-picks";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/hooks/use-smart-picks", () => ({
  useSmartPicksOverview: jest.fn(),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useRecordSuggestionGapAction: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUseOverview = useSmartPicksOverview as jest.MockedFunction<
  typeof useSmartPicksOverview
>;
const mockUseRecordGapAction =
  useRecordSuggestionGapAction as jest.MockedFunction<
    typeof useRecordSuggestionGapAction
  >;

afterEach(() => {
  jest.clearAllMocks();
});

describe("SmartPicksPage", () => {
  it("renders a loading skeleton while overview fetches", () => {
    mockUseOverview.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByTestId("smart-picks-skeleton")).toBeInTheDocument();
  });

  it("shows the consent state instead of product cards", () => {
    mockUseOverview.mockReturnValue({
      data: overview({ consentRequired: true, priorityGaps: [] }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Smart Picks is off")).toBeInTheDocument();
    expect(screen.queryByText("Mineral SPF 50")).not.toBeInTheDocument();
  });

  it("renders priority gaps and saves picks through the shared gap-action endpoint", async () => {
    const mutation = recordMutation();
    mockUseOverview.mockReturnValue({
      data: overview(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(mutation);

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Mineral SPF 50")).toBeInTheDocument();
    expect(
      screen.getByText("Use this as guidance, not a diagnosis."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Photos and logs help Ritora spot patterns over time, but they are not clinical proof. Lighting, timing, makeup, and skipped logs can change the picture.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ritora suggests product names and reputable places to check, not prices or shopping links. Compare sellers yourself and confirm the ingredient list before buying.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ritora gets more useful when your logs and photos stay consistent. When the evidence is thin, it will say so rather than guess.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/These picks use/i)).not.toBeInTheDocument();
    expect(screen.getByText("Derm Store")).toBeInTheDocument();
    expect(screen.getByText("Places to check")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Derm Store" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("$22.00")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Seller names are a starting point. Check more than one reputable seller before you decide.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your shelf has no sunscreen role."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Best fit comes first because it is stronger for the stated skin goal.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Best match")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      {
        sourceType: "smart_pick",
        smartPickProductSuggestionId: "pick-1",
        action: "saved",
      },
      expect.any(Object),
    );
  });

  it("shows save progress for the active pick and confirms when it is saved", async () => {
    const mutate = jest.fn((payload, options) => {
      options?.onSuccess?.(
        {
          sourceType: "smart_pick",
          suggestionInstanceId: null,
          smartPickProductSuggestionId: "pick-1",
          ingredientOrCategory: "Broad-spectrum sunscreen SPF 30+",
          normalizedKey: "broad-spectrum-sunscreen-spf-30",
          action: "saved",
        },
        payload,
        undefined,
      );
    });
    mockUseOverview.mockReturnValue({
      data: overview(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation({ mutate }));

    renderWithProviders(<SmartPicksPage />);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(toast.success).toHaveBeenCalledWith(
      "Saved. You can find it in your wishlist.",
    );
  });

  it("shows a saving indicator only on the product being saved", () => {
    const currentOverview = overview();
    const firstGap = currentOverview.priorityGaps[0];
    if (!firstGap?.pick) throw new Error("Expected Smart Picks fixture pick.");
    const secondGap = {
      ...firstGap,
      ingredientOrCategory: "Barrier-support moisturizer",
      normalizedKey: "barrier-support-moisturizer",
      pick: {
        ...firstGap.pick,
        id: "pick-2",
        productName: "Barrier Cream",
      },
    };
    mockUseOverview.mockReturnValue({
      data: overview({ priorityGaps: [firstGap, secondGap] }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(
      recordMutation({
        isPending: true,
        variables: {
          sourceType: "smart_pick",
          smartPickProductSuggestionId: "pick-1",
          action: "saved",
        },
      }),
    );

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("shows spinner-only feedback while dismissing a product", () => {
    mockUseOverview.mockReturnValue({
      data: overview(),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(
      recordMutation({
        isPending: true,
        variables: {
          sourceType: "smart_pick",
          smartPickProductSuggestionId: "pick-1",
          action: "dismissed",
        },
      }),
    );

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByRole("button", { name: "Dismissing" })).toBeDisabled();
    expect(screen.queryByText("Dismissing")).not.toBeInTheDocument();
  });

  it("renders coverage from goal-specific roles instead of a fixed checklist", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        coverage: {
          filled: 1,
          total: 4,
          slots: [
            {
              role: "spf",
              state: "filled",
              filledByProductId: "spf-1",
              filledByName: "Daily SPF",
              goalRelevance: "essential",
            },
            {
              role: "dark-spot-treatment",
              state: "missing-priority",
              filledByProductId: null,
              filledByName: null,
              goalRelevance: "essential",
            },
            {
              role: "antioxidant",
              state: "missing",
              filledByProductId: null,
              filledByName: null,
              goalRelevance: "supportive",
            },
            {
              role: "exfoliation-mask",
              state: "missing",
              filledByProductId: null,
              filledByName: null,
              goalRelevance: "optional",
            },
          ],
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Pigment serum")).toBeInTheDocument();
    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
    expect(screen.getByText("Mask or peel")).toBeInTheDocument();
    expect(screen.queryByText("Eye")).not.toBeInTheDocument();
  });

  it("deduplicates seller names from the API", () => {
    const data = overview();
    const pick = data.priorityGaps[0]?.pick;
    if (!pick) throw new Error("Expected Smart Picks fixture pick.");
    pick.sellerNames = ["Derm Store", "Derm Store", "Stylevana"];
    mockUseOverview.mockReturnValue({
      data,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Derm Store")).toBeInTheDocument();
    expect(screen.getByText("Stylevana")).toBeInTheDocument();
  });

  it("places worth considering before the final reassurance footer", () => {
    const data = overview();
    const priorityGap = data.priorityGaps[0];
    if (!priorityGap?.pick) {
      throw new Error("Expected Smart Picks fixture gap and pick.");
    }
    mockUseOverview.mockReturnValue({
      data: overview({
        considerGaps: [
          {
            ...priorityGap,
            ingredientOrCategory: "Peptide serum",
            normalizedKey: "peptide-serum",
            priority: "consider",
            reason:
              "Optional support if you want to go beyond the basics. This longer explanation should stay out of the card because Worth considering needs to scan quickly.",
            shortReason:
              "Optional support if you want to go beyond the basics.",
            goalAlignment: "supportive care",
            pick: {
              ...priorityGap.pick,
              id: "pick-consider",
              productName: "Peptide Serum",
              alternatives: [],
            },
          },
        ],
        covered: [
          {
            role: "spf",
            productName: "Daily SPF",
            reason: "Your shelf already covers this.",
          },
        ],
        redundancy: [
          {
            activeTag: "niacinamide",
            hint: "You already have a niacinamide product.",
            products: [
              {
                id: "owned-1",
                brand: "Owned",
                name: "Niacinamide Serum",
                recommendation: "keep",
              },
            ],
          },
        ],
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    const coveredHeading = screen.getByRole("heading", {
      name: "You're set here",
    });
    const redundancyHeading = screen.getByRole("heading", {
      name: "Duplicate active check",
    });
    const considerHeading = screen.getByRole("heading", {
      name: "Worth considering",
    });
    const footerTitle = screen.getByText(
      "Ritora won't recommend something you don't need.",
    );

    expect(
      coveredHeading.compareDocumentPosition(considerHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      redundancyHeading.compareDocumentPosition(considerHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      considerHeading.compareDocumentPosition(footerTitle) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByTestId("smart-picks-consider-section-icon"),
    ).toBeInTheDocument();
    expect(screen.getByText("Why:")).toBeInTheDocument();
    expect(
      screen.getByText("Optional support if you want to go beyond the basics."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/This longer explanation should stay out of the card/),
    ).not.toBeInTheDocument();
  });

  it("clearly explains when a pick is recommended as a replacement", () => {
    const data = overview();
    const firstGap = data.priorityGaps[0];
    if (!firstGap) throw new Error("Expected Smart Picks fixture gap.");
    data.priorityGaps = [
      {
        ...firstGap,
        ingredientOrCategory: "Replacement for Current Brightening Serum",
        normalizedKey: "replacement-for-current-brightening-serum",
        reason:
          "42 logged use days and photo history still shows hyperpigmentation.",
        gapKind: SMART_PICKS_GAP_KIND.Replacement,
        replacementFor: {
          productId: "owned-1",
          brand: "Current Brand",
          productName: "Current Brightening Serum",
          category: "serum",
          usageDaysLast30: 16,
          usageDaysLast90: 42,
          firstUsedAt: "2026-02-20",
          lastUsedAt: "2026-05-10",
          adherence: "consistent",
          goalTrend: "not_improving",
          concernTrend: "hyperpigmentation",
          photoCheckpoints: 3,
          reactionSignalCount: 0,
          replacementCandidate: true,
          replacementReason:
            "42 logged use days and photo history still shows hyperpigmentation.",
        },
      },
    ];
    mockUseOverview.mockReturnValue({
      data,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(
      screen.getAllByText("Replacement for Current Brightening Serum").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("42 use days in 90d")).toBeInTheDocument();
    expect(screen.getByText("3 photo checkpoints")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Photos can support a replacement decision, but they do not prove a product failed. Ritora waits for enough logged use and repeat photo checkpoints before suggesting a swap.",
      ),
    ).toBeInTheDocument();
  });

  it("does not describe dismissed picks as a complete shelf", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        priorityGaps: [],
        emptyState: {
          ...emptyState(),
          reason: SMART_PICKS_EMPTY_REASON.AllGapsDismissed,
          dismissedGapCount: 2,
          nextEligibleAt: "2026-06-11T09:00:00.000Z",
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Nothing new today")).toBeInTheDocument();
    expect(screen.getByText("2 hidden picks")).toBeInTheDocument();
    expect(
      screen.queryByText("Your shelf is complete"),
    ).not.toBeInTheDocument();
  });

  it("keeps the duplicate active check visible when there are no gaps to buy", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        priorityGaps: [],
        redundancy: [
          {
            activeTag: "salicylic_acid",
            hint: "You have more than one salicylic acid product.",
            products: [
              {
                id: "owned-1",
                brand: "Owned",
                name: "Cleanser",
                recommendation: "keep",
              },
            ],
          },
        ],
        emptyState: {
          ...emptyState(),
          reason: SMART_PICKS_EMPTY_REASON.RedundancyOnly,
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("No new products to buy")).toBeInTheDocument();
    expect(screen.getByText("Duplicate active check")).toBeInTheDocument();
    expect(
      screen.getByText("You have more than one salicylic acid product."),
    ).toBeInTheDocument();
  });

  it("renders Starter Kit as an ordered beginner routine instead of normal gap cards", () => {
    const starterOverview = overview({
      mode: "starter",
      starterKit: {
        summary: "Start with the essentials. Add treatment last.",
        steps: [
          starterStep({
            order: 1,
            role: "cleanse",
            title: "Cleanse",
            ingredientOrCategory: "Gentle fragrance-free cleanser",
            normalizedKey: "gentle-fragrance-free-cleanser",
            status: SMART_PICKS_STARTER_KIT_STEP_STATUS.Recommended,
            ownedProductId: null,
            ownedProductName: null,
            reason: "Begin with a gentle cleanse step.",
            pick: overview().priorityGaps[0]?.pick ?? null,
          }),
          starterStep({
            order: 2,
            role: "moisturise",
            title: "Moisturise",
            ingredientOrCategory: "Barrier-support moisturizer",
            normalizedKey: "barrier-support-moisturizer",
            status: SMART_PICKS_STARTER_KIT_STEP_STATUS.Recommended,
            ownedProductId: null,
            ownedProductName: null,
            reason: "Keep the barrier comfortable.",
          }),
        ],
      },
    });
    mockUseOverview.mockReturnValue({
      data: starterOverview,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Starter routine")).toBeInTheDocument();
    expect(
      screen.getByText("Start with the essentials. Add treatment last."),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(
      screen.getByText("Gentle fragrance-free cleanser"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Priority gaps")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Duplicate active check"),
    ).not.toBeInTheDocument();
  });

  it("keeps starter steps visible while product picks are still processing", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        productSuggestionsUnavailable: true,
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Pending,
          reason: null,
          missingPickCount: 1,
          isProcessing: true,
          attemptedAt: null,
          retryAfter: null,
        },
        starterKit: {
          summary: "Start with the essentials. Add treatment last.",
          steps: [
            starterStep({
              order: 1,
              role: "spf",
              title: "Protect",
              ingredientOrCategory: "Broad-spectrum sunscreen SPF 30+",
              normalizedKey: "broad-spectrum-sunscreen-spf-30",
              reason: "Daily sunscreen is the protection step.",
              pick: null,
            }),
          ],
        },
      }),
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Starter routine")).toBeInTheDocument();
    expect(
      screen.getByText("Broad-spectrum sunscreen SPF 30+"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Product name is still being matched for this step."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your product picks are being prepared"),
    ).not.toBeInTheDocument();
  });

  it("shows a clear message when product matching failed instead of endless matching copy", () => {
    const failedGap = overview().priorityGaps[0];
    if (!failedGap) throw new Error("Expected Smart Picks fixture gap.");
    mockUseOverview.mockReturnValue({
      data: overview({
        productSuggestionsUnavailable: true,
        productGeneration: {
          status: SMART_PICKS_PRODUCT_GENERATION_STATUS.Failed,
          reason: "provider_failed",
          missingPickCount: 1,
          isProcessing: false,
          attemptedAt: "2026-05-10T10:05:00.000Z",
          retryAfter: "2026-05-10T10:10:00.000Z",
        },
        priorityGaps: [
          {
            ...failedGap,
            pick: null,
          },
        ],
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(
      screen.getByText("Product name could not be matched yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The gap is still useful, but the product match did not finish. Check back later and Ritora will try again.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Product name is still being matched."),
    ).not.toBeInTheDocument();
  });

  it("shows Starter Kit seller names without links or prices", () => {
    const pick = overview().priorityGaps[0]?.pick;
    if (!pick) throw new Error("Expected Smart Picks fixture pick.");
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        priorityGaps: [],
        starterKit: {
          summary: "Start with the essentials. Add treatment last.",
          steps: [
            starterStep({
              pick: {
                ...pick,
                sellerNames: ["Derm Store"],
              },
            }),
          ],
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Starter routine")).toBeInTheDocument();
    expect(screen.getByText("Start here.")).toBeInTheDocument();
    expect(screen.getByText("Derm Store")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Derm Store" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("LOCAL 22.00")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Best fit comes first because it is stronger for the stated skin goal.",
      ),
    ).not.toBeInTheDocument();
  });

  it("shows spinner-only feedback while saving a Starter Kit pick", () => {
    const pick = overview().priorityGaps[0]?.pick;
    if (!pick) throw new Error("Expected Smart Picks fixture pick.");
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        priorityGaps: [],
        starterKit: {
          summary: "Start with the essentials. Add treatment last.",
          steps: [starterStep({ pick })],
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(
      recordMutation({
        isPending: true,
        variables: {
          sourceType: "smart_pick",
          smartPickProductSuggestionId: pick.id,
          action: "saved",
        },
      }),
    );

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();
  });

  it("does not render blank Starter Kit seller names", () => {
    const pick = overview().priorityGaps[0]?.pick;
    if (!pick) throw new Error("Expected Smart Picks fixture pick.");
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        priorityGaps: [],
        starterKit: {
          summary: "Start with the essentials. Add treatment last.",
          steps: [
            starterStep({
              pick: {
                ...pick,
                sellerNames: ["   "],
              },
            }),
          ],
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Starter routine")).toBeInTheDocument();
    expect(screen.queryByText("Places to check")).not.toBeInTheDocument();
  });

  it("shows owned Starter Kit steps as already covered", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        priorityGaps: [],
        starterKit: {
          summary: "You already own part of the starter routine.",
          steps: [
            starterStep({
              order: 1,
              role: "cleanse",
              title: "Cleanse",
              ingredientOrCategory: "Gentle fragrance-free cleanser",
              normalizedKey: "gentle-fragrance-free-cleanser",
              status: SMART_PICKS_STARTER_KIT_STEP_STATUS.Covered,
              ownedProductId: "owned-1",
              ownedProductName: "Owned Cleanser",
              reason: "This already covers your cleanse step.",
              pick: null,
            }),
          ],
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Already covered")).toBeInTheDocument();
    expect(screen.getByText("Owned Cleanser")).toBeInTheDocument();
  });

  it("shows a wait state when Starter Kit treatment is not needed yet", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        priorityGaps: [],
        starterKit: {
          summary: "Build the basics before adding treatment.",
          steps: [
            starterStep({
              order: 4,
              role: "treat",
              title: "Treat",
              ingredientOrCategory: "Treat",
              normalizedKey: "treat",
              status: SMART_PICKS_STARTER_KIT_STEP_STATUS.Wait,
              ownedProductId: null,
              ownedProductName: null,
              reason:
                "Your current goal does not need a treatment product yet. Build cleanser, moisturizer, and sunscreen first.",
              pick: null,
            }),
          ],
        },
      }),
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useSmartPicksOverview>);
    mockUseRecordGapAction.mockReturnValue(recordMutation());

    renderWithProviders(<SmartPicksPage />);

    expect(screen.getByText("Wait")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your current goal does not need a treatment product yet. Build cleanser, moisturizer, and sunscreen first.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
  });
});

function recordMutation(
  overrides: Partial<
    Pick<
      ReturnType<typeof useRecordSuggestionGapAction>,
      "mutate" | "isPending" | "variables"
    >
  > = {},
) {
  return {
    mutate: jest.fn(),
    isPending: false,
    variables: undefined,
    ...overrides,
  } as Pick<
    ReturnType<typeof useRecordSuggestionGapAction>,
    "mutate" | "isPending" | "variables"
  > as ReturnType<typeof useRecordSuggestionGapAction>;
}

function overview(
  overrides: Partial<SmartPicksOverview> = {},
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
    },
    coverage: {
      filled: 3,
      total: 5,
      slots: [
        {
          role: "spf",
          state: "missing-priority",
          filledByProductId: null,
          filledByName: null,
          goalRelevance: "essential",
        },
      ],
    },
    priorityGaps: [
      {
        ingredientOrCategory: "Broad-spectrum sunscreen SPF 30+",
        normalizedKey: "broad-spectrum-sunscreen-spf-30",
        priority: "priority",
        reason: "Your shelf has no sunscreen role.",
        shortReason: "Your shelf has no sunscreen role.",
        goalAlignment: "sun protection",
        sourceIds: [
          SuggestionEvidenceSourceId.AadSunscreenSelection,
          SuggestionEvidenceSourceId.AadMelasmaTreatment,
          SuggestionEvidenceSourceId.DermNetPostInflammatoryHyperpigmentation,
        ],
        gapKind: SMART_PICKS_GAP_KIND.Missing,
        replacementFor: null,
        pick: {
          id: "pick-1",
          brand: "Good Brand",
          productName: "Mineral SPF 50",
          budgetTier: "mid",
          sellerNames: ["Derm Store"],
          reasoningChips: [
            { tone: "ethnicity", text: "white-cast checked", icon: "check" },
          ],
          reasoningFacts: { fit: "Good for daily protection." },
          ruledOut: [],
          sourceIds: [SuggestionEvidenceSourceId.AadSunscreenSelection],
          alternatives: [
            {
              id: "pick-1:alt:1",
              brand: "Local Brand",
              productName: "Local SPF 50",
              budgetTier: "mid",
              sellerNames: ["Local Pharmacy"],
              reasoningChips: [
                { tone: "location", text: "Available locally", icon: "map" },
              ],
              reasoningFacts: { fit: "Easier local access." },
              ruledOut: [],
              sourceIds: [SuggestionEvidenceSourceId.AadSunscreenSelection],
              alternatives: [],
              recommendationRankReason: "Alternative match, but less targeted.",
              userAction: null,
              createdAt: "2026-05-10T10:00:00.000Z",
            },
          ],
          recommendationRankReason:
            "Best fit comes first because it is stronger for the stated skin goal.",
          userAction: null,
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      },
    ],
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
    emptyState: emptyState(),
    starterKit: { summary: null, steps: [] },
    ...overrides,
  };
}

function starterStep(
  overrides: Partial<SmartPicksOverview["starterKit"]["steps"][number]> = {},
): SmartPicksOverview["starterKit"]["steps"][number] {
  return {
    order: 1,
    role: "cleanse",
    title: "Cleanse",
    ingredientOrCategory: "Gentle fragrance-free cleanser",
    normalizedKey: "gentle-fragrance-free-cleanser",
    status: SMART_PICKS_STARTER_KIT_STEP_STATUS.Recommended,
    ownedProductId: null,
    ownedProductName: null,
    reason: "Start here.",
    pick: null,
    sourceIds: [SuggestionEvidenceSourceId.MayoDrySkinCare],
    ...overrides,
  };
}

function emptyState(): SmartPicksOverview["emptyState"] {
  return {
    reason: null,
    dismissedGapCount: 0,
    nextEligibleAt: null,
    missingProfileFields: [],
    activeProductCount: 4,
    canAssessReplacements: true,
    historyReadiness: {
      usablePhotoCheckpoints: 3,
      loggedUseDaysLast90: 42,
      canAssessReplacements: true,
      reason: SMART_PICKS_HISTORY_READINESS_REASON.Ready,
    },
  };
}
