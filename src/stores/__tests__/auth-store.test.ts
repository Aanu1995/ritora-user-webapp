import { useAuthStore } from '@/stores/auth-store';
import * as api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  setAccessToken: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

jest.mock('@/services/auth.service', () => ({
  refreshTokens: jest.fn(),
  getCurrentUser: jest.fn(),
}));

import * as authService from '@/services/auth.service';

afterEach(() => {
  jest.clearAllMocks();
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
      expect(api.setAccessToken).toHaveBeenCalledWith('access-token-123');
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
      expect(api.setAccessToken).toHaveBeenLastCalledWith(null);
    });
  });

  describe('hydrate', () => {
    it('refreshes token and fetches user on success', async () => {
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        accessToken: 'new-token',
      });
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(api.setAccessToken).toHaveBeenCalledWith('new-token');
    });

    it('clears state on refresh failure', async () => {
      (authService.refreshTokens as jest.Mock).mockRejectedValue(
        new Error('No session'),
      );

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(api.setAccessToken).toHaveBeenLastCalledWith(null);
    });
  });
});
