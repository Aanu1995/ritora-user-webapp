import type { SkinProfile } from '@/types/skin-profile';

export type SkinProfileSetupSectionKey =
  | 'basics'
  | 'priorities'
  | 'routine'
  | 'context';

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
  const sections: SkinProfileSetupSection[] = [
    {
      key: 'basics',
      required: true,
      complete: Boolean(
        profile?.skinType && profile.skinTone && profile.ageRange,
      ),
    },
    {
      key: 'priorities',
      required: true,
      complete: Boolean(
        (profile?.currentConcerns.length ?? 0) > 0 &&
          (profile?.skinGoals.length ?? 0) > 0,
      ),
    },
    {
      key: 'routine',
      required: true,
      complete: Boolean(profile?.routineComplexity),
    },
    {
      key: 'context',
      required: false,
      complete: Boolean(
        profile?.ethnicity && (profile.countryCode || profile.city),
      ),
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
