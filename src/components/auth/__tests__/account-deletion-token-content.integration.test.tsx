import { screen, waitFor } from '@testing-library/react';
import { AccountDeletionTokenContent } from '@/components/auth/account-deletion-token-content';
import { setAccessToken } from '@/lib/api';
import { renderWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import { AccountDeletionTokenMode } from '@/types/auth';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/lib/browser-push', () => ({
  revokeCurrentBrowserPushSubscription: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/auth.service', () => ({
  cancelAccountDeletion: jest.fn(),
  confirmAccountDeletion: jest.fn(),
  getActiveSessions: jest.fn(),
  getCurrentUser: jest.fn(),
  forgotPassword: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  logoutAll: jest.fn(),
  refreshTokens: jest.fn(),
  register: jest.fn(),
  requestAccountDeletion: jest.fn(),
  resendVerification: jest.fn(),
  resetPassword: jest.fn(),
  updatePreferredLanguage: jest.fn(),
  updateProfile: jest.fn(),
  updateTimeZone: jest.fn(),
  verifyEmail: jest.fn(),
}));

import {
  cancelAccountDeletion,
  confirmAccountDeletion,
} from '@/services/auth.service';

afterEach(() => {
  jest.clearAllMocks();
  setAccessToken(null);
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('AccountDeletionTokenContent integration', () => {
  it('leaves the cancellation loading state when the service succeeds', async () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        hasPassword: true,
        preferredLanguage: 'en',
        timeZone: null,
        createdAt: '2026-05-01T00:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
    (cancelAccountDeletion as jest.Mock).mockResolvedValue({
      message: 'Account deletion has been cancelled',
    });

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    expect(screen.getByText(/stopping your deletion/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(cancelAccountDeletion).toHaveBeenCalledWith('cancel-token');
    });
    expect(
      await screen.findByText(/your account is staying active/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/stopping your deletion/i),
    ).not.toBeInTheDocument();
  });

  it('leaves the confirmation loading state when the service succeeds', async () => {
    (confirmAccountDeletion as jest.Mock).mockResolvedValue({
      status: 'scheduled',
      message: 'Account deletion scheduled',
    });

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Confirm}
        tokenFromRoute="confirm-token"
      />,
    );

    expect(screen.getByText(/verifying your link/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(confirmAccountDeletion).toHaveBeenCalledWith('confirm-token');
    });
    expect(await screen.findByText(/deletion scheduled/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/verifying your link/i),
    ).not.toBeInTheDocument();
  });
});
