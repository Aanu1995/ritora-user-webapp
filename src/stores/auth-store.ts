'use client';

import { create } from 'zustand';
import { setAccessToken, setUnauthorizedHandler } from '@/lib/api';
import { appQueryClient } from '@/lib/query-client';
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
    setAccessToken(accessToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    setAccessToken(null);
    appQueryClient.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: async () => {
    try {
      const { accessToken } = await authService.refreshTokens();
      setAccessToken(accessToken);

      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
