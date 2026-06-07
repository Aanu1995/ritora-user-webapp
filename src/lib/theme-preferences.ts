export const THEME_PREFERENCE_STORAGE_KEY = 'ritora-theme-preference';
export const THEME_PREFERENCE_COOKIE_NAME = 'ritora-theme-preference';
export const PLAIN_LANGUAGE_STORAGE_KEY = 'ritora-plain-language-mode';
export const APP_PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;
const LEGACY_SYSTEM_THEME_PREFERENCE = 'system';

export enum ThemePreference {
  Light = 'light',
  Dark = 'dark',
}

export const DEFAULT_THEME_PREFERENCE = ThemePreference.Light;

export enum ResolvedTheme {
  Light = 'light',
  Dark = 'dark',
}

const THEME_PREFERENCE_VALUES = new Set<string>(Object.values(ThemePreference));

export function parseThemePreference(
  value: string | null | undefined,
): ThemePreference | null {
  if (value && THEME_PREFERENCE_VALUES.has(value)) {
    return value as ThemePreference;
  }

  return null;
}

export function normalizeThemePreference(
  value: ThemePreference | null | undefined,
): ThemePreference {
  return value === ThemePreference.Dark
    ? ThemePreference.Dark
    : DEFAULT_THEME_PREFERENCE;
}

export function resolveThemePreference(
  themePreference: ThemePreference,
): ResolvedTheme {
  return themePreference === ThemePreference.Dark
    ? ResolvedTheme.Dark
    : ResolvedTheme.Light;
}

export function getThemeInitializationScript(): string {
  const systemPreference = JSON.stringify(LEGACY_SYSTEM_THEME_PREFERENCE);
  const lightPreference = JSON.stringify(ThemePreference.Light);
  const darkPreference = JSON.stringify(ThemePreference.Dark);

  return `
    (() => {
      try {
        const storageKey = ${JSON.stringify(THEME_PREFERENCE_STORAGE_KEY)};
        const cookieName = ${JSON.stringify(THEME_PREFERENCE_COOKIE_NAME)};
        const cookiePrefix = \`\${cookieName}=\`;
        const systemPreference = ${systemPreference};
        const lightPreference = ${lightPreference};
        const darkPreference = ${darkPreference};

        let themePreference = null;

        for (const cookie of document.cookie.split('; ')) {
          if (cookie.startsWith(cookiePrefix)) {
            themePreference = decodeURIComponent(cookie.slice(cookiePrefix.length));
            break;
          }
        }

        if (
          themePreference !== systemPreference &&
          themePreference !== lightPreference &&
          themePreference !== darkPreference
        ) {
          const storedTheme = window.localStorage.getItem(storageKey);

          if (
            storedTheme === systemPreference ||
            storedTheme === lightPreference ||
            storedTheme === darkPreference
          ) {
            themePreference = storedTheme;
          } else {
            themePreference = lightPreference;
          }
        }

        const resolvedTheme =
          themePreference === darkPreference ? darkPreference : lightPreference;

        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.style.colorScheme = resolvedTheme;
      } catch {}
    })();
  `.trim();
}
