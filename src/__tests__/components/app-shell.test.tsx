import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRoute } from '@/constants/app-routes';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders } from '@/test/utils';

const mockLogoutMutate = jest.fn();
let mockPathname = AppRoute.Dashboard;
let mockLogoutState = {
  mutate: mockLogoutMutate,
  isPending: false,
};
let mockSkinProfileData: {
  data: unknown;
} = {
  data: null,
};

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/hooks/use-auth', () => ({
  useLogout: () => mockLogoutState,
}));

jest.mock('@/hooks/use-skin-profile', () => ({
  useSkinProfile: () => mockSkinProfileData,
}));

import { AppShell } from '@/components/app/app-shell';

const completeProfile = {
  id: 'profile-1',
  skinType: 'oily',
  skinTone: 'medium',
  ageRange: '25_34',
  ethnicity: 'black',
  currentConcerns: ['acne'],
  knownSensitivities: [],
  skinGoals: ['clear_acne'],
  countryCode: 'SE',
  city: 'Stockholm',
  routineComplexity: 'moderate',
  createdAt: '2026-04-15T10:00:00.000Z',
  updatedAt: '2026-04-15T10:00:00.000Z',
};

describe('AppShell', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = AppRoute.Dashboard;
    mockLogoutState = {
      mutate: mockLogoutMutate,
      isPending: false,
    };
    mockSkinProfileData = { data: null };
    document.body.style.overflow = '';
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

  it('renders setup guidance, planned modules, and logs the user out', async () => {
    renderWithProviders(
      <AppShell>
        <div>Dashboard body</div>
      </AppShell>,
    );

    expect(screen.getByText(/finish the foundation/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start skin profile/i })).toHaveAttribute(
      'href',
      AppRoute.Onboarding,
    );
    expect(screen.getByText(/^inventory$/i)).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(mockLogoutMutate).toHaveBeenCalledTimes(1);
  });

  it('renders the ready state once the skin profile is complete', () => {
    mockPathname = AppRoute.SkinProfile;
    mockSkinProfileData = { data: completeProfile };

    renderWithProviders(
      <AppShell>
        <div>Profile body</div>
      </AppShell>,
    );

    expect(
      screen.queryByText(/finish the foundation/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/^ready$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/authentication is ready and the workspace is open/i),
    ).toBeInTheDocument();
  });

  it('opens the mobile navigation drawer and closes it on escape', async () => {
    const { container } = renderWithProviders(
      <AppShell>
        <div>Mobile body</div>
      </AppShell>,
    );

    const drawerSelector = '.fixed.inset-0.z-50.lg\\:hidden';
    expect(container.querySelector(drawerSelector)).toBeNull();

    await user.click(
      screen.getByRole('button', { name: /open workspace navigation/i }),
    );

    expect(container.querySelector(drawerSelector)).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(container.querySelector(drawerSelector)).toBeNull();
    });
    expect(document.body.style.overflow).toBe('');
  });
});
