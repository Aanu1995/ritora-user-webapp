import { firstFieldError, type FieldIssue } from "@/lib/form-errors";
import type { SkinProfileOptions } from "@/types/skin-profile";
import type { SkinProfileFormValues } from "./skin-profile-form.constants";

export type SkinProfileStringField =
  | "budgetTier"
  | "city"
  | "countryCode"
  | "dateOfBirth"
  | "ethnicity"
  | "fitzpatrickPhototype"
  | "fragranceFree"
  | "keloidTendency"
  | "melasmaTendency"
  | "nonComedogenic"
  | "pihTendency"
  | "primaryGoal"
  | "routinePace"
  | "sexAtBirth"
  | "skinTone"
  | "skinType"
  | "sunscreenFilter"
  | "sunscreenFinish"
  | "sunscreenHabit"
  | "sunscreenTolerance";

export type SkinProfileBooleanField = "allowSmartPicks" | "locationConsent";

export type SkinProfileStringArrayField = "currentConcerns";

export type SkinProfileFieldMeta = Partial<
  Record<keyof SkinProfileFormValues, { errors?: ReadonlyArray<FieldIssue> }>
>;

export interface SharedStepProps {
  values: SkinProfileFormValues;
  options: SkinProfileOptions;
  toggleSingleSelect: (
    field: SkinProfileStringField,
    value: string,
  ) => void;
  translateOption: (value: string) => string;
}

export function getFieldError(
  fieldMeta: SkinProfileFieldMeta,
  field: keyof SkinProfileFormValues,
  translate: (key: string) => string,
): string | undefined {
  return firstFieldError(fieldMeta[field]?.errors, translate);
}
