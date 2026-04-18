'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  APP_PREFERENCE_MAX_AGE,
  PLAIN_LANGUAGE_STORAGE_KEY,
  ResolvedTheme,
  THEME_PREFERENCE_COOKIE_NAME,
  THEME_PREFERENCE_STORAGE_KEY,
  ThemePreference,
  parseResolvedTheme,
  parseThemePreference,
  resolveThemePreference,
} from '@/lib/theme-preferences';
import { setClientCookie } from '@/lib/client-cookie';

export { ResolvedTheme, ThemePreference } from '@/lib/theme-preferences';

type AppPreferencesContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  plainLanguageMode: boolean;
  setThemePreference: (value: ThemePreference) => void;
  setPlainLanguageMode: (value: boolean) => void;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return ResolvedTheme.Dark;
  }

  return ResolvedTheme.Light;
}

function applyThemeToDocument(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

interface AppPreferencesProviderProps {
  children: ReactNode;
  initialThemePreference?: ThemePreference | null;
}

export function AppPreferencesProvider({
  children,
  initialThemePreference = null,
}: AppPreferencesProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => {
      if (initialThemePreference) {
        return initialThemePreference;
      }

      if (typeof window === 'undefined') {
        return ThemePreference.System;
      }

      return (
        parseThemePreference(
          window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY),
        ) ?? ThemePreference.System
      );
    },
  );
  const [plainLanguageMode, setPlainLanguageModeState] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(PLAIN_LANGUAGE_STORAGE_KEY) === 'true';
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof document !== 'undefined') {
      return (
        parseResolvedTheme(document.documentElement.dataset.theme) ??
        getSystemTheme()
      );
    }

    return ResolvedTheme.Light;
  });

  const resolvedTheme = useMemo(
    () => resolveThemePreference(themePreference, systemTheme),
    [systemTheme, themePreference],
  );

  useLayoutEffect(() => {
    applyThemeToDocument(resolvedTheme);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        THEME_PREFERENCE_STORAGE_KEY,
        themePreference,
      );
      setClientCookie(THEME_PREFERENCE_COOKIE_NAME, themePreference, {
        maxAge: APP_PREFERENCE_MAX_AGE,
      });
    }
  }, [resolvedTheme, themePreference]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      PLAIN_LANGUAGE_STORAGE_KEY,
      String(plainLanguageMode),
    );
  }, [plainLanguageMode]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      themePreference !== ThemePreference.System
    ) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? ResolvedTheme.Dark : ResolvedTheme.Light);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themePreference]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      themePreference,
      resolvedTheme,
      plainLanguageMode,
      setThemePreference: setThemePreferenceState,
      setPlainLanguageMode: setPlainLanguageModeState,
    }),
    [plainLanguageMode, resolvedTheme, themePreference],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences(): AppPreferencesContextValue {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error(
      'useAppPreferences must be used within an AppPreferencesProvider',
    );
  }

  return context;
}
