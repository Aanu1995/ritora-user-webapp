import { act, screen, waitFor } from '@testing-library/react';
import {
  ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS,
  AccountDeletionTokenContent,
} from '@/components/auth/account-deletion-token-content';
import { renderWithProviders } from '@/test/utils';
import { AccountDeletionTokenMode } from '@/types/auth';

const mockUseActionToken = jest.fn();
const mockConfirmMutate = jest.fn();
const mockCancelMutate = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

let confirmState = {
  isPending: false,
  isSuccess: false,
  error: null as Error | null,
};

let cancelState = {
  isPending: false,
  isSuccess: false,
  error: null as Error | null,
};

jest.mock('@/hooks/use-action-token', () => ({
  useActionToken: () => mockUseActionToken(),
}));

jest.mock('@/hooks/use-auth', () => ({
  useConfirmAccountDeletion: () => ({
    mutate: mockConfirmMutate,
    ...confirmState,
  }),
  useCancelAccountDeletion: () => ({
    mutate: mockCancelMutate,
    ...cancelState,
  }),
}));

describe('AccountDeletionTokenContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    confirmState = {
      isPending: false,
      isSuccess: false,
      error: null,
    };
    cancelState = {
      isPending: false,
      isSuccess: false,
      error: null,
    };
    mockUseActionToken.mockReturnValue({
      token: '',
      isReady: true,
    });
  });

  it('confirms OAuth-only deletion with a route token', async () => {
    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Confirm}
        tokenFromRoute="confirm-token"
      />,
    );

    await waitFor(() => {
      expect(mockConfirmMutate).toHaveBeenCalledWith('confirm-token');
    });
  });

  it('cancels scheduled deletion with a route token', async () => {
    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    await waitFor(() => {
      expect(mockCancelMutate).toHaveBeenCalledWith('cancel-token');
    });
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
  });

  it('shows success copy after confirmation succeeds', () => {
    confirmState = {
      isPending: false,
      isSuccess: true,
      error: null,
    };

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Confirm}
        tokenFromRoute="confirm-token"
      />,
    );

    expect(screen.getByText(/deletion scheduled/i)).toBeInTheDocument();
    expect(
      screen.getByText(/scheduled to be permanently deleted in 30 days/i),
    ).toBeInTheDocument();
  });

  it('shows success copy after cancellation succeeds', () => {
    cancelState = {
      isPending: false,
      isSuccess: true,
      error: null,
    };

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    expect(
      screen.getByText(/your account is staying active/i),
    ).toBeInTheDocument();
  });

  it('redirects to login after cancellation succeeds', async () => {
    jest.useFakeTimers();
    cancelState = {
      isPending: false,
      isSuccess: true,
      error: null,
    };

    renderWithProviders(
      <AccountDeletionTokenContent
        mode={AccountDeletionTokenMode.Cancel}
        tokenFromRoute="cancel-token"
      />,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(
        ACCOUNT_DELETION_SUCCESS_REDIRECT_DELAY_MS,
      );
    });

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
