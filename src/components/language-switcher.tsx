'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale, persistLocalePreference } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  sv: 'Svenska',
};

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Industry-standard web-app locale switcher: persists the preferred locale
 * in a cookie (`NEXT_LOCALE`, 1 year) and refreshes the current route so
 * React Server Components pick up the new `getRequestConfig` result. No URL
 * path segment, no page reload, preserved query params and scroll position.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const tFooter = useTranslations('footer');
  const activeLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleSelect = (locale: Locale) => {
    if (locale === activeLocale) return;
    persistLocalePreference(locale);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label={tFooter('columns.language')}
      className={className ?? 'flex flex-col gap-3 text-sm text-muted'}
      data-pending={isPending ? 'true' : undefined}
    >
      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleSelect(locale)}
            aria-current={isActive ? 'true' : undefined}
            disabled={isPending}
            className={
              isActive
                ? 'text-left font-semibold text-foreground'
                : 'text-left transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60'
            }
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
