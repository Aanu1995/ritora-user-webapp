import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRoute } from '@/constants/app-routes';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders } from '@/test/utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => AppRoute.Settings,
  useSearchParams: () => new URLSearchParams(),
}));

import SettingsPage from '@/app/(app)/settings/page';

describe('SettingsPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2026-04-15T10:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders account details and updates the theme preference', async () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /dark/i }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();
    });
  });
});
