import { act, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api-error';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useLogoutAll,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useActiveSessions,
  useUpdateProfile,
  useUpdatePreferredLanguage,
  useUpdateTimeZone,
} from '@/hooks/use-auth';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  preferredLanguage: 'en',
  timeZone: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
  register: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
  logoutAll: jest.fn(),
  getCurrentUser: jest.fn(),
  getActiveSessions: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerification: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  updatePreferredLanguage: jest.fn(),
  updateTimeZone: jest.fn(),
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
  it('registers without authenticating the user or forcing logout', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      message: 'Verification email sent',
      user: { ...mockUser, emailVerified: false },
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
    expect(authService.logout).not.toHaveBeenCalled();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('clears a legacy session if registration still returns an access token', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      accessToken: 'mock-token',
      user: { ...mockUser, emailVerified: false },
    });
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

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

    expect(authService.logout).toHaveBeenCalled();
  });
});

describe('useLogin', () => {
  it('rejects unverified users and clears any pending session', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      accessToken: 'mock-token',
      user: { ...mockUser, emailVerified: false },
    });
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useLogin());

    let error: unknown;

    await act(async () => {
      try {
        await result.current.mutateAsync({
          email: 'test@example.com',
          password: 'TestPass1',
        });
      } catch (caughtError) {
        error = caughtError;
      }
    });

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).body?.code).toBe('EMAIL_NOT_VERIFIED');
    expect(authService.logout).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
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

describe('useLogoutAll', () => {
  it('logs out all devices and clears auth store', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    (authService.logoutAll as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useLogoutAll());

    await act(async () => {
      await result.current.mutateAsync();
    });

    const state = useAuthStore.getState();
    expect(authService.logoutAll).toHaveBeenCalled();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('keeps auth state when logoutAll fails', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    (authService.logoutAll as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHookWithProviders(() => useLogoutAll());

    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch {
        // expected
      }
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
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

describe('useUpdateProfile', () => {
  it('updates the current user in the auth store', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    document.documentElement.lang = 'sv';
    (authService.updateProfile as jest.Mock).mockResolvedValue({
      ...mockUser,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const { result } = renderHookWithProviders(() => useUpdateProfile());

    await act(async () => {
      await result.current.mutateAsync({
        firstName: 'Ada',
        lastName: 'Lovelace',
      });
    });

    expect(authService.updateProfile).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(useAuthStore.getState().user?.firstName).toBe('Ada');
    expect(useAuthStore.getState().user?.lastName).toBe('Lovelace');
    expect(document.documentElement.lang).toBe('sv');
  });
});

describe('useUpdatePreferredLanguage', () => {
  it('updates the current user language in the auth store', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    document.documentElement.lang = 'en';
    (authService.updatePreferredLanguage as jest.Mock).mockResolvedValue({
      ...mockUser,
      preferredLanguage: 'sv',
    });

    const { result } = renderHookWithProviders(() =>
      useUpdatePreferredLanguage(),
    );

    await act(async () => {
      await result.current.mutateAsync({
        preferredLanguage: 'sv',
      });
    });

    expect(authService.updatePreferredLanguage).toHaveBeenCalledWith({
      preferredLanguage: 'sv',
    });
    expect(useAuthStore.getState().user?.preferredLanguage).toBe('sv');
    expect(document.documentElement.lang).toBe('sv');
  });
});

describe('useUpdateTimeZone', () => {
  it('updates the current user timezone in the auth store', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    (authService.updateTimeZone as jest.Mock).mockResolvedValue({
      ...mockUser,
      timeZone: 'Europe/Stockholm',
    });

    const { result } = renderHookWithProviders(() => useUpdateTimeZone());

    await act(async () => {
      await result.current.mutateAsync({
        timeZone: 'Europe/Stockholm',
      });
    });

    expect(authService.updateTimeZone).toHaveBeenCalledWith({
      timeZone: 'Europe/Stockholm',
    });
    expect(useAuthStore.getState().user?.timeZone).toBe('Europe/Stockholm');
  });
});
