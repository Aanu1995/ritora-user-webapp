'use client';

import { create } from 'zustand';
import {
  isDevSelfReferentialApiBase,
  setAccessToken,
  setUnauthorizedHandler,
  warnIfDevApiTargetsFrontend,
} from '@/lib/api';
import { appQueryClient } from '@/lib/query-client';
import {
  getPreferredLocale,
  normalizeLocale,
  persistLocalePreference,
} from '@/i18n/config';
import { resetPostLoginState } from '@/lib/post-login-route';
import {
  getCurrentUser,
  logout as logoutRequest,
  refreshTokens,
} from '@/services/auth.service';
import type { User } from '@/types/auth';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User, options?: { syncLocale?: boolean }) => void;
  logout: () => void;
  hydrate: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    resetPostLoginState();

    if (!user.emailVerified) {
      setAccessToken(null);
      appQueryClient.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    setAccessToken(accessToken);
    persistLocalePreference(user.preferredLanguage);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setUser: (user, options) => {
    if (options?.syncLocale) {
      persistLocalePreference(user.preferredLanguage);
    }

    set({ user });
  },

  logout: () => {
    resetPostLoginState();
    setAccessToken(null);
    appQueryClient.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: async () => {
    if (isDevSelfReferentialApiBase()) {
      warnIfDevApiTargetsFrontend();
      setAccessToken(null);
      appQueryClient.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }

    try {
      resetPostLoginState();
      const initialLocale = getPreferredLocale();
      const { accessToken } = await refreshTokens();
      setAccessToken(accessToken);

      const user = await getCurrentUser();

      if (!user.emailVerified) {
        await logoutRequest().catch(() => undefined);
        setAccessToken(null);
        appQueryClient.clear();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }

      const preferredLocale = normalizeLocale(user.preferredLanguage);
      persistLocalePreference(preferredLocale);
      set({ user, isAuthenticated: true, isLoading: false });
      return preferredLocale !== initialLocale;
    } catch {
      resetPostLoginState();
      setAccessToken(null);
      appQueryClient.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
