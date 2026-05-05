import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DaySection } from "@/components/schedule/day-section";
import { ScheduleSkeleton } from "@/components/schedule/schedule-skeleton";
import { ScheduleViewToggle } from "@/components/schedule/schedule-view-toggle";
import { ScheduleViewMode } from "@/stores/schedule-ui-store";
import {
  DayOfWeek,
  SlotMode,
  StepLabel,
  type ScheduleSlot,
} from "@/types/schedule";

describe("schedule primitive components", () => {
  it("renders day sections and delegates slot/add actions", async () => {
    const user = userEvent.setup();
    const onSlotClick = jest.fn();
    const onAddTime = jest.fn();

    render(
      <DaySection
        day={DayOfWeek.Mon}
        slots={[scheduleSlot()]}
        isToday
        onSlotClick={onSlotClick}
        onAddTime={onAddTime}
      />,
    );

    expect(screen.getByText(/today/i)).toBeInTheDocument();
    expect(screen.getByText("08:00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /08:00/i }));
    await user.click(screen.getByRole("button", { name: /add time/i }));

    expect(onSlotClick).toHaveBeenCalledWith("slot-1");
    expect(onAddTime).toHaveBeenCalledWith(DayOfWeek.Mon);
  });

  it("renders empty days, the view toggle, and skeleton placeholders", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <>
        <DaySection
          day={DayOfWeek.Tue}
          slots={[]}
          isToday={false}
          onSlotClick={jest.fn()}
          onAddTime={jest.fn()}
        />
        <ScheduleViewToggle value={ScheduleViewMode.List} onChange={onChange} />
        <ScheduleSkeleton />
      </>,
    );

    expect(screen.getByText(/no routines/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      10,
    );

    await user.click(screen.getByRole("button", { name: /calendar/i }));
    expect(onChange).toHaveBeenCalledWith(ScheduleViewMode.Calendar);
  });
});

function scheduleSlot(): ScheduleSlot {
  return {
    id: "slot-1",
    dayOfWeek: DayOfWeek.Mon,
    slotTime: "08:00",
    mode: SlotMode.Manual,
    slotNotes: "AM routine",
    specialistProviderName: null,
    specialistClinicName: null,
    specialistActiveSince: null,
    specialistSafetyNotes: null,
    steps: [
      {
        id: "step-1",
        stepOrder: 0,
        inventoryProductId: "product-1",
        stepLabel: StepLabel.Cleanser,
        customLabel: null,
        notes: null,
        optional: false,
        isSpecialistLocked: false,
        product: null,
        createdAt: "2026-05-04T00:00:00.000Z",
        updatedAt: "2026-05-04T00:00:00.000Z",
      },
    ],
    createdAt: "2026-05-04T00:00:00.000Z",
    updatedAt: "2026-05-04T00:00:00.000Z",
  };
}
