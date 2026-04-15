'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useRef } from 'react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useVerifyEmail } from '@/hooks/use-auth';
import { useActionToken } from '@/hooks/use-action-token';
import { getApiErrorMessage } from '@/lib/api-error';

function VerifyEmailContent() {
  const t = useTranslations('auth');
  const { token, isReady } = useActionToken();
  const verifyEmail = useVerifyEmail();
  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || attemptedTokenRef.current === token) {
      return;
    }

    attemptedTokenRef.current = token;
    verifyEmail.mutate(token);
  }, [token, verifyEmail]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <LoadingIndicator />
        <p className="text-sm text-muted">{t('loading')}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-danger">{t('invalidVerificationToken')}</p>
        <Link
          href={AppRoute.ResendVerification}
          className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (verifyEmail.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <LoadingIndicator />
        <p className="text-sm text-muted">{t('verifyingEmail')}</p>
      </div>
    );
  }

  if (verifyEmail.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-accent">{t('emailVerifiedSuccess')}</p>
        <Link
          href={AppRoute.Login}
          className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {t('continueToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-danger">
        {getApiErrorMessage(verifyEmail.error) ?? t('verificationFailed')}
      </p>
      <Link
        href={AppRoute.ResendVerification}
        className="inline-block text-sm font-semibold text-accent hover:underline"
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
            <div className="flex justify-center">
              <LoadingIndicator label={t('loading')} />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
