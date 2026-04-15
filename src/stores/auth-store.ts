'use client';

import { create } from 'zustand';
import {
  isDevSelfReferentialApiBase,
  setAccessToken,
  setUnauthorizedHandler,
  warnIfDevApiTargetsFrontend,
} from '@/lib/api';
import { appQueryClient } from '@/lib/query-client';
import { persistLocalePreference } from '@/i18n/config';
import * as authService from '@/services/auth.service';
import type { User } from '@/types/auth';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
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

  logout: () => {
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
      return;
    }

    try {
      const { accessToken } = await authService.refreshTokens();
      setAccessToken(accessToken);

      const user = await authService.getCurrentUser();

      if (!user.emailVerified) {
        await authService.logout().catch(() => undefined);
        setAccessToken(null);
        appQueryClient.clear();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      persistLocalePreference(user.preferredLanguage);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      appQueryClient.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
