'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useVerifyEmail } from '@/hooks/use-auth';
import { Link } from '@/i18n/navigation';

function VerifyEmailContent() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmail = useVerifyEmail();

  useEffect(() => {
    if (token && !verifyEmail.isSuccess && !verifyEmail.isError) {
      verifyEmail.mutate(token);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">{t('invalidVerificationToken')}</p>
        <Link
          href="/resend-verification"
          className="mt-4 inline-block text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (verifyEmail.isPending) {
    return (
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--color-accent)] border-t-transparent" />
        <p className="mt-4 text-sm text-[color:var(--color-muted)]">
          {t('verifyingEmail')}
        </p>
      </div>
    );
  }

  if (verifyEmail.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-[color:var(--color-accent)]">
          {t('emailVerifiedSuccess')}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90"
        >
          {t('continueToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-red-600">
        {(verifyEmail.error as any)?.body?.message ?? t('verificationFailed')}
      </p>
      <Link
        href="/resend-verification"
        className="inline-block text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
      >
        {t('requestNewLink')}
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations('auth');

  return (
    <div>
      <h1 className="text-center font-display text-3xl tracking-tight">
        {t('verifyEmail')}
      </h1>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="text-center text-sm text-[color:var(--color-muted)]">
              {t('loading')}
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
