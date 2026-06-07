import { setClientCookie } from '@/lib/client-cookie';

export const locales = ['en', 'sv', 'es'] as const;
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

export function normalizeLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function persistLocalePreference(locale: string): void {
  if (typeof document === 'undefined' || !isLocale(locale)) {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  setClientCookie(LOCALE_COOKIE, locale, { maxAge });
  document.documentElement.lang = locale;
}

function readLocaleCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  for (const cookie of document.cookie.split('; ')) {
    const [rawName, rawValue] = cookie.split('=');

    if (decodeURIComponent(rawName ?? '') !== LOCALE_COOKIE) {
      continue;
    }

    return decodeURIComponent(rawValue ?? '');
  }

  return null;
}

export function getPreferredLocale(): Locale {
  if (typeof document === 'undefined') {
    return defaultLocale;
  }

  const documentLocale = document.documentElement.lang;
  if (isLocale(documentLocale)) {
    return documentLocale;
  }

  const cookieLocale = readLocaleCookie();
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return defaultLocale;
}
