export const THEME_PREFERENCE_STORAGE_KEY = 'ritora-theme-preference';
export const THEME_PREFERENCE_COOKIE_NAME = 'ritora-theme-preference';
export const PLAIN_LANGUAGE_STORAGE_KEY = 'ritora-plain-language-mode';
export const APP_PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export function parseThemePreference(
  value: string | null | undefined,
): ThemePreference | null {
  if (value === 'system' || value === 'light' || value === 'dark') {
    return value;
  }

  return null;
}

export function parseResolvedTheme(
  value: string | null | undefined,
): ResolvedTheme | null {
  if (value === 'light' || value === 'dark') {
    return value;
  }

  return null;
}

export function resolveThemePreference(
  themePreference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  return themePreference === 'system' ? systemTheme : themePreference;
}

export function getThemeInitializationScript(): string {
  return `
    (() => {
      try {
        const storageKey = ${JSON.stringify(THEME_PREFERENCE_STORAGE_KEY)};
        const cookieName = ${JSON.stringify(THEME_PREFERENCE_COOKIE_NAME)};
        const cookiePrefix = \`\${cookieName}=\`;

        let themePreference = null;

        for (const cookie of document.cookie.split('; ')) {
          if (cookie.startsWith(cookiePrefix)) {
            themePreference = decodeURIComponent(cookie.slice(cookiePrefix.length));
            break;
          }
        }

        if (
          themePreference !== 'system' &&
          themePreference !== 'light' &&
          themePreference !== 'dark'
        ) {
          const storedTheme = window.localStorage.getItem(storageKey);

          if (
            storedTheme === 'system' ||
            storedTheme === 'light' ||
            storedTheme === 'dark'
          ) {
            themePreference = storedTheme;
          } else {
            themePreference = 'system';
          }
        }

        const resolvedTheme =
          themePreference === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : themePreference;

        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.style.colorScheme = resolvedTheme;
      } catch {}
    })();
  `.trim();
}
