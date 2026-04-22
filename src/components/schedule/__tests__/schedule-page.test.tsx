import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DayOfWeek, SlotMode, type ScheduleSlot } from '@/types/schedule';
import {
  ScheduleViewMode,
  useScheduleUiStore,
} from '@/stores/schedule-ui-store';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import { SchedulePage } from '../schedule-page';

const mockUseSchedule = jest.fn();
const mockReplace = jest.fn((href: string) => {
  const query = href.split('?')[1] ?? '';
  mockSearchParams = new URLSearchParams(query);
});
let mockSearchParams = new URLSearchParams('slot=slot-1');

jest.mock('next/navigation', () => ({
  usePathname: () => '/schedule',
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/hooks/use-schedule', () => ({
  useSchedule: () => mockUseSchedule(),
}));

jest.mock('@/hooks/use-is-lg-desktop', () => ({
  useIsLgDesktop: () => true,
}));

jest.mock('@/components/app/page-header', () => ({
  PageHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../schedule-empty-state', () => ({
  ScheduleEmptyState: () => <div>empty-state</div>,
}));

jest.mock('../schedule-skeleton', () => ({
  ScheduleSkeleton: () => <div>schedule-skeleton</div>,
}));

jest.mock('../schedule-view-toggle', () => ({
  ScheduleViewToggle: () => <div>schedule-view-toggle</div>,
}));

jest.mock('../day-section', () => ({
  DaySection: () => <div>day-section</div>,
}));

jest.mock('../calendar-view', () => ({
  CalendarView: () => <div>calendar-view</div>,
}));

jest.mock('../every-day-quick-action', () => ({
  EveryDayQuickAction: () => <div>every-day-quick-action</div>,
}));

jest.mock('../add-slot-content', () => ({
  AddSlotContent: () => <div>add-slot-content</div>,
}));

jest.mock('../add-slot-dialog', () => ({
  AddSlotDialog: () => <div>add-slot-dialog</div>,
}));

jest.mock('../slot-editor-sheet', () => ({
  SlotEditorSheet: () => <div>slot-editor-sheet</div>,
}));

jest.mock('../slot-editor-content', () => ({
  SlotEditorContent: ({
    onClose,
    slot,
  }: {
    onClose: () => void;
    slot: ScheduleSlot;
  }) => (
    <div>
      <span>{`editing-${slot.id}`}</span>
      <button type="button" onClick={onClose}>
        Close editor
      </button>
    </div>
  ),
}));

function createSlot(): ScheduleSlot {
  return {
    id: 'slot-1',
    dayOfWeek: DayOfWeek.Mon,
    slotTime: '08:00',
    mode: SlotMode.Manual,
    slotNotes: null,
    steps: [],
    createdAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T00:00:00.000Z',
  };
}

describe('SchedulePage', () => {
  beforeEach(() => {
    mockUseSchedule.mockReset();
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams('slot=slot-1');
    useScheduleUiStore.setState({
      editingSlotId: null,
      viewMode: ScheduleViewMode.List,
      addSlotDialog: { open: false, preselectDay: null, presetMode: null },
      buildFromScratch: false,
      productPickerOpenForStepIndex: null,
    });
    useUnsavedChangesStore.setState({
      hasUnsavedChanges: false,
      isDialogOpen: false,
      pendingProceed: null,
    });
  });

  it('does not reopen a deep-linked slot after the user closes it', async () => {
    mockUseSchedule.mockReturnValue({
      data: { slots: [createSlot()] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<SchedulePage />);

    expect(await screen.findByText('editing-slot-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close editor/i }));

    await waitFor(() => {
      expect(screen.queryByText('editing-slot-1')).not.toBeInTheDocument();
    });
  });
});
