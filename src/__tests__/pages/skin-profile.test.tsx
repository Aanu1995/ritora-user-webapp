import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockCreateProfile = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('@/hooks/use-skin-profile', () => ({
  useSkinProfile: () => ({
    data: null,
    isPending: false,
    isError: true,
    error: { status: 404 },
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
  }),
  useCreateSkinProfile: () => ({
    mutateAsync: mockCreateProfile,
    isPending: false,
    isError: false,
    error: null,
  }),
  useUpdateSkinProfile: () => ({
    mutateAsync: mockUpdateProfile,
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

import SkinProfilePage from '@/app/[locale]/(app)/skin-profile/page';

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
    mockCreateProfile.mockResolvedValueOnce({});

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
      );
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
