import {
  countryCodePattern,
  hasLocationData,
  isValidBirthDate,
  type SkinProfileFormValues,
} from "./skin-profile-form.constants";

const hasValue = (value: string) => value.trim().length > 0;

const hasAllValues = (
  values: SkinProfileFormValues,
  fields: Array<keyof SkinProfileFormValues>,
) => fields.every((field) => hasValue(String(values[field] ?? "")));

export function isEssentialStepComplete(
  step: number,
  values: SkinProfileFormValues,
): boolean {
  if (step === 1) {
    return (
      hasAllValues(values, [
        "skinType",
        "skinTone",
        "sexAtBirth",
        "ethnicity",
      ]) && isValidBirthDate(values.dateOfBirth)
    );
  }

  if (step === 2) {
    return (
      values.currentConcerns.length > 0 &&
      hasValue(values.primaryGoal) &&
      values.currentConcerns.every((concern) =>
        hasValue(values.concernSeverities[concern] ?? ""),
      )
    );
  }

  if (step === 3) {
    return hasAllValues(values, [
      "fitzpatrickPhototype",
      "pihTendency",
      "melasmaTendency",
      "keloidTendency",
      "sunscreenHabit",
      "sunscreenTolerance",
    ]);
  }

  if (step === 4) {
    return hasAllValues(values, ["routinePace"]);
  }

  if (step === 5) {
    const countryCode = values.countryCode.trim();
    return !(
      (countryCode && !countryCodePattern.test(countryCode)) ||
      (hasLocationData(countryCode, values.city) && !values.locationConsent)
    );
  }

  if (step === 6) {
    return (
      hasAllValues(values, [
        "fragranceFree",
        "nonComedogenic",
        "sunscreenFilter",
        "sunscreenFinish",
        "budgetTier",
      ]) && values.allowSmartPicks !== null
    );
  }

  return true;
}
