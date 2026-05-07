import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/utils';
import { AddSlotPresetMode, DayOfWeek, SlotMode } from '@/types/schedule';
import { AddSlotContent } from '../add-slot-content';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockCreateSlot = jest.fn();
const mockCreateSlots = jest.fn();
const mockApplyPreset = jest.fn();
const mockUpdateAiConsentMutate = jest.fn();
let mockAiConsentGranted = false;

jest.mock('@/hooks/use-schedule', () => ({
  useCreateSlot: () => ({
    mutateAsync: mockCreateSlot,
    isPending: false,
  }),
  useCreateSlots: () => ({
    mutate: mockCreateSlots,
    isPending: false,
  }),
  useApplyPreset: () => ({
    mutate: mockApplyPreset,
    isPending: false,
  }),
}));

jest.mock('@/hooks/use-suggestions', () => ({
  useSuggestionAiConsent: () => ({
    data: {
      granted: mockAiConsentGranted,
      grantedAt: mockAiConsentGranted
        ? '2026-05-07T09:00:00.000Z'
        : null,
      canReadSensitiveContext: false,
      blockedReason: mockAiConsentGranted
        ? 'sensitive_recommendation_context_consent_missing'
        : 'ai_suggestion_processing_consent_missing',
      activeSensitiveConsentTypes: [],
    },
    isLoading: false,
  }),
  useUpdateSuggestionAiConsent: () => ({
    mutate: mockUpdateAiConsentMutate,
    isPending: false,
  }),
}));

describe('AddSlotContent', () => {
  beforeEach(() => {
    mockCreateSlot.mockReset();
    mockCreateSlots.mockReset();
    mockApplyPreset.mockReset();
    mockUpdateAiConsentMutate.mockReset();
    mockAiConsentGranted = false;
  });

  it('submits partial multi-day creates through one batch mutation', async () => {
    const onClose = jest.fn();

    mockCreateSlots.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ slots: [] }, _payload, undefined);
    });

    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.EveryDay}
        preselectDay={null}
        onClose={onClose}
      />,
    );

    const dayButtons = screen
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('aria-pressed'));

    fireEvent.click(dayButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: /add to 6 days/i }));

    await waitFor(() => {
      expect(mockCreateSlots).toHaveBeenCalledWith(
        {
          daysOfWeek: [
            DayOfWeek.Tue,
            DayOfWeek.Wed,
            DayOfWeek.Thu,
            DayOfWeek.Fri,
            DayOfWeek.Sat,
            DayOfWeek.Sun,
          ],
          slotTime: '08:00',
          mode: SlotMode.AI,
        },
        expect.any(Object),
      );
      expect(mockCreateSlot).not.toHaveBeenCalled();
      expect(mockApplyPreset).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders a form-level server error instead of relying on a toast', async () => {
    mockCreateSlots.mockImplementation((_payload, options) => {
      options?.onError?.(
        new ApiError('Could not save schedule', {
          status: 500,
        }),
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.Single}
        preselectDay={DayOfWeek.Mon}
        onClose={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /add time/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /could not save schedule/i,
      );
    });
  });

  it('offers AI suggestion consent while creating AI schedule slots', () => {
    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.Single}
        preselectDay={DayOfWeek.Mon}
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/Personalized routines, made for your skin/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /allow ai suggestions/i }),
    );

    expect(mockUpdateAiConsentMutate).toHaveBeenCalledWith(
      { granted: true },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
