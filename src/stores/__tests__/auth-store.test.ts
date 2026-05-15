import { useAuthStore } from '@/stores/auth-store';
import { QueryKey } from '@/constants/query-keys';
import {
  isDevSelfReferentialApiBase,
  setAccessToken,
  warnIfDevApiTargetsFrontend,
} from '@/lib/api';
import { appQueryClient } from '@/lib/query-client';

jest.mock('@/lib/api', () => ({
  setAccessToken: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
  isDevSelfReferentialApiBase: jest.fn(() => false),
  warnIfDevApiTargetsFrontend: jest.fn(),
}));

jest.mock('@/services/auth.service', () => ({
  refreshTokens: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
}));

import {
  getCurrentUser,
  logout as logoutRequest,
  refreshTokens,
} from '@/services/auth.service';

afterEach(() => {
  jest.clearAllMocks();
  appQueryClient.clear();
  document.documentElement.lang = 'en';
  document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
});

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  preferredLanguage: 'en',
  timeZone: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('useAuthStore', () => {
  describe('setAuth', () => {
    it('sets user, token, and isAuthenticated', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token-123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(setAccessToken).toHaveBeenCalledWith('access-token-123');
    });
  });

  describe('logout', () => {
    it('clears user and token', () => {
      useAuthStore.getState().setAuth(mockUser, 'token');
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(setAccessToken).toHaveBeenLastCalledWith(null);
    });

    it('removes cached user data while preserving mutation status', () => {
      appQueryClient.setQueryData([QueryKey.AuthMe], mockUser);
      const mutation = appQueryClient.getMutationCache().build(appQueryClient, {
        mutationFn: async () => 'done',
      });

      useAuthStore.getState().logout();

      expect(appQueryClient.getQueryData([QueryKey.AuthMe])).toBeUndefined();
      expect(appQueryClient.getMutationCache().getAll()).toContain(mutation);
    });
  });

  describe('hydrate', () => {
    it('refreshes token and fetches user on success', async () => {
      (refreshTokens as jest.Mock).mockResolvedValue({
        accessToken: 'new-token',
      });
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const localeChanged = await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(setAccessToken).toHaveBeenCalledWith('new-token');
      expect(localeChanged).toBe(false);
    });

    it('returns localeChanged when the hydrated user language differs', async () => {
      document.documentElement.lang = 'en';
      (refreshTokens as jest.Mock).mockResolvedValue({
        accessToken: 'new-token',
      });
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        preferredLanguage: 'sv',
      });

      const localeChanged = await useAuthStore.getState().hydrate();

      expect(localeChanged).toBe(true);
      expect(document.documentElement.lang).toBe('sv');
    });

    it('clears state on refresh failure', async () => {
      (refreshTokens as jest.Mock).mockRejectedValue(
        new Error('No session'),
      );

      const localeChanged = await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(setAccessToken).toHaveBeenLastCalledWith(null);
      expect(localeChanged).toBe(false);
    });

    it('clears state when the refreshed user has not verified email', async () => {
      (refreshTokens as jest.Mock).mockResolvedValue({
        accessToken: 'new-token',
      });
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      (logoutRequest as jest.Mock).mockResolvedValue(undefined);

      const localeChanged = await useAuthStore.getState().hydrate();

      expect(logoutRequest).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(setAccessToken).toHaveBeenLastCalledWith(null);
      expect(localeChanged).toBe(false);
    });

    it('fails safe when the API base points to the frontend dev origin', async () => {
      (isDevSelfReferentialApiBase as jest.Mock).mockReturnValue(true);

      const localeChanged = await useAuthStore.getState().hydrate();

      expect(warnIfDevApiTargetsFrontend).toHaveBeenCalled();
      expect(refreshTokens).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(localeChanged).toBe(false);
    });
  });
});
