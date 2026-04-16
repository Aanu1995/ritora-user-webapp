import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import messages from '../../../messages/en.json';
import { AppPreferencesProvider } from '@/components/preferences/app-preferences-provider';
import { QueryKey } from '@/constants/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import {
  useSkinProfile,
  useSkinProfileOptions,
  useCreateSkinProfile,
  useUpdateSkinProfile,
} from '@/hooks/use-skin-profile';

const mockProfile = {
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
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockOptions = {
  skinTypes: ['oily', 'dry', 'combination'],
  skinTones: ['light', 'medium', 'dark'],
  ageRanges: ['18_24', '25_34'],
  ethnicities: ['black', 'white_caucasian'],
  concerns: ['acne', 'dryness'],
  goals: ['clear_acne'],
  complexities: ['minimal', 'moderate'],
};

jest.mock('@/services/skin-profile.service', () => ({
  getSkinProfile: jest.fn(),
  getSkinProfileOptions: jest.fn(),
  createSkinProfile: jest.fn(),
  updateSkinProfile: jest.fn(),
  deleteSkinProfile: jest.fn(),
}));

import * as skinProfileService from '@/services/skin-profile.service';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderSkinProfileHook<T>(hook: () => T, queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient();

  return {
    queryClient: client,
    ...renderHook(hook, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NextIntlClientProvider locale="en" messages={messages}>
          <AppPreferencesProvider>
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
          </AppPreferencesProvider>
        </NextIntlClientProvider>
      ),
    }),
  };
}

afterEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useSkinProfile', () => {
  it('fetches profile when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (skinProfileService.getSkinProfile as jest.Mock).mockResolvedValue(
      mockProfile,
    );

    const { result } = renderSkinProfileHook(() => useSkinProfile());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.skinType).toBe('oily');
    expect(result.current.data?.currentConcerns).toEqual(['acne']);
  });

  it('does not fetch when unauthenticated', () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { result } = renderSkinProfileHook(() => useSkinProfile());

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useSkinProfileOptions', () => {
  it('fetches options', async () => {
    (skinProfileService.getSkinProfileOptions as jest.Mock).mockResolvedValue(
      mockOptions,
    );

    const { result } = renderSkinProfileHook(() => useSkinProfileOptions());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.skinTypes).toEqual(mockOptions.skinTypes);
  });
});

describe('useCreateSkinProfile', () => {
  it('creates a profile', async () => {
    (skinProfileService.createSkinProfile as jest.Mock).mockResolvedValue(
      mockProfile,
    );

    const queryClient = createTestQueryClient();
    const { result } = renderSkinProfileHook(
      () => useCreateSkinProfile(),
      queryClient,
    );

    await act(async () => {
      await result.current.mutateAsync({
        skinType: 'oily',
        currentConcerns: ['acne'],
      });
    });

    expect(skinProfileService.createSkinProfile).toHaveBeenCalledWith({
      skinType: 'oily',
      currentConcerns: ['acne'],
    });
    expect(queryClient.getQueryData([QueryKey.SkinProfile])).toEqual(mockProfile);
  });
});

describe('useUpdateSkinProfile', () => {
  it('updates a profile', async () => {
    (skinProfileService.updateSkinProfile as jest.Mock).mockResolvedValue({
      ...mockProfile,
      skinType: 'combination',
    });

    const queryClient = createTestQueryClient();
    const { result } = renderSkinProfileHook(
      () => useUpdateSkinProfile(),
      queryClient,
    );

    await act(async () => {
      await result.current.mutateAsync({ skinType: 'combination' });
    });

    expect(skinProfileService.updateSkinProfile).toHaveBeenCalledWith({
      skinType: 'combination',
    });
    expect(queryClient.getQueryData([QueryKey.SkinProfile])).toEqual({
      ...mockProfile,
      skinType: 'combination',
    });
  });
});
