import {
  getApiErrorMessage,
  getApiErrorMessages,
} from "@/lib/api-error";
import type { SubmissionValidationResult } from "@/lib/form-submission";

type ProfileTranslator = (key: string) => string;

export type SkinProfileFieldName =
  | "ageRange"
  | "city"
  | "countryCode"
  | "currentConcerns"
  | "ethnicity"
  | "knownSensitivities"
  | "locationConsent"
  | "routineComplexity"
  | "skinGoals"
  | "skinTone"
  | "skinType";

const FIELD_PATTERNS: Array<{
  field: SkinProfileFieldName;
  pattern: RegExp;
}> = [
  { field: "skinType", pattern: /skin[\s_-]*type/i },
  { field: "skinTone", pattern: /skin[\s_-]*tone/i },
  { field: "ageRange", pattern: /age[\s_-]*range/i },
  { field: "ethnicity", pattern: /\bethnicity\b/i },
  { field: "currentConcerns", pattern: /concerns?/i },
  { field: "knownSensitivities", pattern: /sensitivit/i },
  { field: "skinGoals", pattern: /goals?/i },
  { field: "countryCode", pattern: /country/i },
  { field: "city", pattern: /\bcity\b/i },
  { field: "routineComplexity", pattern: /routine[\s_-]*complexity/i },
  { field: "locationConsent", pattern: /location[\s_-]*consent/i },
];

export function getSkinProfileSubmitError(
  error: unknown,
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
