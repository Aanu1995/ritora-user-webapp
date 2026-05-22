import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { DayOfWeek, SlotMode, type ScheduleSlot } from "@/types/schedule";
import {
  ScheduleViewMode,
  useScheduleUiStore,
} from "@/stores/schedule-ui-store";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";
import { SchedulePage } from "../schedule-page";

const mockUseSchedule = jest.fn();
const mockUseShelfStats = jest.fn();
const mockReplace = jest.fn((href: string) => {
  const query = href.split("?")[1] ?? "";
  mockSearchParams = new URLSearchParams(query);
});
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams("slot=slot-1");
let mockIsDesktop = true;

jest.mock("next/navigation", () => ({
  usePathname: () => "/routine",
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/hooks/use-schedule", () => ({
  useSchedule: () => mockUseSchedule(),
}));

jest.mock("@/hooks/use-shelf", () => ({
  useShelfStats: () => mockUseShelfStats(),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({
    timeZone: "Europe/Stockholm",
    todayDate: "2026-05-02",
  }),
}));

jest.mock("@/hooks/use-is-lg-desktop", () => ({
  useIsLgDesktop: () => mockIsDesktop,
}));

jest.mock("@/components/app/page-header", () => ({
  PageHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("../schedule-empty-state", () => ({
  ScheduleEmptyState: ({ onEveryDay }: { onEveryDay: () => void }) => (
    <button type="button" onClick={onEveryDay}>
      empty-state
    </button>
  ),
}));

jest.mock("../schedule-skeleton", () => ({
  ScheduleSkeleton: () => <div>schedule-skeleton</div>,
}));

jest.mock("../schedule-view-toggle", () => ({
  ScheduleViewToggle: () => <div>schedule-view-toggle</div>,
}));

jest.mock("../day-section", () => ({
  DaySection: () => <div>day-section</div>,
}));

jest.mock("../calendar-view", () => ({
  CalendarView: () => <div>calendar-view</div>,
}));

jest.mock("../every-day-quick-action", () => ({
  EveryDayQuickAction: () => <div>every-day-quick-action</div>,
}));

jest.mock("../add-slot-content", () => ({
  AddSlotContent: () => <div>add-slot-content</div>,
}));

jest.mock("../add-slot-dialog", () => ({
  AddSlotDialog: () => <div>add-slot-dialog</div>,
}));

jest.mock("../slot-editor-sheet", () => ({
  SlotEditorSheet: ({ suppressAutoClose }: { suppressAutoClose?: boolean }) => (
    <div>{`slot-editor-sheet-${suppressAutoClose ? "suppressed" : "active"}`}</div>
  ),
}));

jest.mock("../product-picker-sheet", () => ({
  ProductPickerSheet: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <button type="button" onClick={() => onOpenChange(false)}>
        Close product picker
      </button>
    ) : null,
}));

jest.mock("../slot-editor-content", () => ({
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
    id: "slot-1",
    dayOfWeek: DayOfWeek.Mon,
    slotTime: "08:00",
    mode: SlotMode.Manual,
    slotNotes: null,
    specialistProviderName: null,
    specialistClinicName: null,
    specialistActiveSince: null,
    specialistSafetyNotes: null,
    steps: [],
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
  };
}

describe("SchedulePage", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockUseSchedule.mockReset();
    mockUseShelfStats.mockReset();
    mockUseShelfStats.mockReturnValue({
      data: { all: 1 },
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });
    mockReplace.mockClear();
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams("slot=slot-1");
    mockIsDesktop = true;
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
      suppressRequestLeaveUntil: 0,
    });
  });

  it("opens a product prerequisite dialog when schedule setup is clicked without shelf products", async () => {
    const user = userEvent.setup();
    mockUseSchedule.mockReturnValue({
      data: { timeZone: "Europe/Stockholm", slots: [] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 0 },
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByRole("button", { name: /empty-state/i }));

    expect(
      screen.getByRole("heading", { name: /add a product first/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("add-slot-dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: /add product/i }));

    expect(mockPush).toHaveBeenCalledWith("/shelf");
  });

  it("does not reopen a deep-linked slot after the user closes it", async () => {
    mockUseSchedule.mockReturnValue({
      data: { timeZone: "Europe/Stockholm", slots: [createSlot()] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<SchedulePage />);

    expect(await screen.findByText("editing-slot-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close editor/i }));

    await waitFor(() => {
      expect(screen.queryByText("editing-slot-1")).not.toBeInTheDocument();
    });
  });

  it("does not close the mobile editor or open the unsaved dialog when the product picker closes", () => {
    jest.useFakeTimers();
    mockIsDesktop = false;
    mockUseSchedule.mockReturnValue({
      data: { timeZone: "Europe/Stockholm", slots: [createSlot()] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    useScheduleUiStore.setState({
      editingSlotId: "slot-1",
      viewMode: ScheduleViewMode.List,
      addSlotDialog: { open: false, preselectDay: null, presetMode: null },
      buildFromScratch: false,
      productPickerOpenForStepIndex: 0,
    });

    renderWithProviders(<SchedulePage />);

    expect(
      screen.getByText("slot-editor-sheet-suppressed"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /close product picker/i }),
    );

    expect(
      screen.getByText("slot-editor-sheet-suppressed"),
    ).toBeInTheDocument();
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText("slot-editor-sheet-active")).toBeInTheDocument();
  });
});
