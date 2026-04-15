import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('@/hooks/use-auth', () => ({
  useRegister: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

import RegisterPage from '@/app/[locale]/(auth)/register/page';

describe('RegisterPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(
      screen.getByText(/at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it('shows mismatch error when passwords differ', async () => {
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Different1');

    // Check consent so the submit button becomes clickable
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click(screen.getByRole('button', { name: /create account/i }));

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
    mockMutateAsync.mockResolvedValueOnce({});

    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPass1');

    // Check consent boxes
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // terms
    await user.click(checkboxes[1]); // privacy

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass1',
        firstName: 'Test',
        lastName: 'User',
        preferredLanguage: 'en',
        termsAccepted: true,
        privacyPolicyAccepted: true,
      });
    });
  });

  it('navigates to dashboard on success', async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass1');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPass1');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
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
});
