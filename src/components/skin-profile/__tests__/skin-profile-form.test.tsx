import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/utils';

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();

jest.mock('@/hooks/use-skin-profile', () => ({
  useCreateSkinProfile: () => ({
    mutate: mockCreateMutate,
    isPending: false,
  }),
  useUpdateSkinProfile: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

import { SkinProfileForm } from '@/components/skin-profile/skin-profile-form';

const mockOptions = {
  skinTypes: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
  skinTones: ['light', 'medium', 'dark'],
  ageRanges: ['18_24', '25_34'],
  ethnicities: ['black', 'white_caucasian'],
  concerns: ['acne', 'dark_marks', 'dryness'],
  goals: ['clear_acne', 'fade_dark_marks'],
  complexities: ['minimal', 'moderate', 'comprehensive'],
};

const existingProfile = {
  id: 'profile-1',
  skinType: 'oily',
  skinTone: 'medium',
  ageRange: '25_34',
  ethnicity: 'black',
  currentConcerns: ['acne'],
  knownSensitivities: ['Fragrance'],
  skinGoals: ['clear_acne'],
  countryCode: 'SE',
  city: 'Stockholm',
  routineComplexity: 'moderate',
  createdAt: '2026-04-15T10:00:00.000Z',
  updatedAt: '2026-04-15T10:00:00.000Z',
};

describe('SkinProfileForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockCreateMutate.mockReset();
    mockUpdateMutate.mockReset();
  });

  it('does not add duplicate known sensitivities when casing differs', async () => {
    renderWithProviders(<SkinProfileForm options={mockOptions} />);

    await user.click(screen.getByRole('radio', { name: /oily/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    const input = screen.getByPlaceholderText(/fragrance, niacinamide/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'Fragrance');
    await user.click(addButton);

    expect(screen.getByText('Fragrance')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'fragrance');
    await user.click(addButton);

    expect(screen.getAllByText(/fragrance/i)).toHaveLength(1);
  });

  it('shows an inline submit error when saving fails', async () => {
    mockUpdateMutate.mockImplementation(
      (
        _payload: unknown,
        options: {
          onError?: (error: unknown) => void;
        },
      ) => {
        options.onError?.(
          new ApiError('Save failed', {
            status: 400,
            body: { message: 'Profile save failed' },
          }),
        );
      },
    );

    renderWithProviders(
      <SkinProfileForm
        existingProfile={existingProfile}
        options={mockOptions}
        initialStep={5}
        onCancel={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(screen.getByText('Profile save failed')).toBeInTheDocument();
  });

  it('shows location consent validation in the form when required', async () => {
    renderWithProviders(<SkinProfileForm options={mockOptions} initialStep={5} />);

    await user.type(screen.getByPlaceholderText('SE'), 'SE');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(
      screen.getByText(/location consent is required/i),
    ).toBeInTheDocument();
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('saves after correcting location consent following validation failure', async () => {
    mockCreateMutate.mockImplementation(
      (
        _payload: unknown,
        options: {
          onSuccess?: (data: unknown) => void;
        },
      ) => {
        options.onSuccess?.({ id: 'profile-1' });
      },
    );

    renderWithProviders(<SkinProfileForm options={mockOptions} initialStep={5} />);

    await user.type(screen.getByPlaceholderText('SE'), 'SE');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(
      screen.getByText(/location consent is required/i),
    ).toBeInTheDocument();
    expect(mockCreateMutate).not.toHaveBeenCalled();

    await user.click(
      screen.getByLabelText(/processing my location data/i),
    );
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(mockCreateMutate).toHaveBeenCalled();
    expect(mockCreateMutate.mock.calls[0]?.[0]).toMatchObject({
      countryCode: 'SE',
      locationConsent: true,
    });
  });
});
