import {
  buildSkinProfilePayload,
  getSkinProfileFormValues,
  hasLocationData,
  validateLocationStep,
} from '@/components/skin-profile/skin-profile-form.constants';
import type { SkinProfile } from '@/types/skin-profile';

const existingProfile: SkinProfile = {
  id: 'profile-1',
  skinType: 'oily',
  skinTone: 'medium',
  ageRange: '25_34',
  ethnicity: 'black',
  currentConcerns: ['acne'],
  knownSensitivities: ['Fragrance'],
  skinGoals: ['clear_acne'],
  countryCode: 'SE',
  city: 'Stockholm',
  routineComplexity: 'moderate',
  createdAt: '2026-04-15T10:00:00.000Z',
  updatedAt: '2026-04-15T10:00:00.000Z',
};

describe('skin profile form constants', () => {
  it('hydrates form values from an existing profile', () => {
    expect(getSkinProfileFormValues(existingProfile)).toEqual({
      skinType: 'oily',
      skinTone: 'medium',
      ageRange: '25_34',
      ethnicity: 'black',
      currentConcerns: ['acne'],
      knownSensitivities: ['Fragrance'],
      skinGoals: ['clear_acne'],
      countryCode: 'SE',
      city: 'Stockholm',
      routineComplexity: 'moderate',
      locationConsent: true,
    });
  });

  it('normalizes strings and preserves null clears when building edit payloads', () => {
    const payload = buildSkinProfilePayload(
      {
        skinType: '',
        skinTone: 'dark',
        ageRange: '',
        ethnicity: '',
        currentConcerns: [],
        knownSensitivities: [],
        skinGoals: ['fade_dark_marks'],
        countryCode: ' se ',
        city: '  ',
        routineComplexity: '',
        locationConsent: false,
      },
      existingProfile,
      true,
    );

    expect(payload).toEqual({
      skinType: null,
      skinTone: 'dark',
      ageRange: null,
      ethnicity: null,
      currentConcerns: [],
      knownSensitivities: [],
      skinGoals: ['fade_dark_marks'],
      countryCode: 'SE',
      city: null,
      routineComplexity: null,
      locationConsent: false,
    });
  });

  it('omits empty optional arrays for create payloads', () => {
    const payload = buildSkinProfilePayload(
      {
        skinType: 'oily',
        skinTone: '',
        ageRange: '',
        ethnicity: '',
        currentConcerns: [],
        knownSensitivities: [],
        skinGoals: [],
        countryCode: '',
        city: '',
        routineComplexity: 'minimal',
        locationConsent: false,
      },
      null,
      false,
    );

    expect(payload).toEqual({
      skinType: 'oily',
      skinTone: undefined,
      ageRange: undefined,
      ethnicity: undefined,
      currentConcerns: undefined,
      knownSensitivities: undefined,
      skinGoals: undefined,
      countryCode: undefined,
      city: undefined,
      routineComplexity: 'minimal',
    });
  });

  it('detects location data from either country or city', () => {
    expect(hasLocationData('SE', '')).toBe(true);
    expect(hasLocationData('', 'Stockholm')).toBe(true);
    expect(hasLocationData(' ', '   ')).toBe(false);
  });

  it('validates location consent and country format', () => {
    expect(
      validateLocationStep({
        countryCode: 'SWE',
        city: '',
        locationConsent: false,
      }),
    ).toBe('country');

    expect(
      validateLocationStep({
        countryCode: 'SE',
        city: '',
        locationConsent: false,
      }),
    ).toBe('consent');

    expect(
      validateLocationStep({
        countryCode: '',
        city: '',
        locationConsent: false,
      }),
    ).toBeNull();
  });
});
