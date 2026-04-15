import { screen, waitFor } from '@testing-library/react';
import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders } from '@/test/utils';
import type { SkinProfile } from '@/types/skin-profile';

const mockReplace = jest.fn();

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
    replace: mockReplace,
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => AppRoute.Onboarding,
  useSearchParams: () => new URLSearchParams(),
}));

import OnboardingPage from '@/app/onboarding/page';

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

describe('OnboardingPage', () => {
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

  it('introduces the guided setup for users who still need a profile', () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError('Not found', { status: 404 }),
    };

    renderWithProviders(<OnboardingPage />);

    expect(
      screen.getByRole('heading', {
        name: /start with clarity, not more skincare noise/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /next/i }),
    ).toBeInTheDocument();
  });

  it('redirects completed users back to the dashboard', async () => {
    mockSkinProfileReturn = {
      data: buildProfile(),
      isPending: false,
      isError: false,
      error: null,
    };

    renderWithProviders(<OnboardingPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(AppRoute.Dashboard);
    });
  });
});
