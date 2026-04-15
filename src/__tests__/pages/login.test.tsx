import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockMutateAsync = jest.fn();

let mockLoginReturn: {
  mutateAsync: jest.Mock;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

jest.mock('@/hooks/use-auth', () => ({
  useLogin: () => mockLoginReturn,
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

import LoginPage from '@/app/[locale]/(auth)/login/page';

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginReturn = {
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    };
  });

  it('renders login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
  });

  it('submits form with email and password', async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass1',
      });
    });
  });

  it('navigates to dashboard on success', async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error on failed login', () => {
    const error = new Error('Invalid credentials');
    (error as any).body = { message: 'Invalid credentials' };

    mockLoginReturn = {
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: true,
      error,
    };

    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has link to forgot password', () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole('link', { name: /forgot password/i }),
    ).toBeInTheDocument();
  });

  it('has link to register', () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole('link', { name: /create an account/i }),
    ).toBeInTheDocument();
  });
});
