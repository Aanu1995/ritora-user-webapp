import {
  buildPhotoProductCheckInput,
  isProductCheckInputComplete,
  parseIngredientPaste,
} from "@/lib/product-check";
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  LookupWarningCode,
  ProductCategory,
  type ResolvedLookup,
} from "@/types/shelf";
import { ProductCheckSource } from "@/types/ingredients";

const resolved: ResolvedLookup = {
  identity: {
    brand: "Ritora Lab",
    name: "Barrier Serum",
    category: ProductCategory.Serum,
    imageUrls: [],
    sizeMl: 30,
    description: "A calming serum for reactive skin.",
    benefits: ["calming"],
    suitedFor: ["sensitive"],
    inciIngredients: ["Aqua", "Niacinamide"],
    inciLastConfirmedAt: null,
  },
  guidance: {
    steps: ["Apply after cleansing."],
    cautions: [],
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
  provenance: DataProvenance.PhotoLookup,
  source: CatalogueSource.UserPhotos,
  confidence: LookupConfidence.High,
  reviewRequired: false,
  warnings: [],
  evidence: [],
};

describe("product-check helpers", () => {
  it("normalizes comma and newline separated ingredient paste", () => {
    expect(parseIngredientPaste(" Aqua, Niacinamide\nGlycerin,, Aqua ")).toEqual([
      "Aqua",
      "Niacinamide",
      "Glycerin",
    ]);
  });

  it("builds photo check input from extracted lookup data", () => {
    const input = buildPhotoProductCheckInput(resolved);

    expect(input).toEqual({
      source: ProductCheckSource.PhotoExtraction,
      brand: "Ritora Lab",
      name: "Barrier Serum",
      category: ProductCategory.Serum,
      inciIngredients: ["Aqua", "Niacinamide"],
      lookupWarnings: [],
      reviewRequired: false,
    });
    expect(isProductCheckInputComplete(input)).toBe(true);
  });

  it("detects incomplete photo check input before analysis", () => {
    const input = buildPhotoProductCheckInput({
      ...resolved,
      identity: {
        ...resolved.identity,
        brand: "",
        inciIngredients: [],
      },
      manufacturer: {
        ...resolved.manufacturer,
        brand: "",
      },
    });

    expect(isProductCheckInputComplete(input)).toBe(false);
  });

  it("allows photo checks without carrying Shelf metadata review into the verdict", () => {
    const input = buildPhotoProductCheckInput({
      ...resolved,
      identity: {
        ...resolved.identity,
        brand: "",
        name: "",
        inciIngredients: ["Aqua", "Glycerin"],
      },
      manufacturer: {
        ...resolved.manufacturer,
        brand: "",
      },
      confidence: LookupConfidence.Low,
      reviewRequired: true,
      warnings: [
        LookupWarningCode.ReviewRequired,
        LookupWarningCode.PartialData,
        LookupWarningCode.AiNormalized,
        LookupWarningCode.GuidanceUnverified,
      ],
    });

    expect(input).toEqual(
      expect.objectContaining({
        source: ProductCheckSource.PhotoExtraction,
        brand: null,
        name: null,
        inciIngredients: ["Aqua", "Glycerin"],
        lookupConfidence: undefined,
        lookupWarnings: [],
        reviewRequired: false,
      }),
    );
    expect(isProductCheckInputComplete(input)).toBe(true);
  });

  it("does not carry photo ingredient save-review warnings into Quick Check", () => {
    const input = buildPhotoProductCheckInput({
      ...resolved,
      confidence: LookupConfidence.Medium,
      reviewRequired: true,
      warnings: [
        LookupWarningCode.AiNormalized,
        LookupWarningCode.IngredientsUnverified,
      ],
    });

    expect(input).toEqual(
      expect.objectContaining({
        lookupConfidence: undefined,
        lookupWarnings: [],
        reviewRequired: false,
      }),
    );
  });

});
