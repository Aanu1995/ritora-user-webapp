import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getStepInput,
  mockCreateWithImageMutate,
  mockMutate,
  mockPush,
  mockToastError,
  mockToastSuccess,
  renderAddProductPage,
  resetAddProductPageMocks,
  setMockLookupProductPhotoFile,
  setMockLookupResolve,
} from "@/test/shelf/add-product-page.test-harness";
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  LookupWarningCode,
  ProductCategory,
  type ResolvedLookup,
} from "@/types/shelf";

beforeEach(() => {
  resetAddProductPageMocks();
});

async function fillValidManualProduct(
  user: ReturnType<typeof userEvent.setup>,
) {
  fireEvent.change(screen.getByLabelText(/^brand$/i), {
    target: { value: "CeraVe" },
  });
  fireEvent.change(screen.getByLabelText(/^product name$/i), {
    target: { value: "Barrier Serum" },
  });
  fireEvent.change(screen.getByLabelText(/^description$/i), {
    target: {
      value: "A calming serum that supports smoother texture overnight.",
    },
  });
  fireEvent.change(screen.getByLabelText(/^benefits$/i), {
    target: { value: "calming, smoothing" },
  });
  fireEvent.change(screen.getByLabelText(/^suited for$/i), {
    target: { value: "dry, sensitive" },
  });
  fireEvent.change(screen.getByLabelText(/^size$/i), {
    target: { value: "30" },
  });
  await user.click(screen.getByRole("button", { name: /add step/i }));
  fireEvent.change(getStepInput(1), {
    target: { value: "Pat onto clean skin." },
  });
  fireEvent.change(screen.getByLabelText(/^opened on$/i), {
    target: { value: "2026-04-15" },
  });
  fireEvent.change(screen.getByLabelText(/^product url$/i), {
    target: { value: "https://example.com/product" },
  });
}

function setSuccessfulPhotoLookup(
  overrides: Partial<ResolvedLookup> = {},
): void {
  setMockLookupResolve((onResult) => {
    onResult({
      identity: {
        brand: "CeraVe",
        name: "Resurfacing Retinol Serum",
        category: ProductCategory.Serum,
        imageUrls: [],
        sizeMl: 30,
        description: "A renewing serum for smoother-looking skin.",
        benefits: ["smoother texture"],
        suitedFor: ["combination"],
        inciIngredients: ["Aqua", "Glycerin"],
        inciLastConfirmedAt: null,
      },
      guidance: {
        steps: ["Apply at night after cleansing."],
        cautions: [],
      },
      manufacturer: {
        brand: "CeraVe",
        parentCompany: null,
        countryOfOrigin: null,
        countryOfManufacture: null,
        supportEmail: null,
        productUrl: null,
        websiteUrl: null,
      },
      provenance: DataProvenance.PhotoLookup,
      source: CatalogueSource.UserPhotos,
      confidence: LookupConfidence.Medium,
      reviewRequired: false,
      warnings: [],
      evidence: [],
      ...overrides,
    });
  });
}

