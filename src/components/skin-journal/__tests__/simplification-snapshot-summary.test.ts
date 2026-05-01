import { summarizeScheduleSnapshot } from "../simplification-snapshot-summary";

describe("summarizeScheduleSnapshot", () => {
  it("summarizes the captured routine without exposing raw snapshot details", () => {
    const summary = summarizeScheduleSnapshot({
      captured_at: "2026-05-01T08:00:00.000Z",
      slots: [
        {
          id: "slot-1",
          slot_notes: "private note",
          steps: [{ id: "step-1" }, { id: "step-2" }],
        },
        {
          id: "slot-2",
          steps: [{ id: "step-3" }],
        },
      ],
    });

    expect(summary).toEqual({
      capturedAt: "2026-05-01T08:00:00.000Z",
      slotCount: 2,
      stepCount: 3,
    });
    expect(JSON.stringify(summary)).not.toContain("private note");
  });

  it("rejects unsupported snapshot shapes", () => {
    expect(summarizeScheduleSnapshot(null)).toBeNull();
    expect(summarizeScheduleSnapshot({ captured_at: "2026-05-01" })).toBeNull();
  });
});
