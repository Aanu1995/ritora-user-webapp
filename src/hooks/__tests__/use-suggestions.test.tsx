import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "@/test/utils";
import {
  getNextSuggestionHistoryPageParam,
  mergeSuggestionHistoryPages,
  useNormalRoutineToday,
  useRecordSuggestionGapAction,
  useRegenerateSuggestion,
  useSnoozeRecordingReminder,
  useSuggestion,
  useSuggestionHistory,
  useSuggestionHistoryDay,
  useTodaysSuggestion,
} from "@/hooks/use-suggestions";
import {
  getSuggestion,
  getSuggestionHistory,
  getSuggestionHistoryDay,
  getTodaysSuggestion,
  recordSuggestionGapAction,
  regenerateSuggestion,
  snoozeRecordingReminder,
  useNormalRoutineForToday,
} from "@/services/suggestions.service";
import type {
  SuggestionHistoryListResponse,
  SuggestionInstance,
  TodaysSuggestionResponse,
} from "@/types/suggestions";

jest.mock("@/hooks/use-auth-enabled", () => ({
  useAuthEnabled: () => true,
}));

jest.mock("@/services/suggestions.service", () => ({
  getTodaysSuggestion: jest.fn(),
  getSuggestion: jest.fn(),
  regenerateSuggestion: jest.fn(),
  useNormalRoutineForToday: jest.fn(),
  recordSuggestionGapAction: jest.fn(),
  snoozeRecordingReminder: jest.fn(),
  getSuggestionHistory: jest.fn(),
  getSuggestionHistoryDay: jest.fn(),
}));

const mockGetToday = getTodaysSuggestion as jest.MockedFunction<
  typeof getTodaysSuggestion
>;
const mockGetSuggestion = getSuggestion as jest.MockedFunction<
  typeof getSuggestion
>;
const mockRegenerate = regenerateSuggestion as jest.MockedFunction<
  typeof regenerateSuggestion
>;
const mockUseNormalRoutine = useNormalRoutineForToday as jest.MockedFunction<
  typeof useNormalRoutineForToday
>;
const mockRecordGapAction = recordSuggestionGapAction as jest.MockedFunction<
  typeof recordSuggestionGapAction
>;
const mockSnoozeReminder = snoozeRecordingReminder as jest.MockedFunction<
  typeof snoozeRecordingReminder
>;
const mockGetHistory = getSuggestionHistory as jest.MockedFunction<
  typeof getSuggestionHistory
>;
const mockGetHistoryDay = getSuggestionHistoryDay as jest.MockedFunction<
  typeof getSuggestionHistoryDay
>;

afterEach(() => {
  jest.clearAllMocks();
});

