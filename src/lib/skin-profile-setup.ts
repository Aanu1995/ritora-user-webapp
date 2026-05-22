import type { SkinProfile } from '@/types/skin-profile';

export type SkinProfileSetupSectionKey =
  | 'baseline'
  | 'concerns'
  | 'sun'
  | 'routine'
  | 'preferences'
  | 'location';

export type SkinProfileSetupSection = {
  key: SkinProfileSetupSectionKey;
  complete: boolean;
  required: boolean;
};

export type SkinProfileSetupStatus = {
  hasProfile: boolean;
  isCoreComplete: boolean;
  isFullyComplete: boolean;
  completedCount: number;
  totalCount: number;
  completedRequiredCount: number;
  totalRequiredCount: number;
  sections: SkinProfileSetupSection[];
  nextIncompleteSection: SkinProfileSetupSection | null;
};

export function getSkinProfileSetupStatus(
  profile?: SkinProfile | null,
): SkinProfileSetupStatus {
  const hasText = (value: string | null | undefined) => Boolean(value);
  const hasNumber = (value: number | null | undefined) =>
    typeof value === 'number' && Number.isFinite(value);
  const hasBoolean = (value: boolean | null | undefined) =>
    typeof value === 'boolean';
  const concernDetails = profile?.concernDetails?.per_concern ?? [];
  const concerns = profile?.currentConcerns ?? [];
  const hasConcernDetails =
    concerns.length > 0 &&
    concerns.every((concern) => {
      const detail = concernDetails.find((entry) => entry.concern === concern);
      return Boolean(detail?.severity && hasNumber(detail.priority));
    });
  const skinBehavior = profile?.skinBehavior ?? {};
  const routinePreferences = profile?.routinePreferences ?? {};

  const sections: SkinProfileSetupSection[] = [
    {
      key: 'baseline',
      required: true,
      complete: Boolean(
        profile?.skinType &&
          profile.skinTone &&
          profile.fitzpatrickPhototype &&
          profile.dateOfBirth &&
          profile.sexAtBirth &&
          profile.ethnicity,
      ),
    },
    {
      key: 'concerns',
      required: true,
      complete: Boolean(
        concerns.length > 0 && profile?.primaryGoal && hasConcernDetails,
      ),
    },
    {
      key: 'sun',
      required: true,
      complete: Boolean(
        skinBehavior.burn_tendency &&
          skinBehavior.pih_tendency &&
          skinBehavior.melasma_tendency &&
          skinBehavior.keloid_tendency &&
          skinBehavior.sunscreen_habit &&
          skinBehavior.sunscreen_tolerance,
      ),
    },
    {
      key: 'routine',
      required: true,
      complete: Boolean(
        routinePreferences.pace &&
          hasNumber(routinePreferences.am_minutes) &&
          hasNumber(routinePreferences.pm_minutes) &&
          hasNumber(routinePreferences.max_active_nights_per_week),
      ),
    },
    {
      key: 'preferences',
      required: true,
      complete: Boolean(
        hasBoolean(profile?.allowSmartPicks) &&
          hasBoolean(routinePreferences.fragrance_free) &&
          hasBoolean(routinePreferences.non_comedogenic) &&
          profile?.budgetTier &&
          routinePreferences.sunscreen_filter &&
          routinePreferences.sunscreen_finish,
      ),
    },
    {
      key: 'location',
      required: false,
      complete: Boolean(hasText(profile?.countryCode) || hasText(profile?.city)),
    },
  ];

  const completedCount = sections.filter((section) => section.complete).length;
  const requiredSections = sections.filter((section) => section.required);
  const completedRequiredCount = requiredSections.filter(
    (section) => section.complete,
  ).length;
  const isCoreComplete =
    completedRequiredCount === requiredSections.length && Boolean(profile);
  const isFullyComplete =
    completedCount === sections.length && Boolean(profile);

  return {
    hasProfile: Boolean(profile),
    isCoreComplete,
    isFullyComplete,
    completedCount,
    totalCount: sections.length,
    completedRequiredCount,
    totalRequiredCount: requiredSections.length,
    sections,
    nextIncompleteSection: sections.find((section) => !section.complete) ?? null,
  };
}
