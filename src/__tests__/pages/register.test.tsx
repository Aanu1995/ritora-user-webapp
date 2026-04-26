import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockMutate = jest.fn();

type MutationCallbacks = {
  onSuccess?: (...args: unknown[]) => void;
  onError?: (...args: unknown[]) => void;
};

let mockRegisterReturn: {
  mutate: jest.Mock;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

jest.mock('@/hooks/use-auth', () => ({
  useRegister: () => mockRegisterReturn,
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
  usePathname: () => AppRoute.Register,
  useSearchParams: () => new URLSearchParams(),
}));

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterPage', () => {
  const user = userEvent.setup();

  function fillRegistrationForm() {
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'TestPass1' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'TestPass1' },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegisterReturn = {
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    };
  });

  it('renders registration form', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/preferred language/i),
    ).not.toBeInTheDocument();
  });

  it('shows password validation hint for weak password', async () => {
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/^password$/i), 'weak');

    await waitFor(() => {
      expect(
        screen.getByText(/at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it('shows mismatch error when passwords differ', async () => {
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Different1');

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('submit button is disabled without consent', () => {
    renderWithProviders(<RegisterPage />);
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeDisabled();
  });

  it('submits with all fields filled and consent given', async () => {
    renderWithProviders(<RegisterPage />);

    fillRegistrationForm();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // terms
    await user.click(checkboxes[1]); // privacy

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          password: 'TestPass1',
          firstName: 'Test',
          lastName: 'User',
          preferredLanguage: 'en',
          termsAccepted: true,
          privacyPolicyAccepted: true,
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it('shows email verification instructions on success', async () => {
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onSuccess?.();
      },
    );

    renderWithProviders(<RegisterPage />);

    fillRegistrationForm();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/verify email/i)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.getByText(/you'll be able to log in after verifying your email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /resend verification email/i }),
    ).toHaveAttribute(
      'href',
      '/resend-verification?email=test%40example.com',
    );
  });

  it('has link to login', () => {
    renderWithProviders(<RegisterPage />);
    expect(
      screen.getByRole('link', { name: /log in/i }),
    ).toBeInTheDocument();
  });

  it('has links to terms and privacy policy', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });

  it('does not navigate when registration fails', async () => {
    mockMutate.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onError?.(
          new ApiError('Email already in use', {
            status: 409,
            body: {
              code: 'EMAIL_IN_USE',
              message: 'Email already in use',
            },
          }),
        );
      },
    );

    renderWithProviders(<RegisterPage />);

    fillRegistrationForm();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
    expect(
      screen.getByText(/account with this email already exists/i),
    ).toBeInTheDocument();
  });
});
