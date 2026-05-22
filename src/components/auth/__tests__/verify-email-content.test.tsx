import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderWithProviders } from '@/test/utils';

const mockUseActionToken = jest.fn();

jest.mock('@/hooks/use-action-token', () => ({
  useActionToken: () => mockUseActionToken(),
}));

jest.mock('@/services/auth.service', () => ({
  verifyEmail: jest.fn(),
}));

import {
  VERIFY_EMAIL_ACTION_TIMEOUT_MS,
  VerifyEmailContent,
} from '@/components/auth/verify-email-content';
import { verifyEmail } from '@/services/auth.service';

describe('VerifyEmailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockUseActionToken.mockReturnValue({
      token: '',
      isReady: true,
    });
    (verifyEmail as jest.Mock).mockResolvedValue({
      message: 'Email verified successfully',
    });
  });

  it('triggers verification when a route token is provided', async () => {
    renderWithProviders(<VerifyEmailContent tokenFromRoute="verify-token" />);

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith('verify-token');
    });
  });

  it('shows success instead of staying on the loading state', async () => {
    renderWithProviders(<VerifyEmailContent tokenFromRoute="verify-token" />);

    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/email verified successfully/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/verifying your email/i),
    ).not.toBeInTheDocument();
  });

  it('does not submit the same one-time token twice during a StrictMode remount', async () => {
    renderWithProviders(
      <StrictMode>
        <VerifyEmailContent tokenFromRoute="strict-token" />
      </StrictMode>,
    );

    expect(
      await screen.findByText(/email verified successfully/i),
    ).toBeInTheDocument();
    expect(verifyEmail).toHaveBeenCalledTimes(1);
    expect(verifyEmail).toHaveBeenCalledWith('strict-token');
  });

  it('reuses an in-flight verification when the token page remounts before the response finishes', async () => {
    let resolveVerification: (() => void) | null = null;
    (verifyEmail as jest.Mock).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveVerification = resolve;
      }),
    );

    const firstRender = renderWithProviders(
      <VerifyEmailContent tokenFromRoute="remount-token" />,
    );

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledTimes(1);
    });

    firstRender.unmount();
    renderWithProviders(<VerifyEmailContent tokenFromRoute="remount-token" />);

    expect(verifyEmail).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveVerification?.();
    });

    expect(
      await screen.findByText(/email verified successfully/i),
    ).toBeInTheDocument();
  });

  it('times out a stuck verification request and can retry', async () => {
    jest.useFakeTimers();
    (verifyEmail as jest.Mock)
      .mockReturnValueOnce(new Promise(() => undefined))
      .mockResolvedValueOnce({
        message: 'Email verified successfully',
      });

    renderWithProviders(<VerifyEmailContent tokenFromRoute="verify-token" />);

    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(VERIFY_EMAIL_ACTION_TIMEOUT_MS);
    });

    expect(await screen.findByText(/request timed out/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/email verified successfully/i),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByText(/email verified successfully/i),
    ).toBeInTheDocument();
  });

  it('shows recovery help when no verification token is available', () => {
    renderWithProviders(<VerifyEmailContent />);

    expect(
      screen.getByText(/invalid or missing verification token/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/request a fresh verification email to continue/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request a new link/i })).toHaveAttribute(
      'href',
      '/resend-verification',
    );
  });
});
