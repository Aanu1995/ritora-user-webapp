'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale, persistLocalePreference } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  sv: 'Svenska',
  es: 'Español',
};

interface LanguageSwitcherProps {
  className?: string;
  isSaving?: boolean;
  persistLocallyAfterExternalChange?: boolean;
  onLocaleChange?: (
    locale: Locale,
  ) => boolean | void | Promise<boolean | void>;
}

/**
 * Industry-standard web-app locale switcher: persists the preferred locale
 * in a cookie (`NEXT_LOCALE`, 1 year) and refreshes the current route so
 * React Server Components pick up the new `getRequestConfig` result. No URL
 * path segment, no page reload, preserved query params and scroll position.
 */
export function LanguageSwitcher({
  className,
  isSaving = false,
  persistLocallyAfterExternalChange = true,
  onLocaleChange,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const tFooter = useTranslations('footer');
  const activeLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isApplyingExternalChange, setIsApplyingExternalChange] =
    useState(false);

  const refreshLocaleShell = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const applyLocaleChange = (locale: Locale) => {
    persistLocalePreference(locale);
    refreshLocaleShell();
  };

  const handleSelect = async (locale: Locale) => {
    if (locale === activeLocale) {
      return;
    }

    if (!onLocaleChange) {
      applyLocaleChange(locale);
      return;
    }

    setIsApplyingExternalChange(true);

    try {
      const result = await onLocaleChange(locale);

      if (result === false) {
        return;
      }

      if (persistLocallyAfterExternalChange) {
        applyLocaleChange(locale);
        return;
      }

      refreshLocaleShell();
    } finally {
      setIsApplyingExternalChange(false);
    }
  };

  const isDisabled = isPending || isSaving || isApplyingExternalChange;

  return (
    <div
      role="group"
      aria-label={tFooter('columns.language')}
      className={className ?? 'flex flex-col gap-3 text-sm text-muted'}
      data-pending={isDisabled ? 'true' : undefined}
    >
      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => {
              void handleSelect(locale);
            }}
            aria-current={isActive ? 'true' : undefined}
            disabled={isDisabled}
            className={
              isActive
                ? 'cursor-pointer text-left font-semibold text-foreground'
                : 'cursor-pointer text-left transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60'
            }
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