describe("AddProductPage lookup imports", () => {
  it("creates after a lookup fills optional ingredients following a validation failure", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: "product-123" });
    });
    setMockLookupResolve((onResult) => {
      onResult({
        identity: {
          brand: "CeraVe",
          name: "Resurfacing Retinol Serum",
          category: ProductCategory.Serum,
          imageUrls: [],
          sizeMl: 30,
          description: "A renewing serum for smoother-looking skin.",
          benefits: ["smoother texture"],
          suitedFor: ["combination"],
          inciIngredients: ["Aqua", "Glycerin"],
          inciLastConfirmedAt: null,
        },
        guidance: {
          steps: ["Apply at night after cleansing."],
          cautions: [],
        },
        manufacturer: {
          brand: "CeraVe",
          parentCompany: null,
          countryOfOrigin: null,
          countryOfManufacture: null,
          supportEmail: null,
          productUrl: null,
          websiteUrl: null,
        },
        provenance: DataProvenance.PhotoLookup,
        source: CatalogueSource.UserPhotos,
        confidence: LookupConfidence.Medium,
        reviewRequired: true,
        warnings: [
          LookupWarningCode.ReviewRequired,
          LookupWarningCode.IngredientsUnverified,
        ],
        evidence: [],
      });
    });

    renderAddProductPage();

    await user.click(screen.getByRole("button", { name: /add to shelf/i }));
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /import lookup/i }));
    expect(screen.getByLabelText(/^ingredients \(inci\)$/i)).toHaveValue(
      "Aqua, Glycerin",
    );

    await user.click(screen.getByRole("button", { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/shelf/product-123");
    });
    expect(mockMutate.mock.calls[0]?.[0].identity.inciIngredients).toEqual([
      "Aqua",
      "Glycerin",
    ]);
  });

  it("requires photo extraction before saving manually entered details", async () => {
    const user = userEvent.setup();

    renderAddProductPage();

    await fillValidManualProduct(user);

    await user.click(screen.getByRole("button", { name: /add to shelf/i }));

    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringMatching(
        /extract product details from photos before saving/i,
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows a server error in toast when create fails after photo extraction", async () => {
    const user = userEvent.setup();
    setSuccessfulPhotoLookup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onError?.(new Error("boom"));
    });

    renderAddProductPage();

    await user.click(screen.getByRole("button", { name: /import lookup/i }));
    await user.click(screen.getByRole("button", { name: /add to shelf/i }));

    expect(mockToastError).toHaveBeenCalledWith(
      "We could not save this product right now. Please try again.",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a success toast after product details are imported from lookup", async () => {
    const user = userEvent.setup();
    setMockLookupResolve((onResult) => {
      onResult({
        identity: {
          brand: "CeraVe",
          name: "Resurfacing Retinol Serum",
          category: ProductCategory.Serum,
          barcode: "3337875684118",
          imageUrls: [],
          sizeMl: 30,
          description: "A renewing serum for smoother-looking skin.",
          benefits: ["smoother texture"],
          suitedFor: ["combination"],
          inciIngredients: ["Aqua", "Glycerin"],
          inciLastConfirmedAt: null,
        },
        guidance: {
          steps: ["Apply at night after cleansing."],
          cautions: ["Use sunscreen during the day."],
        },
        manufacturer: {
          brand: "CeraVe",
          parentCompany: "Loreal",
          countryOfOrigin: "France",
          countryOfManufacture: "France",
          supportEmail: "support@example.com",
          productUrl: "https://example.com/product",
          websiteUrl: null,
        },
        provenance: DataProvenance.PhotoLookup,
        source: CatalogueSource.OpenBeautyFacts,
        confidence: LookupConfidence.Medium,
        reviewRequired: true,
        warnings: [LookupWarningCode.ReviewRequired],
        evidence: [],
      });
    });

    renderAddProductPage();

    await user.click(screen.getByRole("button", { name: /import lookup/i }));

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Details filled in",
      expect.objectContaining({
        description: expect.stringMatching(
          /review the highlighted fields before saving/i,
        ),
      }),
    );
    expect(screen.getByLabelText(/^brand$/i)).toHaveValue("CeraVe");
    expect(screen.getByLabelText(/^product name$/i)).toHaveValue(
      "Resurfacing Retinol Serum",
    );
    expect(screen.getByLabelText(/^description$/i)).toHaveValue(
      "A renewing serum for smoother-looking skin.",
    );
    expect(screen.getByLabelText(/^benefits$/i)).toHaveValue(
      "smoother texture",
    );
    expect(screen.getByLabelText(/^suited for$/i)).toHaveValue("combination");
    expect(screen.getByLabelText(/^support$/i)).toHaveValue(
      "support@example.com",
    );
    expect(screen.getByLabelText(/^product url$/i)).toHaveValue(
      "https://example.com/product",
    );
    expect(
      screen.getByRole("button", { name: /^made in$/i }),
    ).toHaveTextContent(/france/i);
  });

  it("handles partial lookup payloads without crashing and fills available fields", async () => {
    const user = userEvent.setup();
    setMockLookupResolve((onResult) => {
      onResult({
        identity: {
          brand: "CeraVe",
          name: "Resurfacing Retinol Serum",
          category: ProductCategory.Serum,
          description: "A resurfacing serum.",
        },
        provenance: DataProvenance.PhotoLookup,
        source: CatalogueSource.RitoraCatalogue,
        confidence: LookupConfidence.High,
        reviewRequired: false,
        warnings: [],
        evidence: [],
      });
    });

    renderAddProductPage();

    fireEvent.change(screen.getByLabelText(/^support$/i), {
      target: { value: "stale@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^product url$/i), {
      target: { value: "https://example.com/stale-product" },
    });
    fireEvent.change(screen.getByLabelText(/^benefits$/i), {
      target: { value: "stale benefit" },
    });
    fireEvent.change(screen.getByLabelText(/^suited for$/i), {
      target: { value: "stale skin" },
    });

    await user.click(screen.getByRole("button", { name: /import lookup/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^brand$/i)).toHaveValue("CeraVe");
    });

    expect(screen.getByLabelText(/^product name$/i)).toHaveValue(
      "Resurfacing Retinol Serum",
    );
    expect(screen.getByLabelText(/^description$/i)).toHaveValue(
      "A resurfacing serum.",
    );
    expect(screen.getByLabelText(/^benefits$/i)).toHaveValue("stale benefit");
    expect(screen.getByLabelText(/^suited for$/i)).toHaveValue("stale skin");
    expect(screen.getByLabelText(/^support$/i)).toHaveValue(
      "stale@example.com",
    );
    expect(screen.getByLabelText(/^product url$/i)).toHaveValue(
      "https://example.com/stale-product",
    );
  });

  it("keeps review badges for high-confidence AI-backed fields and maps origin to made in", async () => {
    const user = userEvent.setup();
    setMockLookupResolve((onResult) => {
      onResult({
        identity: {
          brand: "CeraVe",
          name: "SA Smoothing Cleanser",
          category: ProductCategory.Cleanser,
          description: "A cleanser that smooths rough texture.",
          benefits: ["smooths texture"],
          suitedFor: ["rough skin"],
          barcode: "3337875795456",
          imageUrls: [],
          sizeMl: 236,
          inciIngredients: ["Aqua"],
          inciLastConfirmedAt: null,
        },
        guidance: {
          cautions: ["Avoid contact with eyes."],
        },
        manufacturer: {
          brand: "CeraVe",
          parentCompany: "L'Oréal",
          countryOfOrigin: "France",
          countryOfManufacture: null,
          supportEmail: "support@example.com",
          productUrl: "https://example.com/product",
          websiteUrl: null,
        },
        provenance: DataProvenance.PhotoLookup,
        source: CatalogueSource.OfficialPage,
        confidence: LookupConfidence.High,
        reviewRequired: true,
        warnings: [LookupWarningCode.AiNormalized],
        evidence: [],
      });
    });

    renderAddProductPage();

    await user.click(screen.getByRole("button", { name: /import lookup/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^brand$/i)).toHaveValue("CeraVe");
    });

    expect(
      screen.getByRole("button", { name: /^made in$/i }),
    ).toHaveTextContent(/france/i);
    expect(screen.getAllByText(/needs review/i).length).toBeGreaterThan(0);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Details filled in",
      expect.objectContaining({
        description: expect.stringMatching(
          /review the highlighted fields before saving/i,
        ),
      }),
    );
  });

  it("does not persist lookup image urls through the plain create path", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: "product-123" });
    });
    setSuccessfulPhotoLookup({
      identity: {
        brand: "CeraVe",
        name: "Resurfacing Retinol Serum",
        category: ProductCategory.Serum,
        imageUrls: ["https://cdn.example.com/draft-only.webp"],
        sizeMl: 30,
        description: "A renewing serum for smoother-looking skin.",
        benefits: ["smoother texture"],
        suitedFor: ["combination"],
        inciIngredients: ["Aqua", "Glycerin"],
        inciLastConfirmedAt: null,
      },
    });

    renderAddProductPage();

    await user.click(screen.getByRole("button", { name: /import lookup/i }));
    await user.click(screen.getByRole("button", { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
    expect(mockMutate.mock.calls[0]?.[0].identity.imageUrls).toEqual([]);
  });

  it("uploads the selected product photo only when the add-product form is saved", async () => {
    const user = userEvent.setup();
    const productPhotoFile = new File(["photo"], "product.jpg", {
      type: "image/jpeg",
    });
    mockCreateWithImageMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.({ id: "product-with-image" });
    });
    setMockLookupProductPhotoFile(productPhotoFile);
    setSuccessfulPhotoLookup({
      identity: {
        brand: "CeraVe",
        name: "Resurfacing Retinol Serum",
        category: ProductCategory.Serum,
        imageUrls: ["https://cdn.example.com/draft-only.webp"],
        sizeMl: 30,
        description: "A renewing serum for smoother-looking skin.",
        benefits: ["smoother texture"],
        suitedFor: ["combination"],
        inciIngredients: ["Aqua", "Glycerin"],
        inciLastConfirmedAt: null,
      },
    });

    renderAddProductPage();

    await user.click(screen.getByRole("button", { name: /import lookup/i }));
    expect(mockCreateWithImageMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockCreateWithImageMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/shelf/product-with-image");
    });
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockCreateWithImageMutate.mock.calls[0]?.[0]).toEqual({
      draft: expect.objectContaining({
        identity: expect.objectContaining({
          imageUrls: [],
        }),
      }),
      file: productPhotoFile,
    });
  });
});
