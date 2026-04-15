'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSkinProfile } from '@/hooks/use-skin-profile';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tProfile = useTranslations('skinProfile');
  const user = useAuthStore((s) => s.user);
  const skinProfile = useSkinProfile();
  const translateOption = (value: string) => tProfile(`options.${value}`);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">
          {t('welcome', { firstName: user?.firstName ?? '' })}
        </h1>
        <p className="mt-2 text-[color:var(--color-muted)]">
          {t('subtitle')}
        </p>
      </div>

      {user && !user.emailVerified && (
        <div className="rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-secondary-soft)] p-5">
          <p className="text-sm font-medium text-[color:var(--color-warning)]">
            {t('verifyEmail')}
          </p>
          <Link
            href="/resend-verification"
            className="mt-2 inline-block text-sm font-semibold text-[color:var(--color-warning)] hover:underline"
          >
            {t('resendVerification')}
          </Link>
        </div>
      )}

      {skinProfile.isError && (skinProfile.error as any)?.status === 404 && (
        <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 p-8 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-2xl tracking-tight">
            {t('profileMissingTitle')}
          </h2>
          <p className="mt-3 text-[color:var(--color-muted)]">
            {t('profileMissingDescription')}
          </p>
          <Link
            href="/skin-profile"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[color:var(--color-foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90"
          >
            {t('startProfile')}
          </Link>
        </div>
      )}

      {skinProfile.data && (
        <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 p-8 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-2xl tracking-tight">
            {t('profileTitle')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skinProfile.data.skinType && (
              <div>
                <p className="text-sm text-[color:var(--color-muted)]">
                  {t('skinType')}
                </p>
                <p className="mt-1 font-semibold">
                  {translateOption(skinProfile.data.skinType)}
                </p>
              </div>
            )}
            {skinProfile.data.currentConcerns.length > 0 && (
              <div>
                <p className="text-sm text-[color:var(--color-muted)]">
                  {t('concerns')}
                </p>
                <p className="mt-1 font-semibold">
                  {skinProfile.data.currentConcerns.map(translateOption).join(', ')}
                </p>
              </div>
            )}
            {skinProfile.data.routineComplexity && (
              <div>
                <p className="text-sm text-[color:var(--color-muted)]">
                  {t('routine')}
                </p>
                <p className="mt-1 font-semibold">
                  {translateOption(skinProfile.data.routineComplexity)}
                </p>
              </div>
            )}
          </div>
          <Link
            href="/skin-profile"
            className="mt-5 inline-block text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            {t('editProfile')}
          </Link>
        </div>
      )}
    </div>
  );
}
