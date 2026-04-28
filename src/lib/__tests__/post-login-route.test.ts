import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { QueryKey } from '@/constants/query-keys';
import { appQueryClient } from '@/lib/query-client';
import {
  consumeMissingSkinProfileHandoff,
  hasMissingSkinProfileHandoff,
  resetPostLoginState,
  resolvePostLoginRoute,
} from '@/lib/post-login-route';
import { useAuthStore } from '@/stores/auth-store';
import type { SkinProfile } from '@/types/skin-profile';

const mockGetSkinProfile = jest.fn();

jest.mock('@/services/skin-profile.service', () => ({
  getSkinProfile: () => mockGetSkinProfile(),
}));

const completeRoutinePreferences = {
  pace: 'cautious',
  am_minutes: 5,
  pm_minutes: 10,
  max_active_nights_per_week: 3,
  fragrance_free: true,
  non_comedogenic: true,
  sunscreen_filter: 'hybrid',
  sunscreen_finish: 'natural',
};

const buildProfile = (
  overrides: Partial<SkinProfile> = {},
): SkinProfile => ({
  id: 'profile-1',
  dateOfBirth: '1992-04-15',
  sexAtBirth: 'female',
  skinType: 'oily',
  skinTone: 'medium',
  ethnicity: 'black',
  currentConcerns: ['acne'],
  countryCode: null,
  city: null,
  fitzpatrickPhototype: 'IV',
  sensitivityLevel: null,
  hydrationLevel: null,
  primaryGoal: 'acne',
  pregnancyStatus: null,
  underDermatologistCare: null,
  allowSmartPicks: true,
  budgetTier: 'mid',
  safetyContext: {},
  reactionHistory: {},
  concernDetails: {
    per_concern: [
      {
        concern: 'acne',
        severity: 'moderate',
        priority: 1,
      },
    ],
  },
  skinBehavior: {
    burn_tendency: 'sometimes',
    pih_tendency: 'often',
    melasma_tendency: 'never',
    keloid_tendency: 'never',
    sunscreen_habit: 'most_days',
    sunscreen_tolerance: 'fine',
  },
  activeTolerances: {},
  routinePreferences: completeRoutinePreferences,
  lifestyleContext: {},
  shoppingPreferences: {},
  hormonalContext: {},
  completeness: 0,
  hasHealthContextConsent: false,
  hasHormonalContextConsent: false,
  createdAt: '2026-04-15T10:00:00.000Z',
  updatedAt: '2026-04-15T10:00:00.000Z',
  ...overrides,
});

const buildIncompleteRoutineProfile = () =>
  buildProfile({
    routinePreferences: {
      ...completeRoutinePreferences,
      pace: undefined,
    },
  });

describe('resolvePostLoginRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appQueryClient.clear();
    resetPostLoginState();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2026-04-15T10:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('routes new users to skin profile when no profile exists yet', async () => {
    mockGetSkinProfile.mockRejectedValue(
      new ApiError('Not found', { status: 404 }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
  });

  it('routes users with an incomplete core profile to skin profile', async () => {
    const profile = buildIncompleteRoutineProfile();
    mockGetSkinProfile.mockResolvedValue(profile);

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
    expect(appQueryClient.getQueryData([QueryKey.SkinProfile])).toEqual(
      profile,
    );
  });

  it('routes users with a complete core profile to the dashboard', async () => {
    mockGetSkinProfile.mockResolvedValue(buildProfile());

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.Dashboard);
    expect(appQueryClient.getQueryData([QueryKey.SkinProfile])).toEqual(
      buildProfile(),
    );
  });

  it('falls back to the dashboard when profile lookup fails unexpectedly', async () => {
    mockGetSkinProfile.mockRejectedValue(
      new ApiError('Server error', { status: 500 }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.Dashboard);
  });

  it('stores and consumes a missing-profile handoff for the current session', async () => {
    mockGetSkinProfile.mockRejectedValue(
      new ApiError('Not found', { status: 404 }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
    expect(hasMissingSkinProfileHandoff()).toBe(true);
    expect(consumeMissingSkinProfileHandoff()).toBe(true);
    expect(hasMissingSkinProfileHandoff()).toBe(false);
    expect(consumeMissingSkinProfileHandoff()).toBe(false);
  });

  it('deduplicates in-flight resolution per authenticated user', async () => {
    let resolveProfile:
      | ((profile: ReturnType<typeof buildProfile>) => void)
      | undefined;

    mockGetSkinProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveProfile = resolve;
      }),
    );

    const firstRoute = resolvePostLoginRoute();
    const secondRoute = resolvePostLoginRoute();

    expect(mockGetSkinProfile).toHaveBeenCalledTimes(1);

    resolveProfile?.(buildProfile());

    await expect(firstRoute).resolves.toBe(AppRoute.Dashboard);
    await expect(secondRoute).resolves.toBe(AppRoute.Dashboard);
  });

  it('does not reuse an in-flight resolution across different users', async () => {
    let resolveFirstProfile:
      | ((profile: ReturnType<typeof buildProfile>) => void)
      | undefined;

    mockGetSkinProfile.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirstProfile = resolve;
      }),
    );
    mockGetSkinProfile.mockResolvedValueOnce(
      buildIncompleteRoutineProfile(),
    );

    const firstRoute = resolvePostLoginRoute();

    useAuthStore.setState({
      user: {
        id: 'user-2',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        emailVerified: true,
        preferredLanguage: 'sv',
        createdAt: '2026-04-15T10:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
    expect(mockGetSkinProfile).toHaveBeenCalledTimes(2);

    resolveFirstProfile?.(buildProfile());
    await expect(firstRoute).resolves.toBe(AppRoute.Dashboard);
  });

  it('does not reuse stale state after an auth-boundary reset for the same user', async () => {
    let resolveFirstProfile:
      | ((profile: ReturnType<typeof buildProfile>) => void)
      | undefined;

    mockGetSkinProfile.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirstProfile = resolve;
      }),
    );
    mockGetSkinProfile.mockResolvedValueOnce(
      buildIncompleteRoutineProfile(),
    );

    const firstRoute = resolvePostLoginRoute();

    resetPostLoginState();

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
    expect(mockGetSkinProfile).toHaveBeenCalledTimes(2);

    resolveFirstProfile?.(buildProfile());
    await expect(firstRoute).resolves.toBe(AppRoute.Dashboard);
    expect(
      appQueryClient.getQueryData([QueryKey.SkinProfile]),
    ).toEqual(buildIncompleteRoutineProfile());
    expect(consumeMissingSkinProfileHandoff()).toBe(false);
  });
});
