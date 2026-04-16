import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';

const mockUseActionToken = jest.fn();
const mockMutate = jest.fn();

jest.mock('@/hooks/use-action-token', () => ({
  useActionToken: () => mockUseActionToken(),
}));

jest.mock('@/hooks/use-auth', () => ({
  useResetPassword: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

import { ResetPasswordContent } from '@/components/auth/reset-password-content';

describe('ResetPasswordContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionToken.mockReturnValue({
      token: '',
      isReady: true,
    });
  });

  it('renders the password form when a token is provided from the route', () => {
    renderWithProviders(<ResetPasswordContent tokenFromRoute="route-token" />);

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows a recovery path when no reset token is available', () => {
    renderWithProviders(<ResetPasswordContent />);

    expect(
      screen.getByText(/invalid or missing reset token/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/request a fresh reset email to continue/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request a new link/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
