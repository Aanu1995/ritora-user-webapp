import type {
  CommunityDisclosureType,
  CommunityGoalResult,
  CommunityGoalTimeframe,
  CommunityOutcomeFollowedPart,
  CommunityOutcomeIrritationLevel,
  CommunityOutcomeSignal,
  CommunityOutcomeTrialDuration,
  CommunityReviewRoutineContextUsage,
  CommunityReviewRoutineSlot,
  CommunityReviewSkinResponse,
} from "@/types/community";

export const communityDisclosureTypes = [
  "ordinary",
  "gifted",
  "sponsored",
  "affiliate",
  "professional",
  "brand_rep",
] as const satisfies readonly CommunityDisclosureType[];

export const communityReviewRoutineSlots = [
  "am",
  "pm",
  "am-pm",
  "either",
] as const satisfies readonly CommunityReviewRoutineSlot[];

export const communityReviewRoutineContextUsages = [
  "used_alone",
  "with_products",
  "not_sure",
] as const satisfies readonly CommunityReviewRoutineContextUsage[];

export const communityReviewSkinResponses = [
  "improved",
  "no_change",
  "mixed",
  "worsened",
] as const satisfies readonly CommunityReviewSkinResponse[];

export const communityReviewRatingValues = ["1", "2", "3", "4", "5"] as const;

export const communitySkinTypeOptions = [
  { value: "oily" },
  { value: "dry" },
  { value: "combination" },
  { value: "normal" },
  { value: "sensitive" },
] as const;

export const communityConcernOptions = [
  { value: "acne" },
  { value: "dark_marks" },
  { value: "dryness" },
  { value: "oiliness" },
  { value: "texture" },
  { value: "redness" },
  { value: "large_pores" },
  { value: "fine_lines" },
  { value: "barrier_damage" },
  { value: "eczema" },
  { value: "uneven_tone" },
] as const;

export const communitySensitivityOptions = [
  { value: "low" },
  { value: "moderate" },
  { value: "high" },
  { value: "very_high" },
] as const;

export const communityMinimumRatingOptions = [
  { value: "5" },
  { value: "4" },
  { value: "3" },
  { value: "2" },
  { value: "1" },
] as const;

export const reviewUsageDurationOptions = [
  { value: "2-weeks" },
  { value: "4-weeks" },
  { value: "8-weeks" },
  { value: "3-months-plus" },
] as const;

export const reviewFrequencyOptions = [
  { value: "daily" },
  { value: "am-pm" },
  { value: "few-times-week" },
  { value: "weekly" },
  { value: "as-needed" },
] as const;

export const reviewRoutineSlotOptions: Array<{
  value: CommunityReviewRoutineSlot;
}> = [
  { value: "am" },
  { value: "pm" },
  { value: "am-pm" },
  { value: "either" },
];

export const reviewSkinResponseOptions: Array<{
  value: CommunityReviewSkinResponse;
}> = [
  { value: "improved" },
  { value: "no_change" },
  { value: "mixed" },
  { value: "worsened" },
];

export const reviewRepurchaseOptions = [
  { value: "yes" },
  { value: "maybe" },
  { value: "no" },
] as const;

export const productCategoryOptions = [
  { value: "cleanser" },
  { value: "moisturizer" },
  { value: "treatment" },
  { value: "serum" },
  { value: "sunscreen" },
  { value: "exfoliant" },
  { value: "toner" },
  { value: "mask" },
] as const;

export const communityGoalOptions = [
  { value: "acne-control" },
  { value: "dark-marks" },
  { value: "barrier-repair" },
  { value: "less-dryness" },
  { value: "less-irritation" },
  { value: "smoother-texture" },
  { value: "oil-control" },
] as const;

export const communityGoalResults = [
  "achieved",
  "mostly_improved",
  "partially_improved",
  "maintained",
  "mixed",
] as const satisfies readonly CommunityGoalResult[];

export const communityGoalTimeframes = [
  "2-weeks",
  "4-weeks",
  "8-weeks",
  "3-months",
  "3-months-plus",
  "6-months",
  "12-months-plus",
] as const satisfies readonly CommunityGoalTimeframe[];

export const goalResultOptions: Array<{
  value: CommunityGoalResult;
}> = [
  { value: "achieved" },
  { value: "mostly_improved" },
  { value: "partially_improved" },
  { value: "maintained" },
  { value: "mixed" },
];

export const goalTimeframeOptions: Array<{
  value: CommunityGoalTimeframe;
}> = [
  { value: "2-weeks" },
  { value: "4-weeks" },
  { value: "8-weeks" },
  { value: "3-months" },
  { value: "3-months-plus" },
  { value: "6-months" },
  { value: "12-months-plus" },
];

export const avoidTagOptions = [
  { value: "over-exfoliation" },
  { value: "late-night-sugary-food" },
  { value: "skipping-sunscreen" },
  { value: "sleeping-with-makeup" },
  { value: "picking-skin" },
  { value: "too-many-actives" },
  { value: "fragrance" },
] as const;

export const habitTagOptions = [
  { value: "consistent-sleep" },
  { value: "changed-pillowcase" },
  { value: "gentle-cleansing" },
  { value: "daily-sunscreen" },
  { value: "slow-introduction" },
] as const;

export const didNotWorkTagOptions = [
  { value: "daily-acids" },
  { value: "harsh-cleanser" },
  { value: "too-many-steps" },
  { value: "heavy-oils" },
  { value: "skipping-moisturizer" },
] as const;

export const warningTagOptions = [
  { value: "patch-test-first" },
  { value: "go-slow-if-sensitive" },
  { value: "irritation-possible" },
  { value: "needs-sunscreen" },
  { value: "professional-care-involved" },
] as const;

export const outcomeSignalOptions: Array<{
  value: CommunityOutcomeSignal;
}> = [
  { value: "worked_for_me_too" },
  { value: "worked_with_changes" },
  { value: "mixed_result" },
  { value: "did_not_work" },
  { value: "caused_irritation" },
  { value: "not_relevant" },
];

export const outcomeTrialDurationOptions: Array<{
  value: CommunityOutcomeTrialDuration;
}> = [
  { value: "under-2-weeks" },
  { value: "2-weeks" },
  { value: "4-weeks" },
  { value: "8-weeks" },
  { value: "3-months-plus" },
];

export const outcomeFollowedPartOptions: Array<{
  value: CommunityOutcomeFollowedPart;
}> = [
  { value: "products" },
  { value: "routine-timing" },
  { value: "avoid-list" },
  { value: "habits" },
  { value: "partial" },
];

export const reviewOutcomeFollowedPartOptions: Array<{
  value: CommunityOutcomeFollowedPart;
}> = [{ value: "products" }, { value: "routine-timing" }, { value: "partial" }];

export const outcomeIrritationOptions: Array<{
  value: CommunityOutcomeIrritationLevel;
}> = [
  { value: "none" },
  { value: "mild" },
  { value: "moderate" },
  { value: "severe" },
];
