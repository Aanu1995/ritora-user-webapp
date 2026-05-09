export const SkinProfileValue = {
  Male: "male",
  NotPregnant: "not_pregnant",
  PreferNotToSay: "prefer_not_to_say",
  Other: "other",
  Unknown: "unknown",
  OtherPhotosensitizing: "other_photosensitizing",
  Yes: "yes",
  No: "no",
  YesActively: "yes_actively",
  YesOccasional: "yes_occasional",
  None: "none",
  Ingredient: "ingredient",
  Suspected: "suspected",
  Mild: "mild",
  Moderate: "moderate",
  Severe: "severe",
  NeverTried: "never_tried",
  ToleratesWell: "tolerates_well",
} as const;

export type SkinProfileValue =
  (typeof SkinProfileValue)[keyof typeof SkinProfileValue];

export const TriStateBooleanValue = {
  Yes: SkinProfileValue.Yes,
  No: SkinProfileValue.No,
  PreferNotToSay: SkinProfileValue.PreferNotToSay,
} as const;

export type TriStateBooleanValue =
  (typeof TriStateBooleanValue)[keyof typeof TriStateBooleanValue];

export const TRI_STATE_BOOLEAN_OPTIONS = [
  TriStateBooleanValue.Yes,
  TriStateBooleanValue.No,
  TriStateBooleanValue.PreferNotToSay,
] as const;

export const DERM_CARE_OPTIONS = [
  SkinProfileValue.YesActively,
  SkinProfileValue.YesOccasional,
  SkinProfileValue.No,
] as const;
