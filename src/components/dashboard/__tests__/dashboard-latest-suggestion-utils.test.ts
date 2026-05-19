import { pickDashboardLatestSlot } from "@/components/dashboard/dashboard-latest-suggestion-utils";
import type {
  SuggestionInstance,
  TodaysSuggestionResponse,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

describe("pickDashboardLatestSlot", () => {
  it("returns null when there is no response", () => {
    expect(pickDashboardLatestSlot(undefined)).toBeNull();
  });

  it("returns null when no slot is actionable", () => {
    const response = todaysResponse({
      slots: [
        slot({ status: "locked", isVisible: false, suggestion: null }),
        slot({
          slotId: "slot-recorded",
          status: "recorded",
          recording: recording(),
        }),
      ],
    });
    expect(pickDashboardLatestSlot(response)).toBeNull();
  });

  it("returns the earliest ready slot when several are actionable", () => {
    const response = todaysResponse({
      slots: [
        slot({ slotId: "morning", daypart: "morning", slotTime: "08:00" }),
        slot({
          slotId: "evening",
          daypart: "evening",
          slotTime: "21:00",
          status: "ready",
        }),
      ],
    });
    expect(pickDashboardLatestSlot(response)?.slotId).toBe("morning");
  });

  it("prefers a recordable slot over later ready slots", () => {
    const response = todaysResponse({
      slots: [
        slot({
          slotId: "morning-recordable",
          status: "recordable",
        }),
        slot({
          slotId: "noon-ready",
          daypart: "noon",
          slotTime: "13:00",
          status: "ready",
        }),
      ],
    });
    expect(pickDashboardLatestSlot(response)?.slotId).toBe(
      "morning-recordable",
    );
  });

  it("skips slots that are already recorded", () => {
    const response = todaysResponse({
      slots: [
        slot({
          slotId: "morning-done",
          status: "recorded",
          recording: recording(),
        }),
        slot({
          slotId: "noon-ready",
          daypart: "noon",
          slotTime: "13:00",
          status: "ready",
        }),
      ],
    });
    expect(pickDashboardLatestSlot(response)?.slotId).toBe("noon-ready");
  });

  it("skips slots whose suggestion is still generating", () => {
    const response = todaysResponse({
      slots: [
        slot({
          slotId: "morning-generating",
          status: "ready",
          suggestion: suggestionInstance({ generationStatus: "generating" }),
        }),
        slot({
          slotId: "noon-ready",
          daypart: "noon",
          slotTime: "13:00",
          status: "ready",
        }),
      ],
    });
    expect(pickDashboardLatestSlot(response)?.slotId).toBe("noon-ready");
  });

  it("skips slots that have an application log attached", () => {
    const response = todaysResponse({
      slots: [
        slot({
          slotId: "morning-logged",
          status: "ready",
          suggestion: suggestionInstance({ applicationLogId: "log-1" }),
        }),
        slot({
          slotId: "noon-ready",
          daypart: "noon",
          slotTime: "13:00",
          status: "ready",
        }),
      ],
    });
    expect(pickDashboardLatestSlot(response)?.slotId).toBe("noon-ready");
  });
});

function todaysResponse(
  partial: Partial<TodaysSuggestionResponse> = {},
): TodaysSuggestionResponse {
  return {
    date: "2026-05-04",
    timeZone: "UTC",
    generatedAt: "2026-05-04T06:00:00.000Z",
    leadTimeMinutes: 120,
    summary: {
      total: 0,
      locked: 0,
      upcoming: 0,
      ready: 0,
      recordable: 0,
      recorded: 0,
      edited: 0,
      failed: 0,
      onDemand: 0,
    },
    weatherSummary: null,
    environmentSummary: null,
    environmentAlerts: [],
    slots: [],
    onDemandSuggestions: [],
    reactionAlert: null,
    routineBreak: null,
    ...partial,
  };
}

function slot(
  partial: Partial<TodaysSuggestionSlot> = {},
): TodaysSuggestionSlot {
  return {
    slotId: "slot-1",
    daypart: "morning",
    slotTime: "08:00",
    mode: "ai",
    slotNotes: null,
    routineStepCount: 1,
    specialistLockedStepCount: 0,
    specialist: null,
    visibleAt: "2026-05-04T06:00:00.000Z",
    status: "ready",
    slotStartsAt: "2026-05-04T08:00:00.000Z",
    recordableAt: "2026-05-04T08:30:00.000Z",
    expiresAt: "2026-05-04T23:59:00.000Z",
    recording: null,
    recordingReminderSnoozedUntil: null,
    applicationLog: null,
    isVisible: true,
    suggestion: suggestionInstance(),
    ...partial,
  };
}

function suggestionInstance(
  partial: Partial<SuggestionInstance> = {},
): SuggestionInstance {
  return {
    id: "suggestion-1",
    slotId: "slot-1",
    requestSource: "scheduled",
    requestContext: null,
    targetDate: "2026-05-04",
    targetTime: "08:00",
    daypart: "morning",
    mode: "ai",
    generationStatus: "ready",
    visibleAt: "2026-05-04T06:00:00.000Z",
    generatedAt: "2026-05-04T06:05:00.000Z",
    aiModel: "gpt-4.1-mini",
    aiPromptVersion: "2026-05-03.v1",
    hasReactionSignal: false,
    simplifiedForReaction: false,
    rationaleHeadline: "Keep the routine light.",
    explanation: null,
    gapRecommendations: [],
    safetyFlags: [],
    inputTrace: null,
    evidenceSources: [],
    environmentSummary: null,
    productDataQuality: {
      verifiedCount: 0,
      partialCount: 0,
      insufficientCount: 0,
      warnings: [],
    },
    steps: [],
    applicationLogId: null,
    createdAt: "2026-05-04T06:00:00.000Z",
    updatedAt: "2026-05-04T06:00:00.000Z",
    ...partial,
  };
}

function recording() {
  return {
    applicationLogId: "log-1",
    appliedAt: "2026-05-04T08:05:00.000Z",
    hasBeenEdited: false,
    editCount: 0,
    lastEditedAt: null,
    appliedCount: 1,
    totalItems: 1,
  };
}
