'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_NAME,
} from '@/constants/cookies';
import { setClientCookie } from '@/lib/client-cookie';

interface CookieConsentProps {
  hasStoredPreference: boolean;
}

export function CookieConsent({ hasStoredPreference }: CookieConsentProps) {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(!hasStoredPreference);

  const handleAccept = () => {
    setClientCookie(COOKIE_CONSENT_NAME, 'accepted', {
      maxAge: COOKIE_CONSENT_MAX_AGE,
    });
    setVisible(false);
  };

  const handleReject = () => {
    setClientCookie(COOKIE_CONSENT_NAME, 'rejected', {
      maxAge: COOKIE_CONSENT_MAX_AGE,
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="animate-slide-up mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-hero sm:flex-row">
        <p className="flex-1 text-sm text-muted">
          {t('message')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:border-accent"
          >
            {t('reject')}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
