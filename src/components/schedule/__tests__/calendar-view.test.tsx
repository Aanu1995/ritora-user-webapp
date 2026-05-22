import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../../../messages/en.json";
import { ApiError } from "@/lib/api-error";
import {
  DayOfWeek,
  ScheduleApiErrorCode,
  SlotMode,
  StepLabel,
  type ScheduleSlot,
} from "@/types/schedule";
import { useMoveSlot } from "@/hooks/use-schedule";
import { toast } from "sonner";
import { CalendarView } from "../calendar-view";

let mockDndContextProps: Record<string, (...args: unknown[]) => void> = {};
let mockMoveSlotMutate = jest.fn();

jest.mock("@dnd-kit/core", () => {
  const React = jest.requireActual("react");

  return {
    DndContext: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
      mockDndContextProps = props as Record<
        string,
        (...args: unknown[]) => void
      >;
      return React.createElement(
        "div",
        { "data-testid": "dnd-context" },
        children,
      );
    },
    DragOverlay: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "drag-overlay" }, children),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    closestCenter: jest.fn(),
    useDraggable: jest.fn(({ id }: { id: string }) => ({
      attributes: { "data-draggable-id": id },
      listeners: { onPointerDown: jest.fn() },
      setNodeRef: jest.fn(),
      isDragging: false,
    })),
    useDroppable: jest.fn(() => ({
      isOver: false,
      setNodeRef: jest.fn(),
    })),
    useSensor: jest.fn((sensor, options) => ({ sensor, options })),
    useSensors: jest.fn((...sensors) => sensors),
  };
});

jest.mock("@/hooks/use-schedule", () => ({
  useMoveSlot: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUseMoveSlot = useMoveSlot as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

function createSlot(
  id: string,
  dayOfWeek: DayOfWeek,
  slotTime: string,
  mode: SlotMode = SlotMode.Manual,
): ScheduleSlot {
  return {
    id,
    dayOfWeek,
    slotTime,
    mode,
    slotNotes: null,
    specialistProviderName: null,
    specialistClinicName: null,
    specialistActiveSince: null,
    specialistSafetyNotes: null,
    steps:
      mode === SlotMode.Manual
        ? [
            {
              id: `${id}-step-1`,
              stepOrder: 0,
              inventoryProductId: null,
              stepLabel: StepLabel.Cleanser,
              customLabel: null,
              notes: null,
              optional: false,
              isSpecialistLocked: false,
              product: null,
              createdAt: "2026-04-17T00:00:00.000Z",
              updatedAt: "2026-04-17T00:00:00.000Z",
            },
          ]
        : [],
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
  };
}

function renderCalendar(
  slots: ScheduleSlot[],
  props?: Partial<React.ComponentProps<typeof CalendarView>>,
) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <CalendarView
        slots={slots}
        today={DayOfWeek.Wed}
        onSlotClick={jest.fn()}
        onAddTime={jest.fn()}
        {...props}
      />
    </NextIntlClientProvider>,
  );
}

describe("CalendarView", () => {
  beforeEach(() => {
    mockDndContextProps = {};
    mockMoveSlotMutate = jest.fn();
    mockUseMoveSlot.mockReturnValue({ mutate: mockMoveSlotMutate });
    mockToast.error.mockReset();
    mockToast.success.mockReset();
  });

  it("orders days from today, groups slots, and opens add/slot actions", () => {
    const onAddTime = jest.fn();
    const onSlotClick = jest.fn();
    const evening = createSlot(
      "slot-evening",
      DayOfWeek.Wed,
      "21:00",
      SlotMode.AI,
    );
    const morning = createSlot("slot-morning", DayOfWeek.Wed, "08:00");

    renderCalendar([evening, morning], { onAddTime, onSlotClick });

    expect(
      screen.getByText("Drag any slot to another day"),
    ).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText(/Today/)).toBeInTheDocument();
    expect(screen.getByText(/# step/)).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);
    expect(onAddTime).toHaveBeenCalledWith(DayOfWeek.Wed);

    fireEvent.click(screen.getByRole("button", { name: "08:00" }));
    expect(onSlotClick).toHaveBeenCalledWith("slot-morning");
  });

  it("moves a dragged slot to another day and shows success feedback", () => {
    const slot = createSlot("slot-1", DayOfWeek.Wed, "08:00");

    renderCalendar([slot]);

    act(() => {
      mockDndContextProps.onDragStart({
        active: { data: { current: { slot } } },
      });
    });
    expect(screen.getByTestId("drag-overlay")).toHaveTextContent("08:00");

    act(() => {
      mockDndContextProps.onDragEnd({
        active: { data: { current: { slot } } },
        over: { data: { current: { day: DayOfWeek.Fri } } },
      });
    });

    expect(mockMoveSlotMutate).toHaveBeenCalledWith(
      {
        id: "slot-1",
        payload: { toDay: DayOfWeek.Fri, toTime: "08:00" },
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );

    const options = mockMoveSlotMutate.mock.calls[0]?.[1] as {
      onSuccess: () => void;
    };
    options.onSuccess();
    expect(mockToast.success).toHaveBeenCalledWith("Saved");
  });

  it("does not move when a drop has no destination or stays on the same day", () => {
    const slot = createSlot("slot-1", DayOfWeek.Wed, "08:00");

    renderCalendar([slot]);

    act(() => {
      mockDndContextProps.onDragEnd({
        active: { data: { current: { slot } } },
        over: null,
      });
      mockDndContextProps.onDragEnd({
        active: { data: { current: { slot } } },
        over: { data: { current: { day: DayOfWeek.Wed } } },
      });
      mockDndContextProps.onDragCancel();
    });

    expect(mockMoveSlotMutate).not.toHaveBeenCalled();
  });

  it("shows conflict-specific and generic move errors", () => {
    const slot = createSlot("slot-1", DayOfWeek.Wed, "08:00");

    renderCalendar([slot]);

    act(() => {
      mockDndContextProps.onDragEnd({
        active: { data: { current: { slot } } },
        over: { data: { current: { day: DayOfWeek.Fri } } },
      });
    });

    const options = mockMoveSlotMutate.mock.calls[0]?.[1] as {
      onError: (error: unknown) => void;
    };
    options.onError(
      new ApiError("Conflict", {
        body: { code: ScheduleApiErrorCode.MoveConflict },
      }),
    );
    options.onError(new Error("Nope"));

    expect(mockToast.error).toHaveBeenCalledWith(
      "A slot already exists at the destination.",
    );
    expect(mockToast.error).toHaveBeenCalledWith("Couldn't save. Try again.");
  });
});
