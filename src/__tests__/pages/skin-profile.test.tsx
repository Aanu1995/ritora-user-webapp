import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRoute } from '@/constants/app-routes';
import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockCreateProfile = jest.fn();
const mockUpdateProfile = jest.fn();

type MutationCallbacks = {
  onSuccess?: (...args: unknown[]) => void;
  onError?: (...args: unknown[]) => void;
};

jest.mock('@/hooks/use-skin-profile', () => ({
  useSkinProfile: () => ({
    data: null,
    isPending: false,
    isError: true,
    error: new ApiError('Not found', { status: 404 }),
    refetch: jest.fn(),
  }),
  useSkinProfileOptions: () => ({
    data: {
      skinTypes: ['oily', 'dry'],
      skinTones: ['medium'],
      ageRanges: ['25_34'],
      ethnicities: ['black'],
      concerns: ['acne'],
      goals: ['clear_acne'],
      complexities: ['moderate'],
    },
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useCreateSkinProfile: () => ({
    mutate: mockCreateProfile,
    isPending: false,
    isError: false,
    error: null,
  }),
  useUpdateSkinProfile: () => ({
    mutate: mockUpdateProfile,
    isPending: false,
    isError: false,
    error: null,
  }),
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
  usePathname: () => AppRoute.SkinProfile,
  useSearchParams: () => new URLSearchParams(),
}));

import SkinProfilePage from '@/app/(app)/skin-profile/page';

describe('SkinProfilePage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders known sensitivities controls', async () => {
    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByLabelText(/known sensitivities/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add sensitivity/i }),
    ).toBeInTheDocument();
  });

  it('requires location consent before saving location data', async () => {
    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(
      screen.getByPlaceholderText(/add a sensitivity or past reaction/i),
      'Fragrance',
    );
    await user.click(screen.getByRole('button', { name: /add sensitivity/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.type(screen.getByLabelText(/^country$/i), 'SE');
    await user.type(screen.getByLabelText(/^city$/i), 'Stockholm');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/location consent is required/i),
      ).toBeInTheDocument();
    });
    expect(mockCreateProfile).not.toHaveBeenCalled();
  });

  it('submits sensitivities and location consent when valid', async () => {
    mockCreateProfile.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onSuccess?.();
      },
    );

    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(
      screen.getByPlaceholderText(/add a sensitivity or past reaction/i),
      'Fragrance',
    );
    await user.click(screen.getByRole('button', { name: /add sensitivity/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.type(screen.getByLabelText(/^country$/i), 'SE');
    await user.type(screen.getByLabelText(/^city$/i), 'Stockholm');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(
      screen.getByRole('radio', { name: /moderate \(4-5 steps\)/i }),
    );
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          knownSensitivities: ['Fragrance'],
          countryCode: 'SE',
          city: 'Stockholm',
          locationConsent: true,
          routineComplexity: 'moderate',
        }),
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
    expect(mockPush).toHaveBeenCalledWith(AppRoute.Dashboard);
  });

  it('does not navigate when saving the profile fails', async () => {
    mockCreateProfile.mockImplementation(
      (_input: unknown, options?: MutationCallbacks) => {
        options?.onError?.(
          new ApiError("We couldn't save your profile. Please try again.", {
            status: 500,
            body: {
              message: "We couldn't save your profile. Please try again.",
            },
          }),
        );
      },
    );

    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(
      screen.getByPlaceholderText(/add a sensitivity or past reaction/i),
      'Fragrance',
    );
    await user.click(screen.getByRole('button', { name: /add sensitivity/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByLabelText(/^country$/i), 'SE');
    await user.type(screen.getByLabelText(/^city$/i), 'Stockholm');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(
      screen.getByRole('radio', { name: /moderate \(4-5 steps\)/i }),
    );
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
    expect(
      screen.getByText(/we couldn't save your profile/i),
    ).toBeInTheDocument();
  });
});
