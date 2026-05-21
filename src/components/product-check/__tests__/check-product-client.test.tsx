import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { CheckProductClient } from "@/components/product-check/check-product-client";
import { ProductCheckResultDetails } from "@/components/product-check/product-check-result-details";
import {
  AnalysisConfidence,
  IngredientCategory,
  AnalysisSeverity,
  AnalysisMode,
  AnalysisStatus,
  ProductCheckAlternativeSource,
  ProductCheckAiReviewStatus,
  ProductCheckContextSignal,
  ProductCheckEvidenceKind,
  ProductCheckNextAction,
  ProductCheckPurchaseGuidanceReasonCode,
  ProductCheckPersonalizationLevel,
  ProductCheckSource,
  ProductCheckTone,
  ProductCheckVerdict,
  ProductCompareGoal,
  type ProductCheckResponse,
} from "@/types/ingredients";
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  ProductCategory,
  ShelfStatus,
  type ResolvedLookup,
  type ShelfProductDraft,
} from "@/types/shelf";

const mockCheckMutate = jest.fn();
const mockCompareMutate = jest.fn();
const mockExtractMutate = jest.fn();
const mockToastError = jest.fn();
let capabilityOverrides: Partial<Record<string, boolean>> = {};

let checkPending = false;
let comparePending = false;
let shelfProducts = [] as ReturnType<typeof createShelfProduct>[];
const labelFile = new File(["label"], "label.jpg", { type: "image/jpeg" });

if (typeof URL.createObjectURL === "undefined") {
  Object.defineProperty(URL, "createObjectURL", {
    value: jest.fn(() => "blob:mock"),
    writable: true,
  });
}
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", {
    value: jest.fn(),
    writable: true,
  });
}

jest.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock("@/hooks/use-ingredients", () => ({
  useCheckProduct: () => ({
    mutate: mockCheckMutate,
    isPending: checkPending,
  }),
  useCompareProducts: () => ({
    mutate: mockCompareMutate,
    isPending: comparePending,
    data: null,
  }),
}));

jest.mock("@/hooks/use-shelf", () => ({
  useExtractProductFromImages: () => ({
    mutate: mockExtractMutate,
    isPending: false,
  }),
  useShelfProducts: () => ({
    data: shelfProducts,
    isLoading: false,
  }),
}));

jest.mock("@/hooks/use-user-capabilities", () => ({
  useUserCapabilities: () => {
    const enabled = (key: string) => capabilityOverrides[key] ?? true;
    const access = (key: string) => ({
      enabled: enabled(key),
      blockedBy: enabled(key) ? null : "user_restriction",
      expiresAt: null,
      message: null,
    });

    return {
      accountCreation: access("accountCreation"),
      aiGeneration: access("aiGeneration"),
      imageUpload: access("imageUpload"),
      productExtraction: access("productExtraction"),
      notifications: access("notifications"),
      supportContact: access("supportContact"),
    };
  },
  isCapabilityDisabled: (access: { enabled?: boolean } | null | undefined) =>
    access?.enabled === false,
}));

beforeEach(() => {
  jest.clearAllMocks();
  checkPending = false;
  comparePending = false;
  shelfProducts = [];
  capabilityOverrides = {};
});

