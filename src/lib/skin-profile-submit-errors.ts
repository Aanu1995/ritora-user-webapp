import { getApiErrorMessage } from '@/lib/api-error';
import type { SubmissionValidationResult } from '@/lib/form-submission';

type ProfileTranslator = (key: string) => string;

export type SkinProfileFieldName =
  | 'ageRange'
  | 'city'
  | 'countryCode'
  | 'currentConcerns'
  | 'ethnicity'
  | 'knownSensitivities'
  | 'locationConsent'
  | 'routineComplexity'
  | 'skinGoals'
  | 'skinTone'
  | 'skinType';

export function getSkinProfileSubmitError(
  error: unknown,
  t: ProfileTranslator,
): SubmissionValidationResult<SkinProfileFieldName> {
  return {
    form: getApiErrorMessage(error) ?? t('failedToSave'),
    fields: {},
  };
}
