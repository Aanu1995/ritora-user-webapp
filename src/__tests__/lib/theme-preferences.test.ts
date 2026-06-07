import {
  THEME_PREFERENCE_COOKIE_NAME,
  THEME_PREFERENCE_STORAGE_KEY,
  getThemeInitializationScript,
} from '@/lib/theme-preferences';

describe('theme initialization', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
    document.cookie = `${THEME_PREFERENCE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it('defaults a new browser to light before hydration', () => {
    window.eval(getThemeInitializationScript());

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('applies the saved browser preference before hydration', () => {
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, 'dark');

    window.eval(getThemeInitializationScript());

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('migrates legacy system preference to light before hydration', () => {
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, 'system');

    window.eval(getThemeInitializationScript());

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('prefers the cookie value over stale local storage', () => {
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, 'light');
    document.cookie = `${THEME_PREFERENCE_COOKIE_NAME}=dark; path=/`;

    window.eval(getThemeInitializationScript());

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
