import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { SmartPicksPage } from "@/components/smart-picks/smart-picks-page";
import { useSmartPicksOverview } from "@/hooks/use-smart-picks";
import { useRecordSuggestionGapAction } from "@/hooks/use-suggestions";
import { SuggestionEvidenceSourceId } from "@/types/suggestions";
import {
  SMART_PICKS_AVAILABILITY_STATUS,
  SMART_PICKS_EMPTY_REASON,
  SMART_PICKS_GAP_KIND,
  SMART_PICKS_HISTORY_READINESS_REASON,
  SMART_PICKS_STARTER_KIT_STEP_STATUS,
  SMART_PICKS_VERIFICATION_STATUS,
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
      screen.getByText("Use this as decision support, not proof."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Photo history can show useful trends, but lighting, timing, makeup, and logging consistency can change what Ritora sees.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Retailer links and availability can change after Ritora prepares a pick. Check stock, shipping, price, and the ingredient list before buying.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Derm Store")).toBeInTheDocument();
    expect(
      screen.getByText(
        "External pick. Verify the ingredient list, price, and retailer details before buying.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Retailer details may be stale. Recheck price, stock, shipping, and ingredients before buying.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Import-only")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Verify price, stock, shipping, and ingredient lists before buying.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Best fit comes first because it is stronger for the stated skin goal.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Available near you")).toBeInTheDocument();
    expect(screen.getByText("Local Brand Local SPF 50")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The local option is easier to buy but may not match the top pick as closely.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutation.mutate).toHaveBeenCalledWith({
      sourceType: "smart_pick",
      smartPickProductSuggestionId: "pick-1",
      action: "saved",
    });
  });

  it("does not render unsafe retailer links from stale data", () => {
    const data = overview();
    const pick = data.priorityGaps[0]?.pick;
    if (!pick) throw new Error("Expected Smart Picks fixture pick.");
    pick.retailers = [
      {
        name: "Local Admin",
        url: "http://127.0.0.1:3001/admin",
        priceCents: 2200,
        currency: "USD",
        inStock: true,
        isAffiliate: false,
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

    expect(screen.queryByText("Local Admin")).not.toBeInTheDocument();
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
        "Photo trends are not clinical proof. Ritora uses them as cautious decision support.",
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

  it("keeps Starter Kit usable while product picks are being prepared", () => {
    mockUseOverview.mockReturnValue({
      data: overview({
        mode: "starter",
        productSuggestionsUnavailable: true,
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
      screen.getByText(
        "Ritora is matching product picks in the background. Your routine steps are ready now; product cards will appear here when the match is ready.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Broad-spectrum sunscreen SPF 30+"),
    ).toBeInTheDocument();
  });

  it("keeps Starter Kit visible when retailer currency data is not ISO-formatted", () => {
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
                retailers: [
                  {
                    ...pick.retailers[0],
                    currency: "local",
                  },
                ],
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
    expect(screen.getByText("Derm Store · LOCAL 22.00")).toBeInTheDocument();
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

function recordMutation() {
  return {
    mutate: jest.fn(),
    isPending: false,
  } as Pick<
    ReturnType<typeof useRecordSuggestionGapAction>,
    "mutate" | "isPending"
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
        goalAlignment: "sun protection",
        sourceIds: [SuggestionEvidenceSourceId.AadSunscreenSelection],
        gapKind: SMART_PICKS_GAP_KIND.Missing,
        replacementFor: null,
        pick: {
          id: "pick-1",
          brand: "Good Brand",
          productName: "Mineral SPF 50",
          budgetTier: "mid",
          priceCents: 2200,
          currency: "USD",
          retailers: [
            {
              name: "Derm Store",
              url: "https://example.com/spf",
              priceCents: 2200,
              currency: "USD",
              inStock: true,
              isAffiliate: true,
            },
          ],
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
              priceCents: 1800,
              currency: "USD",
              retailers: [
                {
                  name: "Local Pharmacy",
                  url: "https://example.com/local-spf",
                  priceCents: 1800,
                  currency: "USD",
                  inStock: true,
                  isAffiliate: false,
                },
              ],
              reasoningChips: [
                { tone: "location", text: "Available locally", icon: "map" },
              ],
              reasoningFacts: { fit: "Easier local access." },
              ruledOut: [],
              sourceIds: [SuggestionEvidenceSourceId.AadSunscreenSelection],
              alternatives: [],
              availabilityStatus: SMART_PICKS_AVAILABILITY_STATUS.Local,
              recommendationRankReason:
                "Easier to buy locally, but less targeted.",
              localAlternativeReason: null,
              retailerDataCheckedAt: "2026-05-01T10:00:00.000Z",
              retailerDataStale: true,
              verificationStatus: SMART_PICKS_VERIFICATION_STATUS.AiNamed,
              userAction: null,
              createdAt: "2026-05-10T10:00:00.000Z",
            },
          ],
          availabilityStatus: SMART_PICKS_AVAILABILITY_STATUS.ImportOnly,
          recommendationRankReason:
            "Best fit comes first because it is stronger for the stated skin goal.",
          localAlternativeReason:
            "The local option is easier to buy but may not match the top pick as closely.",
          retailerDataCheckedAt: "2026-05-01T10:00:00.000Z",
          retailerDataStale: true,
          verificationStatus: SMART_PICKS_VERIFICATION_STATUS.AiNamed,
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
