import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { navigateToUrl } from '@/lib/browser-navigation';
import { resolvePostLoginRoute } from '@/lib/post-login-route';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockMutate = jest.fn();

type MutationCallbacks = {
  onSuccess?: (...args: unknown[]) => void;
  onError?: (...args: unknown[]) => void;
};

let mockLoginReturn: {
  mutate: jest.Mock;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

jest.mock('@/hooks/use-auth', () => ({
  useLogin: () => mockLoginReturn,
}));

jest.mock('@/lib/post-login-route', () => ({
  resolvePostLoginRoute: jest.fn(),
}));

jest.mock('@/lib/browser-navigation', () => ({
  navigateToUrl: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => AppRoute.Login,
  useSearchParams: () => new URLSearchParams(),
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (resolvePostLoginRoute as jest.Mock).mockResolvedValue(AppRoute.SkinProfile);
    mockLoginReturn = {
      mutate: mockMutate,
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
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          password: 'TestPass1',
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it('navigates to skin profile on success when setup is still needed', async () => {
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onSuccess?.({
          accessToken: 'tok',
          user: {
            preferredLanguage: 'en',
          },
        });
      },
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(resolvePostLoginRoute).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(AppRoute.SkinProfile);
      expect(navigateToUrl).not.toHaveBeenCalled();
    });
  });

  it('uses a document navigation when the saved user locale differs', async () => {
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onSuccess?.({
          accessToken: 'tok',
          user: {
            preferredLanguage: 'sv',
          },
        });
      },
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(resolvePostLoginRoute).not.toHaveBeenCalled();
      expect(navigateToUrl).toHaveBeenCalledWith(AppRoute.PostLogin);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('displays friendly error on failed login', async () => {
    const error = new ApiError('Invalid credentials', {
      status: 401,
      body: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      },
    });
    mockLoginReturn.error = error;
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onError?.(error);
      },
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/email or password is incorrect/i),
      ).toBeInTheDocument();
    });
  });

  it('shows resend verification link for unverified email errors', async () => {
    const error = new ApiError('Email not verified', {
      status: 403,
      body: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email not verified',
      },
    });
    mockLoginReturn.error = error;
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onError?.(error);
      },
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /resend verification email/i }),
      ).toHaveAttribute(
        'href',
        '/resend-verification?email=test%40example.com',
      );
    });
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

  it('passes implicit consent context when starting Google OAuth', async () => {
    renderWithProviders(<LoginPage />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );

    expect(navigateToUrl).toHaveBeenCalledWith(
      expect.stringContaining('termsAccepted=true'),
    );
    expect(navigateToUrl).toHaveBeenCalledWith(
      expect.stringContaining('privacyPolicyAccepted=true'),
    );
  });

  it('passes implicit consent context when starting Apple OAuth', async () => {
    renderWithProviders(<LoginPage />);

    await user.click(
      screen.getByRole('button', { name: /continue with apple/i }),
    );

    expect(navigateToUrl).toHaveBeenCalledWith(
      expect.stringContaining('termsAccepted=true'),
    );
    expect(navigateToUrl).toHaveBeenCalledWith(
      expect.stringContaining('privacyPolicyAccepted=true'),
    );
  });

  it('has link to register', () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole('link', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('does not navigate when login fails', async () => {
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onError?.(new Error('Login failed'));
      },
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
