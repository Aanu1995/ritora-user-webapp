import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/utils';
import { DayOfWeek, SlotMode, type ScheduleSlot } from '@/types/schedule';
import { SlotEditorContent } from '../slot-editor-content';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUpdateSlot = jest.fn();
const mockDeleteSlot = jest.fn();
const mockUpsertSteps = jest.fn();
const mockReleaseGuard = jest.fn();

jest.mock('@/hooks/use-schedule', () => ({
  useUpdateSlot: () => ({
    mutate: mockUpdateSlot,
    isPending: false,
  }),
  useDeleteSlot: () => ({
    mutate: mockDeleteSlot,
    isPending: false,
  }),
  useUpsertSteps: () => ({
    mutate: mockUpsertSteps,
    isPending: false,
  }),
}));

jest.mock('@/hooks/use-unsaved-changes-guard', () => ({
  useUnsavedChangesGuard: () => ({
    releaseGuard: mockReleaseGuard,
  }),
}));

jest.mock('../routine-step-list', () => {
  const actual = jest.requireActual('../routine-step-list');

  return {
    ...actual,
    RoutineStepList: ({ errorText }: { errorText?: string }) => (
      <div>{errorText ? <p role="alert">{errorText}</p> : null}</div>
    ),
  };
});

function createSlot(overrides: Partial<ScheduleSlot> = {}): ScheduleSlot {
  return {
    id: 'slot-1',
    dayOfWeek: DayOfWeek.Mon,
    slotTime: '08:00',
    mode: SlotMode.AI,
    slotNotes: null,
    steps: [],
    createdAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T00:00:00.000Z',
    ...overrides,
  };
}

describe('SlotEditorContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps duplicate save errors to the time field inline', async () => {
    mockUpdateSlot.mockImplementation((_payload, options) => {
      options?.onError?.(
        new ApiError('Duplicate slot', {
          status: 400,
          body: {
            code: 'SCHEDULE_SLOT_CONFLICT',
          },
        }),
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: '09:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /a slot already exists at that day and time/i,
      );
    });
  });

  it('shows a form-level error when the slot no longer exists', async () => {
    mockUpdateSlot.mockImplementation((_payload, options) => {
      options?.onError?.(
        new ApiError('Slot not found', {
          status: 404,
          body: {
            code: 'SCHEDULE_SLOT_NOT_FOUND',
          },
        }),
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: '09:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/slot not found/i);
    });
  });

  it('does not treat whitespace-only notes edits as a real change', () => {
    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '   ' },
    });

    expect(saveButton).toBeDisabled();
    expect(mockUpdateSlot).not.toHaveBeenCalled();
  });
});
