import {
  communityEditReviewSubmissionSchema,
  communityEditRoutineSubmissionSchema,
  communityReviewFormSchema,
  communityRoutineFormSchema,
  defaultCommunityReviewValues,
  defaultCommunityRoutineValues,
} from "../community-form-schemas";

describe("community form schemas", () => {
  it("requires product-linked review essentials before submission", () => {
    const validReview = {
      ...defaultCommunityReviewValues,
      productBrand: "Ritora",
      productName: "Barrier Cream",
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

  it("rejects invalid disclosure values", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      disclosureType: "unknown",
      productBrand: "Ritora",
      productName: "Barrier Cream",
    });

    expect(result.success).toBe(false);
  });

  it("requires a publishable routine title", () => {
    const validRoutine = {
      ...defaultCommunityRoutineValues,
      title: "Simple barrier support",
    };

    expect(communityRoutineFormSchema.safeParse(validRoutine).success).toBe(true);

    const result = communityRoutineFormSchema.safeParse({
      ...validRoutine,
      title: "No",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected routine validation to fail.");
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Routine title is required." }),
      ]),
    );
  });

  it("uses backend-aligned review text limits", () => {
    const result = communityReviewFormSchema.safeParse({
      ...defaultCommunityReviewValues,
      body: "x".repeat(1201),
      productBrand: "Ritora",
      productName: "Barrier Cream",
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
      summary: "x".repeat(501),
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

  it("limits edit-resubmission text by content type", () => {
    const routineResult = communityEditRoutineSubmissionSchema.safeParse({
      text: "x".repeat(501),
      title: "Updated routine",
    });
    const reviewResult = communityEditReviewSubmissionSchema.safeParse({
      text: "x".repeat(1201),
      title: "Updated review",
    });

    expect(routineResult.success).toBe(false);
    if (routineResult.success) {
      throw new Error("Expected routine edit validation to fail.");
    }
    expect(routineResult.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Keep routine notes under 500 characters.",
        }),
      ]),
    );
    expect(reviewResult.success).toBe(false);
    if (reviewResult.success) {
      throw new Error("Expected review edit validation to fail.");
    }
    expect(reviewResult.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Keep review text under 1,200 characters.",
        }),
      ]),
    );
  });
});
