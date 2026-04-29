import { resolveCanonicalTodayDate } from "@/components/skin-journal/journal-date";

describe("resolveCanonicalTodayDate", () => {
  it("uses the backend today date when it is available", () => {
    expect(resolveCanonicalTodayDate("2026-04-30", "2026-04-29")).toBe(
      "2026-04-30",
    );
  });

  it("falls back to the local date while the backend date is loading", () => {
    expect(resolveCanonicalTodayDate(undefined, "2026-04-29")).toBe(
      "2026-04-29",
    );
  });
});
