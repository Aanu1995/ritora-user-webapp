import {
  shouldPollCalendar,
  shouldPollDay,
} from "@/hooks/use-skin-journal";
import type {
  AnalysisStatus,
  CalendarDay,
  CalendarPayload,
  DayDetail,
} from "@/types/skin-journal";

function calendarDay(status: AnalysisStatus | null): CalendarDay {
  return {
    date: "2026-04-29",
    state: status === "failed" ? "failed" : "pending",
    entry_id: status ? "entry-1" : null,
    has_photo: !!status,
    has_reaction: false,
    has_insight: false,
    thumbnail_url: null,
    analysis_status: status,
  };
}

describe("Skin Journal polling helpers", () => {
  it.each<AnalysisStatus>(["pending", "running", "queued"])(
    "polls calendar and day detail while analysis is %s",
    (status) => {
      const calendar: CalendarPayload = {
        month: "2026-04",
        days: [calendarDay(status)],
      };
      const day = {
        date: "2026-04-29",
        entry: { analysis_status: status },
        events: [],
        insights: [],
      } as DayDetail;

      expect(shouldPollCalendar(calendar)).toBe(true);
      expect(shouldPollDay(day)).toBe(true);
    },
  );

  it("does not poll completed or empty analysis states", () => {
    const calendar: CalendarPayload = {
      month: "2026-04",
      days: [calendarDay("completed"), calendarDay(null)],
    };
    const day = {
      date: "2026-04-29",
      entry: { analysis_status: "completed" },
      events: [],
      insights: [],
    } as DayDetail;

    expect(shouldPollCalendar(calendar)).toBe(false);
    expect(shouldPollDay(day)).toBe(false);
    expect(shouldPollDay(null)).toBe(false);
  });
});