describe("suggestion hooks", () => {
  it("fetches today's suggestion and suggestion detail", async () => {
    mockGetToday.mockResolvedValue(todayResponse());
    mockGetSuggestion.mockResolvedValue(suggestionInstance());

    const today = renderHookWithProviders(() => useTodaysSuggestion());
    await waitFor(() => expect(today.result.current.isSuccess).toBe(true));
    expect(today.result.current.data?.date).toBe("2026-05-04");

    const detail = renderHookWithProviders(() => useSuggestion("suggestion-1"));
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
    expect(mockGetSuggestion).toHaveBeenCalledWith("suggestion-1");
  });

  it("runs regenerate through mutate and keeps history queries enabled", async () => {
    mockRegenerate.mockResolvedValue(suggestionInstance({ id: "suggestion-2" }));
    mockGetHistory.mockResolvedValue(historyResponse());
    mockGetHistoryDay.mockResolvedValue(historyResponse().days[0]!);

    const mutation = renderHookWithProviders(() => useRegenerateSuggestion());
    mutation.result.current.mutate({
      id: "suggestion-1",
      payload: { reason: "user_requested" },
    });

    await waitFor(() => expect(mockRegenerate).toHaveBeenCalled());
    expect(mockRegenerate).toHaveBeenCalledWith("suggestion-1", {
      reason: "user_requested",
    });

    const history = renderHookWithProviders(() =>
      useSuggestionHistory({ range: "7d" }),
    );
    await waitFor(() => expect(history.result.current.isSuccess).toBe(true));
    expect(mockGetHistory).toHaveBeenCalledWith({ range: "7d" });

    const day = renderHookWithProviders(() =>
      useSuggestionHistoryDay("2026-05-03"),
    );
    await waitFor(() => expect(day.result.current.isSuccess).toBe(true));
    expect(mockGetHistoryDay).toHaveBeenCalledWith("2026-05-03");
  });

  it("persists normal-routine override and gap actions through mutations", async () => {
    mockUseNormalRoutine.mockResolvedValue({
      targetDate: "2026-05-04",
      expiresAt: "2026-05-04T21:59:59.999Z",
      reactionEntryId: "entry-1",
    });
    mockRecordGapAction.mockResolvedValue({
      suggestionInstanceId: "suggestion-1",
      ingredientOrCategory: "Vitamin C serum",
      normalizedKey: "vitamin-c-serum",
      action: "saved",
    });
    mockSnoozeReminder.mockResolvedValue({
      suggestionInstanceId: "suggestion-1",
      snoozedUntil: "2026-05-04T11:00:00.000Z",
    });

    const normalRoutine = renderHookWithProviders(() =>
      useNormalRoutineToday(),
    );
    normalRoutine.result.current.mutate();
    await waitFor(() => expect(mockUseNormalRoutine).toHaveBeenCalled());

    const gapAction = renderHookWithProviders(() =>
      useRecordSuggestionGapAction(),
    );
    gapAction.result.current.mutate({
      suggestionInstanceId: "suggestion-1",
      ingredientOrCategory: "Vitamin C serum",
      action: "saved",
    });
    await waitFor(() => expect(mockRecordGapAction).toHaveBeenCalled());

    const snooze = renderHookWithProviders(() => useSnoozeRecordingReminder());
    snooze.result.current.mutate({
      suggestionInstanceId: "suggestion-1",
      minutes: 60,
    });
    await waitFor(() => expect(mockSnoozeReminder).toHaveBeenCalled());
  });

  it("passes backend history cursors through infinite pagination helpers", () => {
    expect(
      getNextSuggestionHistoryPageParam({
        ...historyResponse(),
        nextCursor: "cursor-2",
      }),
    ).toBe("cursor-2");

    expect(
      mergeSuggestionHistoryPages([
        {
          ...historyResponse({
            date: "2026-05-03",
            totalApplied: 1,
            totalSlots: 1,
          }),
          nextCursor: "cursor-2",
        },
        historyResponse({
          date: "2026-05-02",
          totalApplied: 0,
          totalSlots: 1,
        }),
      ]),
    ).toEqual(
      expect.objectContaining({
        nextCursor: null,
        totalApplied: 1,
        totalSlots: 2,
        adherencePercent: 50,
        days: expect.arrayContaining([
          expect.objectContaining({ date: "2026-05-03" }),
          expect.objectContaining({ date: "2026-05-02" }),
        ]),
      }),
    );
  });
});

function todayResponse(): TodaysSuggestionResponse {
  return {
    date: "2026-05-04",
    timeZone: "Europe/Stockholm",
    generatedAt: "2026-05-04T06:00:00.000Z",
    leadTimeMinutes: 120,
    summary: {
      total: 1,
      locked: 0,
      upcoming: 0,
      ready: 1,
      recordable: 0,
      recorded: 0,
      edited: 0,
      failed: 0,
    },
    weatherSummary: null,
    slots: [],
    reactionAlert: null,
  };
}

function historyResponse(
  overrides: {
    date?: string;
    totalApplied?: number;
    totalSlots?: number;
  } = {},
): SuggestionHistoryListResponse {
  return {
    days: [
      {
        date: overrides.date ?? "2026-05-03",
        weatherSummary: null,
        moodScore: null,
        hydrationTrend: null,
        reactionFlagged: false,
        photoEntryId: null,
        slots: [],
      },
    ],
    nextCursor: null,
    totalApplied: overrides.totalApplied ?? 0,
    totalSlots: overrides.totalSlots ?? 0,
    totalEdited: 0,
    adherencePercent: null,
  };
}

function suggestionInstance(
  partial: Partial<SuggestionInstance> = {},
): SuggestionInstance {
  return {
    id: "suggestion-1",
    slotId: "slot-1",
    targetDate: "2026-05-04",
    targetTime: "08:00",
    daypart: "morning",
    mode: "ai",
    generationStatus: "ready",
    visibleAt: "2026-05-04T04:00:00.000Z",
    generatedAt: "2026-05-04T04:00:00.000Z",
    aiModel: "gpt-4.1-mini",
    aiPromptVersion: "2026-05-03.v1",
    hasReactionSignal: false,
    simplifiedForReaction: false,
    rationaleHeadline: "Keep it simple today.",
    explanation: null,
    gapRecommendations: [],
    safetyFlags: [],
    inputTrace: null,
    evidenceSources: [],
    steps: [],
    applicationLogId: null,
    createdAt: "2026-05-04T04:00:00.000Z",
    updatedAt: "2026-05-04T04:00:00.000Z",
    ...partial,
  };
}
