import { setClientCookie } from '@/lib/client-cookie';

export const locales = ['en', 'sv'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/**
 * Name of the HTTP cookie Ritora uses to persist the visitor's preferred
 * locale. Read server-side via `cookies()` in `src/i18n/request.ts` and
 * written client-side from the language switcher. Kept in this file so both
 * runtime and build-time code reference a single source of truth.
 */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function persistLocalePreference(locale: string): void {
  if (typeof document === 'undefined' || !isLocale(locale)) {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  setClientCookie(LOCALE_COOKIE, locale, { maxAge });
  document.documentElement.lang = locale;
}
