import {
  communityReviewFormSchema,
  communityRoutineFormSchema,
  defaultCommunityReviewValues,
  defaultCommunityRoutineValues,
} from "../community-form-schemas";

describe("community form schemas", () => {
  it("requires product-linked review essentials before submission", () => {
    const validReview = {
      ...defaultCommunityReviewValues,
      contextProductName: "Milky Cleanser",
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineSlot: "pm",
      skinResponse: "improved",
      usageDuration: "8-weeks",
    };

    expect(communityReviewFormSchema.safeParse(validReview).success).toBe(true);

    const result = communityReviewFormSchema.safeParse({
      ...validReview,
      productBrand: "",
      productName: "",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected review validation to fail.");
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Brand is required." }),
        expect.objectContaining({ message: "Product name is required." }),
      ]),
    );
  });

  it("keeps extracted shelf product details as the durable review evidence", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      contextProductName: "Milky Cleanser",
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productCategory: "moisturizer",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineSlot: "pm",
      selectedContextShelfProductId: "product-cleanser",
      selectedShelfProductId: "product-cream",
      skinResponse: "improved",
      usageDuration: "8-weeks",
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("Expected review validation to pass.");
    expect(result.data.selectedContextShelfProductId).toBe("product-cleanser");
  });

  it("requires structured ratings, skin response and named routine context", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      contextProductName: "",
      effectivenessRating: "",
      irritationRating: "",
      overallRating: "",
      routineSlot: "",
      skinResponse: "",
      productBrand: "Ritora",
      productName: "Barrier Cream",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected review validation to fail.");
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Overall rating is required." }),
        expect.objectContaining({
          message: "Effectiveness rating is required.",
        }),
        expect.objectContaining({ message: "Irritation rating is required." }),
        expect.objectContaining({ message: "Routine timing is required." }),
        expect.objectContaining({ message: "Skin response is required." }),
        expect.objectContaining({
          message: "At least one product used with it is required.",
        }),
      ]),
    );
  });

  it("rejects invalid disclosure values", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      contextProductName: "Milky Cleanser",
      disclosureType: "unknown",
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineSlot: "pm",
      skinResponse: "improved",
      usageDuration: "8-weeks",
    });

    expect(result.success).toBe(false);
  });

  it("requires a publishable routine title", () => {
    const validRoutine = {
      ...defaultCommunityRoutineValues,
      goal: "acne-control",
      steps: [
        {
          category: "cleanser",
          frequency: "daily",
          notes: "",
          productBrand: "Ritora",
          productId: "product-1",
          productName: "Milky Cleanser",
          slot: "pm",
        },
        {
          category: "moisturizer",
          frequency: "daily",
          notes: "",
          productBrand: "",
          productId: "",
          productName: "Barrier Cream",
          slot: "pm",
        },
      ],
      summary: "Stopping nightly acids helped before the routine settled.",
      timeframe: "6-months",
      title: "Simple barrier support",
    };

    expect(communityRoutineFormSchema.safeParse(validRoutine).success).toBe(true);

    const result = communityRoutineFormSchema.safeParse({
      ...validRoutine,
      avoidTags: [],
      goal: "",
      goalResult: "",
      steps: [],
      timeframe: "",
      title: "No",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected routine validation to fail.");
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Routine title is required." }),
        expect.objectContaining({ message: "Goal is required." }),
        expect.objectContaining({ message: "Timeframe is required." }),
        expect.objectContaining({
          message: "Add at least one product or routine step.",
        }),
      ]),
    );
  });

  it("uses backend-aligned review text limits", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      body: "x".repeat(1201),
      contextProductName: "Milky Cleanser",
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineSlot: "pm",
      skinResponse: "improved",
      usageDuration: "8-weeks",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected review validation to fail.");
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Keep review text under 1,200 characters.",
        }),
      ]),
    );
  });

  it("uses backend-aligned routine summary limits", () => {
    const result = communityRoutineFormSchema.safeParse({
      ...defaultCommunityRoutineValues,
      avoidTags: ["over-exfoliation"],
      goal: "acne-control",
      goalResult: "mostly_improved",
      steps: [
        {
          category: "cleanser",
          frequency: "daily",
          notes: "",
          productBrand: "Ritora",
          productId: "product-1",
          productName: "Milky Cleanser",
          slot: "pm",
        },
      ],
      summary: "x".repeat(501),
      timeframe: "8-weeks",
      title: "Simple barrier support",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected routine validation to fail.");
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Keep routine notes under 500 characters.",
        }),
      ]),
    );
  });
});
