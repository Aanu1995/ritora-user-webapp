export const THEME_PREFERENCE_STORAGE_KEY = 'ritora-theme-preference';
export const THEME_PREFERENCE_COOKIE_NAME = 'ritora-theme-preference';
export const PLAIN_LANGUAGE_STORAGE_KEY = 'ritora-plain-language-mode';
export const APP_PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;

export enum ThemePreference {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
}

export enum ResolvedTheme {
  Light = 'light',
  Dark = 'dark',
}

const THEME_PREFERENCE_VALUES = new Set<string>(Object.values(ThemePreference));
const RESOLVED_THEME_VALUES = new Set<string>(Object.values(ResolvedTheme));

export function parseThemePreference(
  value: string | null | undefined,
): ThemePreference | null {
  if (value && THEME_PREFERENCE_VALUES.has(value)) {
    return value as ThemePreference;
  }

  return null;
}

export function parseResolvedTheme(
  value: string | null | undefined,
): ResolvedTheme | null {
  if (value && RESOLVED_THEME_VALUES.has(value)) {
    return value as ResolvedTheme;
  }

  return null;
}

export function resolveThemePreference(
  themePreference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  if (themePreference === ThemePreference.System) {
    return systemTheme;
  }

  return themePreference === ThemePreference.Dark
    ? ResolvedTheme.Dark
    : ResolvedTheme.Light;
}

export function getThemeInitializationScript(): string {
  const systemPreference = JSON.stringify(ThemePreference.System);
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
            themePreference = systemPreference;
          }
        }

        const resolvedTheme =
          themePreference === systemPreference
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? darkPreference
              : lightPreference
            : themePreference;

        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.style.colorScheme = resolvedTheme;
      } catch {}
    })();
  `.trim();
}
