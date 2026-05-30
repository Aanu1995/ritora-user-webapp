import {
  communityOutcomeSignalFormSchema,
  communityReviewFormSchema,
  communityRoutineFormSchema,
  defaultCommunityOutcomeSignalValues,
  defaultCommunityReviewValues,
  defaultCommunityRoutineValues,
} from "../community-form-schemas";

describe("community form schemas", () => {
  it("requires product-linked review essentials before submission", () => {
    const validReview = {
      ...defaultCommunityReviewValues,
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineContextUsage: "used_alone",
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
      routineContextUsage: "with_products",
      routineContext: [
        {
          category: "cleanser",
          productBrand: "Ritora",
          productId: "product-cleanser",
          productName: "Milky Cleanser",
        },
      ],
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
      selectedShelfProductId: "product-cream",
      skinResponse: "improved",
      usageDuration: "8-weeks",
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("Expected review validation to pass.");
    expect(result.data.routineContext[0]?.productId).toBe("product-cleanser");
  });

  it("requires structured ratings and skin response without forcing a paired product", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
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
        expect.objectContaining({ message: "Usage context is required." }),
        expect.objectContaining({ message: "Overall rating is required." }),
        expect.objectContaining({
          message: "Effectiveness rating is required.",
        }),
        expect.objectContaining({ message: "Irritation rating is required." }),
        expect.objectContaining({ message: "Routine timing is required." }),
        expect.objectContaining({ message: "Skin response is required." }),
      ]),
    );
  });

  it("requires companion products only when the review says they were used", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      routineContextUsage: "with_products",
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
          message: "Add at least one product used with it.",
        }),
      ]),
    );
  });

  it("shows a parent-level error when a companion product row is blank", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      routineContextUsage: "with_products",
      routineContext: [
        {
          category: "cleanser",
          productBrand: "",
          productId: "",
          productName: "",
        },
      ],
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
          message: "Add a shelf product or product name for every product.",
          path: ["routineContext"],
        }),
      ]),
    );
  });

  it("requires the user to choose whether the reviewed product was used alone or with products", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
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
        expect.objectContaining({ message: "Usage context is required." }),
      ]),
    );
  });

  it("rejects invalid disclosure values", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      disclosureType: "unknown",
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineContextUsage: "used_alone",
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

    expect(communityRoutineFormSchema.safeParse(validRoutine).success).toBe(
      true,
    );

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
      effectivenessRating: "4",
      frequency: "daily",
      irritationRating: "1",
      overallRating: "5",
      outcomes: "helped-overall",
      productBrand: "Ritora",
      productName: "Barrier Cream",
      repurchase: "yes",
      routineContextUsage: "used_alone",
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

  it("allows optional moderated result notes with shelf product context", () => {
    const result = communityOutcomeSignalFormSchema.safeParse({
      ...defaultCommunityOutcomeSignalValues,
      followedParts: ["products"],
      irritationLevel: "none",
      note: "It worked better when I paired it with a gentle cleanser.",
      routineSlot: "pm",
      sameGoal: "true",
      trialDuration: "8-weeks",
      usedWithProducts: [
        {
          category: "cleanser",
          productBrand: "Ritora",
          productId: "product-cleanser",
          productName: "Milky Cleanser",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("keeps result notes within the backend moderation limit", () => {
    const result = communityOutcomeSignalFormSchema.safeParse({
      ...defaultCommunityOutcomeSignalValues,
      followedParts: ["products"],
      irritationLevel: "none",
      note: "x".repeat(501),
      sameGoal: "true",
      trialDuration: "8-weeks",
    });

    expect(result.success).toBe(false);
  });
});
