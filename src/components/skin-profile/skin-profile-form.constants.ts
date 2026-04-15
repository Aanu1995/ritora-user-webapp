import { z } from 'zod';
import type {
  SkinProfile,
  SkinProfileInput,
} from '@/types/skin-profile';

export const TOTAL_SKIN_PROFILE_STEPS = 4;
export const countryCodePattern = /^[A-Za-z]{2}$/;

export const skinProfileSchema = z
  .object({
    skinType: z.string(),
    skinTone: z.string(),
    ageRange: z.string(),
    ethnicity: z.string(),
    currentConcerns: z.array(z.string()),
    knownSensitivities: z.array(z.string()),
    skinGoals: z.array(z.string()),
    countryCode: z
      .string()
      .max(2)
      .refine((value) => !value || countryCodePattern.test(value), {
        message: 'validation.invalidCountryCode',
      }),
    city: z.string().max(100, 'validation.cityTooLong'),
    routineComplexity: z.string(),
    locationConsent: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (hasLocationData(value.countryCode, value.city) && !value.locationConsent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locationConsent'],
        message: 'validation.locationConsentRequired',
      });
    }
  });

export type SkinProfileFormValues = z.infer<typeof skinProfileSchema>;
export type Step3ErrorKind = null | 'country' | 'consent';

export const DEFAULT_SKIN_PROFILE_VALUES: SkinProfileFormValues = {
  skinType: '',
  skinTone: '',
  ageRange: '',
  ethnicity: '',
  currentConcerns: [],
  knownSensitivities: [],
  skinGoals: [],
  countryCode: '',
  city: '',
  routineComplexity: '',
  locationConsent: false,
};

export function hasLocationData(countryCode: string, city: string): boolean {
  return Boolean(countryCode.trim() || city.trim());
}

export function getSkinProfileFormValues(
  profile?: SkinProfile | null,
): SkinProfileFormValues {
  if (!profile) {
    return {
      ...DEFAULT_SKIN_PROFILE_VALUES,
      currentConcerns: [],
      knownSensitivities: [],
      skinGoals: [],
    };
  }

  return {
    skinType: profile.skinType ?? '',
    skinTone: profile.skinTone ?? '',
    ageRange: profile.ageRange ?? '',
    ethnicity: profile.ethnicity ?? '',
    currentConcerns: [...profile.currentConcerns],
    knownSensitivities: [...profile.knownSensitivities],
    skinGoals: [...profile.skinGoals],
    countryCode: profile.countryCode ?? '',
    city: profile.city ?? '',
    routineComplexity: profile.routineComplexity ?? '',
    locationConsent: hasLocationData(profile.countryCode ?? '', profile.city ?? ''),
  };
}

export function buildSkinProfilePayload(
  values: SkinProfileFormValues,
  existingProfile: SkinProfile | null | undefined,
  isEdit: boolean,
): SkinProfileInput {
  const toNullableSelect = (
    raw: string,
    previous: string | null | undefined,
  ): string | null | undefined => {
    if (raw) {
      return raw;
    }

    if (previous !== null && previous !== undefined) {
      return null;
    }

    return undefined;
  };

  const toNullableString = (
    raw: string,
    previous: string | null | undefined,
  ): string | null | undefined => {
    const trimmed = raw.trim();
    if (trimmed) {
      return trimmed;
    }

    if (previous !== null && previous !== undefined) {
      return null;
    }

    return undefined;
  };

  const payload: SkinProfileInput = {
    skinType: toNullableSelect(values.skinType, existingProfile?.skinType),
    skinTone: toNullableSelect(values.skinTone, existingProfile?.skinTone),
    ageRange: toNullableSelect(values.ageRange, existingProfile?.ageRange),
    ethnicity: toNullableSelect(values.ethnicity, existingProfile?.ethnicity),
    routineComplexity: toNullableSelect(
      values.routineComplexity,
      existingProfile?.routineComplexity,
    ),
    currentConcerns:
      isEdit || values.currentConcerns.length > 0
        ? values.currentConcerns
        : undefined,
    knownSensitivities:
      isEdit || values.knownSensitivities.length > 0
        ? values.knownSensitivities
        : undefined,
    skinGoals:
      isEdit || values.skinGoals.length > 0 ? values.skinGoals : undefined,
    countryCode: toNullableString(
      values.countryCode.toUpperCase(),
      existingProfile?.countryCode,
    ),
    city: toNullableString(values.city, existingProfile?.city),
  };

  if (hasLocationData(payload.countryCode ?? '', payload.city ?? '')) {
    payload.locationConsent = values.locationConsent;
  }

  return payload;
}

export function validateLocationStep(
  values: Pick<SkinProfileFormValues, 'countryCode' | 'city' | 'locationConsent'>,
): Step3ErrorKind {
  const trimmedCountry = values.countryCode.trim();

  if (trimmedCountry && !countryCodePattern.test(trimmedCountry)) {
    return 'country';
  }

  if (hasLocationData(trimmedCountry, values.city) && !values.locationConsent) {
    return 'consent';
  }

  return null;
}
