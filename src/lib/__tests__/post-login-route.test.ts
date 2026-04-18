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
    mockGetSkinProfile.mockResolvedValue(
      buildProfile({ routineComplexity: null }),
    );

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
    expect(appQueryClient.getQueryData([QueryKey.SkinProfile])).toEqual(
      buildProfile({ routineComplexity: null }),
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
      buildProfile({ routineComplexity: null }),
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
      buildProfile({ routineComplexity: null }),
    );

    const firstRoute = resolvePostLoginRoute();

    resetPostLoginState();

    await expect(resolvePostLoginRoute()).resolves.toBe(AppRoute.SkinProfile);
    expect(mockGetSkinProfile).toHaveBeenCalledTimes(2);

    resolveFirstProfile?.(buildProfile());
    await expect(firstRoute).resolves.toBe(AppRoute.Dashboard);
    expect(
      appQueryClient.getQueryData([QueryKey.SkinProfile]),
    ).toEqual(buildProfile({ routineComplexity: null }));
    expect(consumeMissingSkinProfileHandoff()).toBe(false);
  });
});
