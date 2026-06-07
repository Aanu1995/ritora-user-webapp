'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  APP_PREFERENCE_MAX_AGE,
  DEFAULT_THEME_PREFERENCE,
  PLAIN_LANGUAGE_STORAGE_KEY,
  ResolvedTheme,
  THEME_PREFERENCE_COOKIE_NAME,
  THEME_PREFERENCE_STORAGE_KEY,
  ThemePreference,
  normalizeThemePreference,
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
        return normalizeThemePreference(initialThemePreference);
      }

      if (typeof window === 'undefined') {
        return DEFAULT_THEME_PREFERENCE;
      }

      return normalizeThemePreference(
        parseThemePreference(
          window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY),
        ),
      );
    },
  );
  const [plainLanguageMode, setPlainLanguageModeState] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(PLAIN_LANGUAGE_STORAGE_KEY) === 'true';
  });
  const resolvedTheme = useMemo(
    () => resolveThemePreference(themePreference),
    [themePreference],
  );
  const setThemePreference = useCallback((value: ThemePreference) => {
    setThemePreferenceState(normalizeThemePreference(value));
  }, []);

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

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      themePreference,
      resolvedTheme,
      plainLanguageMode,
      setThemePreference,
      setPlainLanguageMode: setPlainLanguageModeState,
    }),
    [plainLanguageMode, resolvedTheme, setThemePreference, themePreference],
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
