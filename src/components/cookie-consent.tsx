'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const COOKIE_CONSENT_KEY = 'ritora_cookie_consent';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function CookieConsent() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find((item) => item.startsWith(`${COOKIE_CONSENT_KEY}=`))
      ?.split('=')[1];
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = `${COOKIE_CONSENT_KEY}=accepted; Max-Age=${ONE_YEAR_IN_SECONDS}; Path=/; SameSite=Lax`;
    setVisible(false);
  };

  const handleReject = () => {
    document.cookie = `${COOKIE_CONSENT_KEY}=rejected; Max-Age=${ONE_YEAR_IN_SECONDS}; Path=/; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-hero)] sm:flex-row">
        <p className="flex-1 text-sm text-[color:var(--color-muted)]">
          {t('message')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="rounded-xl border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium transition hover:border-[color:var(--color-accent)]"
          >
            {t('reject')}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-xl bg-[color:var(--color-foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
