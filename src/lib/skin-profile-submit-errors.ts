import {
  getApiErrorMessage,
  getApiErrorMessages,
} from "@/lib/api-error";
import type { SubmissionValidationResult } from "@/lib/form-submission";

type ProfileTranslator = (key: string) => string;

export type SkinProfileFieldName =
  | "city"
  | "countryCode"
  | "currentConcerns"
  | "dateOfBirth"
  | "ethnicity"
  | "fitzpatrickPhototype"
  | "locationConsent"
  | "primaryGoal"
  | "routinePreferences"
  | "sexAtBirth"
  | "skinBehavior"
  | "skinTone"
  | "skinType";

const FIELD_PATTERNS: Array<{
  field: SkinProfileFieldName;
  pattern: RegExp;
}> = [
  { field: "skinType", pattern: /skin[\s_-]*type/i },
  { field: "skinTone", pattern: /skin[\s_-]*tone/i },
  { field: "fitzpatrickPhototype", pattern: /fitzpatrick|phototype/i },
  { field: "dateOfBirth", pattern: /date[\s_-]*of[\s_-]*birth|dob/i },
  { field: "sexAtBirth", pattern: /sex[\s_-]*at[\s_-]*birth/i },
  { field: "ethnicity", pattern: /\bethnicity\b/i },
  { field: "currentConcerns", pattern: /concerns?/i },
  { field: "primaryGoal", pattern: /primary[\s_-]*goal|goals?/i },
  { field: "skinBehavior", pattern: /burn|pigment|sunscreen|melasma|keloid/i },
  { field: "countryCode", pattern: /country/i },
  { field: "city", pattern: /\bcity\b/i },
  { field: "routinePreferences", pattern: /routine|fragrance|comedogenic|budget/i },
  { field: "locationConsent", pattern: /location[\s_-]*consent/i },
];

export function getSkinProfileSubmitError(
  error: Error | null | undefined,
  t: ProfileTranslator,
): SubmissionValidationResult<SkinProfileFieldName> {
  const messages = getApiErrorMessages(error);

  for (const { field, pattern } of FIELD_PATTERNS) {
    const message = messages.find((entry) => pattern.test(entry));

    if (message) {
      return {
        form: undefined,
        fields: {
          [field]: message,
        },
      };
    }
  }

  return {
    form: getApiErrorMessage(error) ?? t("failedToSave"),
    fields: {},
  };
}
