import {
  compareSlotsChrono,
  DayOfWeek,
  deriveDaypart,
  formatSlotTimeLabel,
  SlotMode,
  StepLabel,
  type ScheduleSlot,
} from "@/types/schedule";

function createSlot(
  id: string,
  dayOfWeek: DayOfWeek,
  slotTime: string,
): ScheduleSlot {
  return {
    id,
    dayOfWeek,
    slotTime,
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

describe("schedule type helpers", () => {
  it("derives dayparts from slot times", () => {
    expect(deriveDaypart("07:30")).toBe("morning");
    expect(deriveDaypart("12:00")).toBe("afternoon");
    expect(deriveDaypart("18:00")).toBe("evening");
    expect(deriveDaypart("bad-time")).toBe("evening");
  });

  it("formats slot labels and compares slots chronologically", () => {
    expect(formatSlotTimeLabel("08:45:30")).toBe("08:45");

    const mondayEvening = createSlot("slot-1", DayOfWeek.Mon, "21:00");
    const mondayMorning = createSlot("slot-2", DayOfWeek.Mon, "08:00");
    const tuesdayMorning = createSlot("slot-3", DayOfWeek.Tue, "08:00");

    expect(compareSlotsChrono(mondayMorning, mondayEvening)).toBeLessThan(0);
    expect(compareSlotsChrono(mondayEvening, mondayMorning)).toBeGreaterThan(0);
    expect(compareSlotsChrono(mondayMorning, tuesdayMorning)).toBeLessThan(0);
    expect(StepLabel.Cleanser).toBe("cleanser");
  });
});
