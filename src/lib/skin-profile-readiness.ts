import {
  getSkinProfileFormValues,
  skinProfileSchema,
} from '@/components/skin-profile/skin-profile-form.constants';
import type { SkinProfile } from '@/types/skin-profile';

export function isSkinProfileReady(profile: SkinProfile | null | undefined) {
  if (!profile) {
    return false;
  }

  return skinProfileSchema.safeParse(getSkinProfileFormValues(profile)).success;
}
