import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { resolvePostLoginRoute } from '@/lib/post-login-route';
import type { SkinProfile } from '@/types/skin-profile';

const mockGetSkinProfile = jest.fn();

jest.mock('@/services/skin-profile.service', () => ({
  getSkinProfile: () => mockGetSkinProfile(),
}));

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

describe('resolvePostLoginRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes new users to onboarding when no profile exists yet', async () => {
    mockGetSkinProfile.mockRejectedValue(
      new ApiError('Not found', { status: 404 }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.Onboarding);
  });

  it('routes users with an incomplete core profile to onboarding', async () => {
    mockGetSkinProfile.mockResolvedValue(
      buildProfile({ routineComplexity: null }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.Onboarding);
  });

  it('routes users with a complete core profile to the dashboard', async () => {
    mockGetSkinProfile.mockResolvedValue(buildProfile());

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.Dashboard);
  });

  it('falls back to the dashboard when profile lookup fails unexpectedly', async () => {
    mockGetSkinProfile.mockRejectedValue(
      new ApiError('Server error', { status: 500 }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.Dashboard);
  });
});
