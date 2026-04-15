import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useActiveSessions,
} from '@/hooks/use-auth';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  preferredLanguage: 'en',
  createdAt: '2024-01-01T00:00:00.000Z',
};

jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
  register: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  getActiveSessions: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerification: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

import * as authService from '@/services/auth.service';

afterEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useLogin', () => {
  it('logs in and sets auth store', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      accessToken: 'mock-token',
      user: mockUser,
    });

    const { result } = renderHookWithProviders(() => useLogin());

    await act(async () => {
      await result.current.mutateAsync({
        email: 'test@example.com',
        password: 'TestPass1',
      });
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'TestPass1',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe(mockUser.email);
  });

  it('rejects invalid credentials', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials'),
    );

    const { result } = renderHookWithProviders(() => useLogin());

    await expect(
      act(() =>
        result.current.mutateAsync({
          email: 'test@example.com',
          password: 'wrong',
        }),
      ),
    ).rejects.toThrow('Invalid credentials');
  });
});

describe('useRegister', () => {
  it('registers and sets auth store', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      accessToken: 'mock-token',
      user: mockUser,
    });

    const { result } = renderHookWithProviders(() => useRegister());

    await act(async () => {
      await result.current.mutateAsync({
        email: 'test@example.com',
        password: 'TestPass1',
        firstName: 'Test',
        lastName: 'User',
        preferredLanguage: 'en',
        termsAccepted: true,
        privacyPolicyAccepted: true,
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe(mockUser.email);
  });
});

describe('useLogout', () => {
  it('logs out and clears auth store', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useLogout());

    await act(async () => {
      await result.current.mutateAsync();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('clears store even on logout error', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    (authService.logout as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHookWithProviders(() => useLogout());

    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch {
        // expected
      }
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('useResendVerification', () => {
  it('resends verification email', async () => {
    (authService.resendVerification as jest.Mock).mockResolvedValue({
      message: 'Sent',
    });

    const { result } = renderHookWithProviders(() => useResendVerification());

    await act(async () => {
      await result.current.mutateAsync('test@example.com');
    });

    expect(authService.resendVerification).toHaveBeenCalledWith(
      'test@example.com',
    );
  });
});

describe('useCurrentUser', () => {
  it('fetches user when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHookWithProviders(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.email).toBe(mockUser.email);
  });

  it('does not fetch when unauthenticated', () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { result } = renderHookWithProviders(() => useCurrentUser());

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useActiveSessions', () => {
  it('fetches sessions when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (authService.getActiveSessions as jest.Mock).mockResolvedValue([
      { id: 'session-1', userAgent: 'test', ipAddress: '127.0.0.1' },
    ]);

    const { result } = renderHookWithProviders(() => useActiveSessions());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });
});

describe('useVerifyEmail', () => {
  it('verifies email', async () => {
    (authService.verifyEmail as jest.Mock).mockResolvedValue({
      message: 'Verified',
    });

    const { result } = renderHookWithProviders(() => useVerifyEmail());

    await act(async () => {
      await result.current.mutateAsync('valid-token');
    });

    expect(authService.verifyEmail).toHaveBeenCalledWith('valid-token');
  });
});

describe('useForgotPassword', () => {
  it('sends forgot password', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      message: 'Sent',
    });

    const { result } = renderHookWithProviders(() => useForgotPassword());

    await act(async () => {
      await result.current.mutateAsync('test@example.com');
    });

    expect(authService.forgotPassword).toHaveBeenCalledWith(
      'test@example.com',
    );
  });
});

describe('useResetPassword', () => {
  it('resets password', async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValue({
      message: 'Reset',
    });

    const { result } = renderHookWithProviders(() => useResetPassword());

    await act(async () => {
      await result.current.mutateAsync({
        token: 'token',
        newPassword: 'NewPass1!',
      });
    });

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'token',
      newPassword: 'NewPass1!',
    });
  });
});
