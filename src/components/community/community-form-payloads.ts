import type {
  CommunityEditableReview,
  CommunityEditableRoutine,
  CommunityGoalResult,
  CommunityGoalTimeframe,
  CommunityReviewRoutineContextUsage,
  CommunityReviewRoutineSlot,
  CommunityReviewSkinResponse,
  CreateCommunityReviewInput,
  CreateCommunityRoutineInput,
} from "@/types/community";
import {
  defaultCommunityReviewValues,
  defaultCommunityRoutineValues,
  type CommunityReviewFormValues,
  type CommunityRoutineFormValues,
} from "./community-form-schemas";
import {
  blankToNull,
  toOptionalRating,
  toRequiredRating,
} from "./community-review-form-utils";

export function routineFormToInput(
  value: CommunityRoutineFormValues,
): CreateCommunityRoutineInput {
  return {
    title: value.title,
    summary: value.summary,
    disclosureType: value.disclosureType,
    concernTags: [value.goal],
    goalTags: [value.goal],
    goalResult: blankToNull(value.goalResult) as CommunityGoalResult | null,
    timeframe: value.timeframe as CommunityGoalTimeframe,
    avoidTags: value.avoidTags,
    habitTags: value.habitTags,
    didNotWorkTags: value.didNotWorkTags,
    warningTags: value.warningTags,
    steps: value.steps.map((step) => ({
      slot: step.slot,
      category: step.category,
      productId: blankToNull(step.productId),
      productBrand: blankToNull(step.productBrand),
      productName: blankToNull(step.productName),
      frequency: blankToNull(step.frequency),
      notes: blankToNull(step.notes),
    })),
  };
}

export function reviewFormToInput(
  value: CommunityReviewFormValues,
): CreateCommunityReviewInput {
  return {
    productId: blankToNull(value.selectedShelfProductId),
    productBrand: value.productBrand,
    productName: value.productName,
    productCategory: value.productCategory,
    disclosureType: value.disclosureType,
    usageDuration: value.usageDuration,
    frequency: value.frequency,
    routineContextUsage:
      value.routineContextUsage as CommunityReviewRoutineContextUsage,
    routineSlot: value.routineSlot as CommunityReviewRoutineSlot,
    skinResponse: value.skinResponse as CommunityReviewSkinResponse,
    overallRating: toRequiredRating(value.overallRating),
    effectivenessRating: toRequiredRating(value.effectivenessRating),
    irritationRating: toRequiredRating(value.irritationRating),
    textureRating: toOptionalRating(value.textureRating),
    valueRating: toOptionalRating(value.valueRating),
    outcomes: value.outcomes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    repurchase: value.repurchase,
    routineContext:
      value.routineContextUsage === "with_products"
        ? value.routineContext.map((item) => ({
            category: item.category,
            productId: blankToNull(item.productId),
            productBrand: blankToNull(item.productBrand),
            productName: blankToNull(item.productName),
          }))
        : [],
    body: value.body,
  };
}

export function routineInputToFormValues(
  input: CommunityEditableRoutine | null | undefined,
): CommunityRoutineFormValues {
  if (!input) return cloneRoutineDefaults();
  return {
    ...cloneRoutineDefaults(),
    avoidTags: input.avoidTags,
    disclosureType: input.disclosureType,
    didNotWorkTags: input.didNotWorkTags,
    goal: input.goalTags[0] ?? input.concernTags[0] ?? "",
    goalResult: input.goalResult ?? "",
    habitTags: input.habitTags,
    steps:
      input.steps.length > 0
        ? input.steps.map((step) => ({
            category: step.category,
            frequency: step.frequency ?? "",
            notes: step.notes ?? "",
            productBrand: step.productBrand ?? "",
            productId: step.productId ?? "",
            productName: step.productName ?? "",
            slot: step.slot,
          }))
        : cloneRoutineDefaults().steps,
    summary: input.summary ?? "",
    timeframe: input.timeframe ?? "",
    title: input.title,
    warningTags: input.warningTags,
  };
}

export function reviewInputToFormValues(
  input: CommunityEditableReview | null | undefined,
): CommunityReviewFormValues {
  if (!input) return cloneReviewDefaults();
  const routineContextUsage =
    input.routineContextUsage ??
    (input.routineContext.length > 0 ? "with_products" : "used_alone");
  return {
    ...cloneReviewDefaults(),
    body: input.body ?? "",
    disclosureType: input.disclosureType,
    effectivenessRating: ratingToString(input.effectivenessRating),
    frequency: input.frequency,
    irritationRating: ratingToString(input.irritationRating),
    overallRating: ratingToString(input.overallRating),
    outcomes: input.outcomes.join(", "),
    productBrand: input.productBrand,
    productCategory: input.productCategory,
    productName: input.productName,
    repurchase: input.repurchase,
    routineContext:
      input.routineContext.length > 0
        ? input.routineContext.map((item) => ({
            category: item.category,
            productBrand: item.productBrand ?? "",
            productId: item.productId ?? "",
            productName: item.productName ?? "",
          }))
        : [],
    routineContextUsage,
    routineSlot: input.routineSlot ?? "",
    selectedShelfProductId: input.productId ?? "",
    skinResponse: input.skinResponse ?? "",
    textureRating: ratingToString(input.textureRating),
    usageDuration: input.usageDuration,
    valueRating: ratingToString(input.valueRating),
  };
}

function cloneRoutineDefaults(): CommunityRoutineFormValues {
  return {
    ...defaultCommunityRoutineValues,
    avoidTags: [...defaultCommunityRoutineValues.avoidTags],
    didNotWorkTags: [...defaultCommunityRoutineValues.didNotWorkTags],
    habitTags: [...defaultCommunityRoutineValues.habitTags],
    steps: defaultCommunityRoutineValues.steps.map((step) => ({ ...step })),
    warningTags: [...defaultCommunityRoutineValues.warningTags],
  };
}

function cloneReviewDefaults(): CommunityReviewFormValues {
  return { ...defaultCommunityReviewValues };
}

function ratingToString(value: number | null): string {
  return value === null ? "" : String(value);
}
