import {
  buildLocalDateTimeIso,
  formatIsoTime12h,
  formatLocalTimeInput,
  formatRelativeUntil,
  formatSlotTime12h,
  suggestionDaypartToScheduleDaypart,
} from "@/lib/suggestion-daypart";

describe("suggestion-daypart utilities", () => {
  const realDateNow = Date.now;

  afterEach(() => {
    Date.now = realDateNow;
  });

  it("maps suggestion noon to the schedule afternoon bucket", () => {
    expect(suggestionDaypartToScheduleDaypart("morning")).toBe("morning");
    expect(suggestionDaypartToScheduleDaypart("noon")).toBe("afternoon");
    expect(suggestionDaypartToScheduleDaypart("evening")).toBe("evening");
  });

  it("formats slot and ISO times for the mockup labels", () => {
    expect(formatSlotTime12h("00:05")).toBe("12:05 AM");
    expect(formatSlotTime12h("12:30:00")).toBe("12:30 PM");
    expect(formatSlotTime12h("20:15")).toBe("8:15 PM");
    expect(formatSlotTime12h("not-a-time")).toBe("not-a-time");
    expect(formatIsoTime12h("not-an-iso")).toBe("not-an-iso");
  });

  it("builds local time input and local ISO timestamps", () => {
    expect(formatLocalTimeInput(new Date(2026, 4, 4, 6, 7))).toBe("06:07");
    expect(buildLocalDateTimeIso("2026-05-04", "08:30")).toContain(
      "2026-05-04",
    );
  });

  it("formats relative lock times without leaking negative durations", () => {
    Date.now = jest.fn(() => new Date("2026-05-04T06:00:00.000Z").getTime());

    expect(formatRelativeUntil("2026-05-04T06:00:00.000Z")).toBe("Now");
    expect(formatRelativeUntil("2026-05-04T06:25:00.000Z")).toBe("25m");
    expect(formatRelativeUntil("2026-05-04T08:05:00.000Z")).toBe("2h 5m");
  });
});
