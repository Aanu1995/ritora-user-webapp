import { screen } from '@testing-library/react';
import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders } from '@/test/utils';
import type { SkinProfile } from '@/types/skin-profile';

let mockSkinProfileReturn: {
  data: SkinProfile | null;
  isPending: boolean;
  isError: boolean;
  error: unknown;
};

jest.mock('@/hooks/use-skin-profile', () => ({
  useSkinProfile: () => mockSkinProfileReturn,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => AppRoute.Dashboard,
  useSearchParams: () => new URLSearchParams(),
}));

import DashboardPage from '@/app/(app)/dashboard/page';

const buildProfile = (
  overrides: Partial<SkinProfile> = {},
): SkinProfile => ({
  id: 'profile-1',
  skinType: 'oily',
  skinTone: 'medium',
  ageRange: '25_34',
  ethnicity: null,
  currentConcerns: ['acne'],
  knownSensitivities: [],
  skinGoals: ['clear_acne'],
  countryCode: null,
  city: null,
  routineComplexity: 'moderate',
  createdAt: '2026-04-15T10:00:00.000Z',
  updatedAt: '2026-04-15T10:00:00.000Z',
  ...overrides,
});

describe('DashboardPage', () => {
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

  it('sends users without a profile into onboarding from the main setup CTA', () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError('Not found', { status: 404 }),
    };

    renderWithProviders(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: /skin profile setup/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start skin profile/i })).toHaveAttribute(
      'href',
      AppRoute.Onboarding,
    );
  });

  it('shows the profile summary once the core profile is complete', () => {
    mockSkinProfileReturn = {
      data: buildProfile(),
      isPending: false,
      isError: false,
      error: null,
    };

    renderWithProviders(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: /current profile snapshot/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /review profile/i })[0]).toHaveAttribute(
      'href',
      AppRoute.SkinProfile,
    );
  });
});
