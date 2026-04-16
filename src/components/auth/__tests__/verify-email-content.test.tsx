import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';

const mockUseActionToken = jest.fn();
const mockMutate = jest.fn();

jest.mock('@/hooks/use-action-token', () => ({
  useActionToken: () => mockUseActionToken(),
}));

jest.mock('@/hooks/use-auth', () => ({
  useVerifyEmail: () => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    error: null,
  }),
}));

import { VerifyEmailContent } from '@/components/auth/verify-email-content';

describe('VerifyEmailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionToken.mockReturnValue({
      token: '',
      isReady: true,
    });
  });

  it('triggers verification when a route token is provided', async () => {
    renderWithProviders(<VerifyEmailContent tokenFromRoute="verify-token" />);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('verify-token');
    });
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
