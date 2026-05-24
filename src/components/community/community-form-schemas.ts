import { z } from "zod";
import {
  communityGoalResults,
  communityGoalTimeframes,
  communityDisclosureTypes,
  outcomeFollowedPartOptions,
  outcomeIrritationOptions,
  outcomeTrialDurationOptions,
  communityReviewRatingValues,
  communityReviewRoutineSlots,
  communityReviewSkinResponses,
} from "./community-constants";

const requiredOption = (message: string, allowedValues: readonly string[]) =>
  z
    .string()
    .min(1, message)
    .refine((value) => isAllowedOption(value, allowedValues), "Choose a valid option.");

const optionalOption = (allowedValues: readonly string[]) =>
  z
    .string()
    .refine(
      (value) => value.length === 0 || isAllowedOption(value, allowedValues),
      "Choose a valid option.",
    );

const isAllowedOption = (value: string, allowedValues: readonly string[]) =>
  allowedValues.some((allowedValue) => allowedValue === value);

const playbookStepSchema = z
  .object({
    category: z.string().min(1, "Product role is required."),
    frequency: z.string().min(1, "Frequency is required."),
    notes: z.string().max(500, "Keep step notes under 500 characters."),
    productBrand: z.string().max(255),
    productId: z.string(),
    productName: z.string().max(255),
    slot: z.enum(["am", "pm", "either"]),
  })
  .superRefine((value, context) => {
    if (!value.productId && !value.productName.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a shelf product or product name.",
        path: ["productName"],
      });
    }
  });

export const communityReviewFormSchema = z.object({
  body: z.string().max(1200, "Keep review text under 1,200 characters."),
  contextCategory: z.string().min(1, "Routine context is required."),
  contextProductBrand: z.string().max(255),
  contextProductName: z
    .string()
    .min(1, "At least one product used with it is required.")
    .max(255),
  disclosureType: z.enum(communityDisclosureTypes),
  effectivenessRating: requiredOption(
    "Effectiveness rating is required.",
    communityReviewRatingValues,
  ),
  frequency: z.string().min(1, "Usage frequency is required."),
  irritationRating: requiredOption(
    "Irritation rating is required.",
    communityReviewRatingValues,
  ),
  overallRating: requiredOption(
    "Overall rating is required.",
    communityReviewRatingValues,
  ),
  outcomes: z.string().min(1, "At least one outcome is required."),
  productBrand: z.string().min(1, "Brand is required.").max(255),
  productCategory: z.string().min(1, "Product category is required."),
  productName: z.string().min(1, "Product name is required.").max(255),
  repurchase: z.string().min(1, "Repurchase status is required."),
  routineSlot: requiredOption(
    "Routine timing is required.",
    communityReviewRoutineSlots,
  ),
  selectedContextShelfProductId: z.string(),
  selectedShelfProductId: z.string(),
  skinResponse: requiredOption(
    "Skin response is required.",
    communityReviewSkinResponses,
  ),
  textureRating: z
    .string()
    .refine(
      (value) =>
        value.length === 0 || isAllowedOption(value, communityReviewRatingValues),
      "Choose a valid option.",
    ),
  usageDuration: z.string().min(1, "Usage duration is required."),
  valueRating: z
    .string()
    .refine(
      (value) =>
        value.length === 0 || isAllowedOption(value, communityReviewRatingValues),
      "Choose a valid option.",
    ),
});

export const communityRoutineFormSchema = z.object({
  avoidTags: z.array(z.string()).max(12),
  disclosureType: z.enum(communityDisclosureTypes),
  didNotWorkTags: z.array(z.string()).max(12),
  goal: z.string().min(1, "Goal is required."),
  goalResult: optionalOption(communityGoalResults),
  habitTags: z.array(z.string()).max(12),
  steps: z
    .array(playbookStepSchema)
    .min(1, "Add at least one product or routine step.")
    .max(12),
  summary: z.string().max(500, "Keep routine notes under 500 characters."),
  timeframe: requiredOption("Timeframe is required.", communityGoalTimeframes),
  title: z.string().min(3, "Routine title is required.").max(120),
  warningTags: z.array(z.string()).max(12),
});

export const communityOutcomeSignalFormSchema = z.object({
  followedParts: z
    .array(
      z.enum(outcomeFollowedPartOptions.map((option) => option.value) as [
        string,
        ...string[],
      ]),
    )
    .min(1, "Choose what you followed."),
  irritationLevel: requiredOption(
    "Irritation level is required.",
    outcomeIrritationOptions.map((option) => option.value),
  ),
  sameGoal: requiredOption("Goal match is required.", ["true", "false"]),
  trialDuration: requiredOption(
    "Trial duration is required.",
    outcomeTrialDurationOptions.map((option) => option.value),
  ),
});

export type CommunityReviewFormValues = z.infer<
  typeof communityReviewFormSchema
>;

export type CommunityRoutineFormValues = z.infer<
  typeof communityRoutineFormSchema
>;

export type CommunityOutcomeSignalFormValues = z.infer<
  typeof communityOutcomeSignalFormSchema
>;

export const defaultCommunityReviewValues: CommunityReviewFormValues = {
  body: "",
  contextCategory: "cleanser",
  contextProductBrand: "",
  contextProductName: "",
  disclosureType: "ordinary",
  effectivenessRating: "",
  frequency: "",
  irritationRating: "",
  overallRating: "",
  outcomes: "",
  productBrand: "",
  productCategory: "moisturizer",
  productName: "",
  repurchase: "",
  routineSlot: "",
  selectedContextShelfProductId: "",
  selectedShelfProductId: "",
  skinResponse: "",
  textureRating: "",
  usageDuration: "",
  valueRating: "",
};

export const defaultCommunityRoutineValues: CommunityRoutineFormValues = {
  avoidTags: [],
  disclosureType: "ordinary",
  didNotWorkTags: [],
  goal: "",
  goalResult: "",
  habitTags: [],
  steps: [
    {
      category: "cleanser",
      frequency: "daily",
      notes: "",
      productBrand: "",
      productId: "",
      productName: "",
      slot: "pm",
    },
  ],
  summary: "",
  timeframe: "",
  title: "",
  warningTags: [],
};

export const defaultCommunityOutcomeSignalValues: CommunityOutcomeSignalFormValues =
  {
    followedParts: [],
    irritationLevel: "",
    sameGoal: "",
    trialDuration: "",
  };
