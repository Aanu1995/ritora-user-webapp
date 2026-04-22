import { fireEvent, screen } from '@testing-library/react';
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

describe('AddSlotContent', () => {
  beforeEach(() => {
    mockCreateSlot.mockReset();
    mockCreateSlots.mockReset();
    mockApplyPreset.mockReset();
  });

  it('submits partial multi-day creates through one batch mutation', () => {
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
