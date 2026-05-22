import {
  DashboardGreetingKey,
  getDashboardGreetingKey,
  getDashboardSetupProgress,
  getTodayDateInTimeZone,
  isFreshDashboardAccount,
  shouldShowJournalPhotoNudge,
} from "@/components/dashboard/dashboard-logic";

describe("dashboard logic", () => {
  it("formats today in the user's time zone", () => {
    expect(
      getTodayDateInTimeZone(
        "America/Los_Angeles",
        "2026-05-20T06:30:00.000Z",
      ),
    ).toBe("2026-05-19");
  });

  it("builds the greeting key from the user's time zone", () => {
    expect(
      getDashboardGreetingKey(
        "America/Los_Angeles",
        "2026-05-20T16:30:00.000Z",
      ),
    ).toBe(DashboardGreetingKey.Morning);
    expect(
      getDashboardGreetingKey(
        "Europe/Stockholm",
        "2026-05-20T16:30:00.000Z",
      ),
    ).toBe(DashboardGreetingKey.Evening);
  });

  it("only shows the journal photo nudge after 08:00 in the user's time zone", () => {
    expect(
      shouldShowJournalPhotoNudge({
        hasPhoto: false,
        nowIso: "2026-05-20T14:30:00.000Z",
        timeZone: "America/Los_Angeles",
      }),
    ).toBe(false);
    expect(
      shouldShowJournalPhotoNudge({
        hasPhoto: false,
        nowIso: "2026-05-20T15:00:00.000Z",
        timeZone: "America/Los_Angeles",
      }),
    ).toBe(true);
    expect(
      shouldShowJournalPhotoNudge({
        hasPhoto: true,
        nowIso: "2026-05-20T15:00:00.000Z",
        timeZone: "America/Los_Angeles",
      }),
    ).toBe(false);
  });

  it("normalizes setup progress from profile, shelf, and routine data", () => {
    expect(
      getDashboardSetupProgress({
        scheduleSlots: [],
        shelfStats: { all: 0, archived: Number.NaN, expired: -1 },
        skinProfile: { skinType: "   " },
      }),
    ).toEqual({
      completedCount: 0,
      isComplete: false,
      profileDone: false,
      routineDone: false,
      shelfDone: false,
      totalCount: 3,
    });

    expect(
      getDashboardSetupProgress({
        scheduleSlots: [{ id: "slot-1" }],
        shelfStats: { all: 0, active: 2 },
        skinProfile: { skinType: "combination" },
      }),
    ).toEqual({
      completedCount: 3,
      isComplete: true,
      profileDone: true,
      routineDone: true,
      shelfDone: true,
      totalCount: 3,
    });
  });

  it("classifies fresh accounts without treating server errors as onboarding", () => {
    expect(
      isFreshDashboardAccount({
        isLoading: false,
        profileErrorStatus: 404,
        skinProfile: undefined,
      }),
    ).toBe(true);
    expect(
      isFreshDashboardAccount({
        isLoading: false,
        profileErrorStatus: undefined,
        skinProfile: { skinType: null },
      }),
    ).toBe(true);
    expect(
      isFreshDashboardAccount({
        isLoading: false,
        profileErrorStatus: 500,
        skinProfile: undefined,
      }),
    ).toBe(false);
    expect(
      isFreshDashboardAccount({
        isLoading: true,
        profileErrorStatus: 404,
        skinProfile: undefined,
      }),
    ).toBe(false);
  });
});
