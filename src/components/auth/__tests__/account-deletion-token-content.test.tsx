import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import {
  ACCOUNT_DELETION_TOKEN_ACTION_TIMEOUT_MS,
  ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS,
  AccountDeletionTokenContent,
} from '@/components/auth/account-deletion-token-content';
import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import { AccountDeletionTokenMode } from '@/types/auth';

const mockUseActionToken = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/hooks/use-action-token', () => ({
  useActionToken: () => mockUseActionToken(),
}));

jest.mock('@/services/auth.service', () => ({
  cancelAccountDeletion: jest.fn(),
  confirmAccountDeletion: jest.fn(),
}));

import {
  cancelAccountDeletion,
  confirmAccountDeletion,
} from '@/services/auth.service';

describe('AccountDeletionTokenContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseActionToken.mockReturnValue({
      token: '',
      isReady: true,
    });
  });

  it('confirms OAuth-only deletion with a route token', async () => {
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

    await waitFor(() => {
      expect(confirmAccountDeletion).toHaveBeenCalledWith('confirm-token');
    });
    expect(await screen.findByText(/deletion scheduled/i)).toBeInTheDocument();
  });

  it('cancels scheduled deletion with a route token', async () => {
    (cancelAccountDeletion as jest.Mock).mockResolvedValue({
      message: 'Account deletion has been cancelled',
    });

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    await waitFor(() => {
      expect(cancelAccountDeletion).toHaveBeenCalledWith('cancel-token');
    });
    expect(
      await screen.findByText(/your account is staying active/i),
    ).toBeInTheDocument();
  });

  it('shows recovery copy when a token is missing', () => {
    renderWithProviders(
      <AccountDeletionTokenContent mode={AccountDeletionTokenMode.Cancel} />,
    );

    expect(
      screen.getByText(/missing, expired, or already used/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /sign in to my account/i }),
    ).toHaveAttribute('href', '/login');
    expect(cancelAccountDeletion).not.toHaveBeenCalled();
    expect(confirmAccountDeletion).not.toHaveBeenCalled();
  });

  it('shows success copy after confirmation succeeds', async () => {
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

    expect(await screen.findByText(/deletion scheduled/i)).toBeInTheDocument();
    expect(
      screen.getByText(/scheduled to be permanently deleted in 30 days/i),
    ).toBeInTheDocument();
  });

  it('does not submit the same one-time confirmation token twice during a StrictMode remount', async () => {
    (confirmAccountDeletion as jest.Mock).mockResolvedValue({
      status: 'scheduled',
      message: 'Account deletion scheduled',
    });

    renderWithProviders(
      <StrictMode>
        <AccountDeletionTokenContent
          mode={AccountDeletionTokenMode.Confirm}
          tokenFromRoute="strict-confirm-token"
        />
      </StrictMode>,
    );

    expect(await screen.findByText(/deletion scheduled/i)).toBeInTheDocument();
    expect(confirmAccountDeletion).toHaveBeenCalledTimes(1);
    expect(confirmAccountDeletion).toHaveBeenCalledWith(
      'strict-confirm-token',
    );
  });

  it('reuses an in-flight confirmation when the token page remounts before the response finishes', async () => {
    let resolveConfirmation:
      | ((value: { status: string; message: string }) => void)
      | null = null;
    (confirmAccountDeletion as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveConfirmation = resolve;
      }),
    );

    const firstRender = renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Confirm}
        tokenFromRoute="remount-confirm-token"
      />,
    );

    await waitFor(() => {
      expect(confirmAccountDeletion).toHaveBeenCalledTimes(1);
    });

    firstRender.unmount();
    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Confirm}
        tokenFromRoute="remount-confirm-token"
      />,
    );

    expect(confirmAccountDeletion).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveConfirmation?.({
        status: 'scheduled',
        message: 'Account deletion scheduled',
      });
    });

    expect(await screen.findByText(/deletion scheduled/i)).toBeInTheDocument();
  });

  it('shows success copy after cancellation succeeds', async () => {
    (cancelAccountDeletion as jest.Mock).mockResolvedValue({
      message: 'Account deletion has been cancelled',
    });

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    expect(
      await screen.findByText(/your account is staying active/i),
    ).toBeInTheDocument();
  });

  it('redirects to login after cancellation succeeds', async () => {
    jest.useFakeTimers();
    (cancelAccountDeletion as jest.Mock).mockResolvedValue({
      message: 'Account deletion has been cancelled',
    });

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    expect(
      await screen.findByText(/your account is staying active/i),
    ).toBeInTheDocument();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(
        ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS,
      );
    });

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('clears local auth state after the token action succeeds', async () => {
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

    expect(
      await screen.findByText(/your account is staying active/i),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('shows an actionable error when the token request fails', async () => {
    (confirmAccountDeletion as jest.Mock).mockRejectedValue(
      new ApiError('Invalid account deletion token', { status: 400 }),
    );

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Confirm}
        tokenFromRoute="confirm-token"
      />,
    );

    expect(
      await screen.findByText(/invalid account deletion token/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it('times out a stuck request and retries without claiming success', async () => {
    jest.useFakeTimers();
    (cancelAccountDeletion as jest.Mock)
      .mockReturnValueOnce(new Promise(() => undefined))
      .mockResolvedValueOnce({
        message: 'Account deletion has been cancelled',
      });

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    expect(screen.getByText(/stopping your deletion/i)).toBeInTheDocument();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(
        ACCOUNT_DELETION_TOKEN_ACTION_TIMEOUT_MS,
      );
    });

    expect(await screen.findByText(/request timed out/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/your account is staying active/i),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(cancelAccountDeletion).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByText(/your account is staying active/i),
    ).toBeInTheDocument();
  });
});