function createDraft(): ShelfProductDraft {
  return {
    identity: {
      brand: "Ritora Lab",
      name: "Barrier Serum",
      category: ProductCategory.Serum,
      barcode: null,
      imageUrls: [],
      sizeMl: 30,
      description: "A calming serum for reactive skin.",
      benefits: ["calming"],
      suitedFor: ["sensitive"],
      inciIngredients: ["Aqua", "Niacinamide"],
      inciLastConfirmedAt: null,
    },
    guidance: {
      applicationMethod: null,
      quantity: null,
      steps: ["Apply after cleansing."],
      cautions: [],
      waitMinutes: null,
    },
    manufacturer: {
      brand: "Ritora Lab",
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
    },
    userFields: {
      openedAt: null,
      expiresAt: null,
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.PhotoLookup,
  };
}

function createShelfProduct() {
  return {
    id: "shelf-1",
    ...createDraft(),
    createdAt: "2026-05-17T09:00:00.000Z",
    updatedAt: "2026-05-17T09:00:00.000Z",
  };
}

function createProductCheckResponse(): ProductCheckResponse {
  return {
    context: {
      level: ProductCheckPersonalizationLevel.Personalized,
      usedSignals: [
        ProductCheckContextSignal.SkinProfile,
        ProductCheckContextSignal.ActiveShelf,
      ],
      missingSignals: [],
      activeShelfProductCount: 1,
      recentJournalReactionCount: 0,
      recentSuggestionReactionCount: 0,
    },
    analysis: {
      mode: AnalysisMode.Multi,
      status: AnalysisStatus.Ok,
      confidence: AnalysisConfidence.High,
      safetyScore: 96,
      actives: [
        {
          slug: "niacinamide",
          displayName: "Niacinamide",
          category: IngredientCategory.Niacinamide,
          summary: "Supports the barrier and helps uneven tone.",
          avoidCategories: [],
          avoidIngredients: [],
          mitigationHint: null,
        },
      ],
      conflicts: [],
      overlaps: [],
      layeringOrder: [],
      productsMissingInci: [],
      engineVersion: "test",
      generatedAt: "2026-05-17T10:00:00.000Z",
    },
    verdict: {
      label: ProductCheckVerdict.GoodFit,
      tone: ProductCheckTone.Positive,
      confidence: AnalysisConfidence.High,
      safetyScore: 96,
      reasons: [],
      nextAction: ProductCheckNextAction.UseAsPlanned,
      generatedAt: "2026-05-17T10:00:00.000Z",
    },
    aiReview: {
      status: ProductCheckAiReviewStatus.Reviewed,
      confidence: AnalysisConfidence.High,
      suggestedVerdict: null,
      reasonCodes: [],
      ingredientNames: [],
      summary: null,
      reviewedAt: "2026-05-17T10:00:00.000Z",
    },
    reactionEvidence: [
      {
        kind: ProductCheckEvidenceKind.ShelfReactionSignal,
        confidence: AnalysisConfidence.Medium,
        productName: "Ritora Lab Barrier Serum",
        ingredientNames: ["Niacinamide"],
        reactionSignalCount: 1,
        usageDaysLast90: 4,
      },
    ],
    purchaseGuidance: {
      shouldConsiderAlternatives: true,
      reasonCodes: [ProductCheckPurchaseGuidanceReasonCode.SmartPicksAvailable],
      alternatives: [
        {
          id: "pick-1",
          source: ProductCheckAlternativeSource.SmartPicks,
          brand: "Calm Lab",
          productName: "Barrier Cream",
          ingredientOrCategory: "Barrier moisturizer",
          budgetTier: "mid",
          sellerNames: ["Pharmacy"],
          reason: "Covers a barrier gap without duplicating actives.",
        },
      ],
    },
  };
}

function createResolvedLookup(): ResolvedLookup {
  const draft = createDraft();

  return {
    identity: draft.identity,
    guidance: draft.guidance,
    manufacturer: draft.manufacturer,
    provenance: DataProvenance.PhotoLookup,
    source: CatalogueSource.UserPhotos,
    confidence: LookupConfidence.High,
    reviewRequired: false,
    warnings: [],
    evidence: [],
  };
}

function conflictFinding() {
  return {
    code: "medium_conflict:AZELAIC_AHA",
    severity: AnalysisSeverity.Medium,
    ingredientA: "Retinol",
    ingredientB: "AHA",
    productAId: null,
    productBId: null,
    mitigation: "Use on alternate nights.",
    explanation: "This pairing can be too strong for reactive skin.",
    description: "Potentially irritating pairing.",
  };
}

function overlapFinding() {
  return {
    ingredient: "Niacinamide",
    productIds: ["serum", "cream"],
    severity: AnalysisSeverity.Medium,
    explanation: "This active already appears in your routine.",
    description: "Repeated active.",
  };
}

describe("CheckProductClient", () => {
  it("keeps pasted checks disabled until required fields are complete", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CheckProductClient />);

    const button = screen.getByRole("button", { name: /quick check/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/^brand$/i), "Ritora Lab");
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/product name/i), "Barrier Serum");
    expect(button).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText(/paste inci ingredients/i),
      "Aqua",
    );

    expect(button).toBeEnabled();
    expect(mockCheckMutate).not.toHaveBeenCalled();
  });

  it("submits pasted ingredients and renders the verdict after success", async () => {
    const user = userEvent.setup();
    mockCheckMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.(createProductCheckResponse());
    });

    renderWithProviders(<CheckProductClient />);

    fireEvent.change(screen.getByLabelText(/^brand$/i), {
      target: { value: "Ritora Lab" },
    });
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: "Barrier Serum" },
    });
    fireEvent.change(screen.getByPlaceholderText(/paste inci ingredients/i), {
      target: { value: "Aqua, Niacinamide" },
    });
    await user.click(screen.getByRole("button", { name: /quick check/i }));

    expect(mockCheckMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        product: expect.objectContaining({
          source: ProductCheckSource.IngredientPaste,
          brand: "Ritora Lab",
          name: "Barrier Serum",
          inciIngredients: ["Aqua", "Niacinamide"],
        }),
      }),
      expect.any(Object),
    );
    expect(screen.getByText(/good fit/i)).toBeInTheDocument();
    expect(
      screen.getByText(/personalized with your ritora data/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/niacinamide/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/supports the barrier and helps uneven tone/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/reaction evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/ritora lab barrier serum/i)).toBeInTheDocument();
    expect(screen.getByText(/calm lab/i)).toBeInTheDocument();
    expect(screen.getByText(/barrier cream/i)).toBeInTheDocument();
  });

  it("compares a checked product with selected Shelf products", async () => {
    const user = userEvent.setup();
    shelfProducts = [createShelfProduct()];
    mockCheckMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.(createProductCheckResponse());
    });

    renderWithProviders(<CheckProductClient />);

    fireEvent.change(screen.getByLabelText(/^brand$/i), {
      target: { value: "Ritora Lab" },
    });
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: "Barrier Serum" },
    });
    fireEvent.change(screen.getByPlaceholderText(/paste inci ingredients/i), {
      target: { value: "Aqua, Niacinamide" },
    });
    await user.click(screen.getByRole("button", { name: /quick check/i }));
    await user.click(screen.getByRole("button", { name: /open comparison/i }));
    await user.click(
      screen.getByLabelText(/ritora lab barrier serum/i, {
        selector: "button",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: /^compare with 1 shelf product$/i }),
    );

    expect(mockCompareMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        goal: ProductCompareGoal.NewProductDecision,
        anchor: expect.objectContaining({
          kind: "checked_product",
          product: expect.objectContaining({
            brand: "Ritora Lab",
            name: "Barrier Serum",
          }),
        }),
        candidates: [{ kind: "shelf_product", productId: "shelf-1" }],
      }),
      expect.any(Object),
    );
  });

  it("clears a previous verdict when the next product check fails", async () => {
    const user = userEvent.setup();
    mockCheckMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.(createProductCheckResponse());
    });

    renderWithProviders(<CheckProductClient />);

    fireEvent.change(screen.getByLabelText(/^brand$/i), {
      target: { value: "Ritora Lab" },
    });
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: "Barrier Serum" },
    });
    fireEvent.change(screen.getByPlaceholderText(/paste inci ingredients/i), {
      target: { value: "Aqua, Niacinamide" },
    });
    await user.click(screen.getByRole("button", { name: /quick check/i }));
    expect(screen.getByText(/good fit/i)).toBeInTheDocument();

    mockCheckMutate.mockImplementation((_payload, options) => {
      options?.onError?.(new Error("Network error"));
    });
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: "Another Serum" },
    });
    await user.click(screen.getByRole("button", { name: /quick check/i }));

    expect(mockToastError).toHaveBeenCalled();
    expect(screen.queryByText(/good fit/i)).not.toBeInTheDocument();
  });

  it("renders repeated findings without duplicate key warnings", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const result = createProductCheckResponse();
    result.analysis.conflicts = [conflictFinding(), conflictFinding()];
    result.analysis.overlaps = [overlapFinding(), overlapFinding()];

    renderWithProviders(<ProductCheckResultDetails result={result} />);

    expect(screen.getAllByText(/Retinol \+ AHA/i)).toHaveLength(2);
    expect(screen.getAllByText(/Found in 2 products/i)).toHaveLength(2);
    expect(
      consoleErrorSpy.mock.calls.some(([message]) =>
        String(message).includes("Encountered two children with the same key"),
      ),
    ).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("shows a loading indicator while product check is pending", () => {
    checkPending = true;

    renderWithProviders(<CheckProductClient />);

    expect(
      screen.getByRole("button", { name: /checking/i }),
    ).toBeDisabled();
  });

  it("disables quick checks when AI generation is unavailable", async () => {
    const user = userEvent.setup();
    capabilityOverrides = { aiGeneration: false };

    renderWithProviders(<CheckProductClient />);

    fireEvent.change(screen.getByLabelText(/^brand$/i), {
      target: { value: "Ritora Lab" },
    });
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: "Barrier Serum" },
    });
    fireEvent.change(screen.getByPlaceholderText(/paste inci ingredients/i), {
      target: { value: "Aqua, Niacinamide" },
    });

    expect(
      screen.queryByText(/temporarily unavailable/i),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /quick check/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /quick check/i }));
    expect(mockCheckMutate).not.toHaveBeenCalled();
  });

  it("checks extracted label photos and stays verdict-only", async () => {
    const user = userEvent.setup();
    mockExtractMutate.mockImplementation((_payload, options) => {
      const resolved = createResolvedLookup();
      options?.onSuccess?.({
        ...resolved,
        identity: {
          ...resolved.identity,
          brand: "",
          name: "",
        },
        manufacturer: {
          ...resolved.manufacturer,
          brand: "",
        },
      });
    });
    mockCheckMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.(createProductCheckResponse());
    });

    renderWithProviders(<CheckProductClient />);

    await user.click(screen.getByRole("tab", { name: /photos/i }));
    expect(
      screen.queryByRole("button", { name: /add product photo/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/tips by container shape/i)).toBeInTheDocument();
    await user.upload(screen.getByLabelText(/^add photo$/i), labelFile);
    await user.click(screen.getByRole("button", { name: /quick check/i }));

    expect(mockExtractMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [labelFile],
        heroImageIndex: 0,
      }),
      expect.any(Object),
    );
    expect(mockCheckMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        product: expect.objectContaining({
          source: ProductCheckSource.PhotoExtraction,
          brand: null,
          name: null,
          inciIngredients: ["Aqua", "Niacinamide"],
        }),
      }),
      expect.any(Object),
    );

    expect(screen.getByText(/good fit/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add to shelf/i }),
    ).not.toBeInTheDocument();
  });

  it("disables photo extraction when image upload is unavailable", async () => {
    const user = userEvent.setup();
    capabilityOverrides = { imageUpload: false };

    renderWithProviders(<CheckProductClient />);

    await user.click(screen.getByRole("tab", { name: /photos/i }));

    expect(screen.getByLabelText(/^add photo$/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /quick check/i })).toBeDisabled();
    expect(mockExtractMutate).not.toHaveBeenCalled();
  });

  it("stops photo checks when extraction misses required product data", async () => {
    const user = userEvent.setup();
    mockExtractMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({
        ...createResolvedLookup(),
        identity: {
          ...createResolvedLookup().identity,
          brand: "",
          inciIngredients: [],
        },
        manufacturer: {
          ...createResolvedLookup().manufacturer,
          brand: "",
        },
      });
    });

    renderWithProviders(<CheckProductClient />);

    await user.click(screen.getByRole("tab", { name: /photos/i }));
    await user.upload(screen.getByLabelText(/^add photo$/i), labelFile);
    await user.click(screen.getByRole("button", { name: /quick check/i }));

    expect(mockExtractMutate).toHaveBeenCalled();
    expect(mockCheckMutate).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalled();
  });
});
