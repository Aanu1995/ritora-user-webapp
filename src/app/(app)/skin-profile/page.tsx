'use client';

import { useTranslations } from 'next-intl';
import { useSkinProfile, useSkinProfileOptions } from '@/hooks/use-skin-profile';
import { getApiErrorStatus } from '@/lib/api-error';
import { SkinProfileForm } from '@/components/skin-profile/skin-profile-form';
import { SkinProfileSkeleton } from '@/components/skin-profile/skin-profile-skeleton';
import { RetryPanel } from '@/components/ui/retry-panel';

export default function SkinProfilePage() {
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('skinProfile');
  const profile = useSkinProfile();
  const options = useSkinProfileOptions();
  const profileStatusCode = getApiErrorStatus(profile.error);
  const hasProfileError = profile.isError && profileStatusCode !== 404;
  const hasOptionsError = options.isError;

  if (options.isPending || (profile.isPending && !profile.isError)) {
    return <SkinProfileSkeleton />;
  }

  if (hasProfileError || hasOptionsError || !options.data) {
    return (
      <RetryPanel
        title={tCommon('error')}
        description={tProfile('failedToLoad')}
        actionLabel={tCommon('retry')}
        onAction={() => {
          void Promise.all([options.refetch(), profile.refetch()]);
        }}
      />
    );
  }

  return (
    <SkinProfileForm existingProfile={profile.data ?? null} options={options.data} />
  );
}
