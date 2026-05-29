import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "@/test/utils";
import {
  getTodaysSuggestionRefetchInterval,
  getNextSuggestionHistoryPageParam,
  mergeSuggestionHistoryPages,
  useNormalRoutineToday,
  useCreateOnDemandSuggestion,
  useSuggestionAiConsent,
  useRecordSuggestionGapAction,
  useRegenerateSuggestion,
  useResumeRoutineBreak,
  useRetryOnDemandSuggestion,
  useSnoozeRecordingReminder,
  useStartRoutineBreak,
  useSuggestion,
  useSuggestionHistory,
  useSuggestionHistoryDay,
  useRoutineBreak,
  useUpdateRoutineBreak,
  useUpdateSuggestionAiConsent,
  useTodaysSuggestion,
} from "@/hooks/use-suggestions";
import {
  getRoutineBreak,
  getSuggestion,
  getSuggestionAiConsent,
  getSuggestionHistory,
  getSuggestionHistoryDay,
  getTodaysSuggestion,
  createOnDemandSuggestion,
  recordSuggestionGapAction,
  regenerateSuggestion,
  resumeRoutineBreak,
  retryOnDemandSuggestion,
  snoozeRecordingReminder,
  startRoutineBreak,
  updateSuggestionAiConsent,
  updateRoutineBreak,
  useNormalRoutineForToday,
} from "@/services/suggestions.service";
import {
  EnvironmentAirQualityRisk,
  EnvironmentHumidityBand,
  EnvironmentProviderName,
  EnvironmentStatus,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/environment-suggestions";
import type {
  SuggestionAiConsent,
  SuggestionHistoryListResponse,
  SuggestionInstance,
  TodaysSuggestionResponse,
} from "@/types/suggestions";

jest.mock("@/hooks/use-auth-enabled", () => ({
  useAuthEnabled: () => true,
}));

jest.mock("@/services/suggestions.service", () => ({
  getTodaysSuggestion: jest.fn(),
  createOnDemandSuggestion: jest.fn(),
  retryOnDemandSuggestion: jest.fn(),
  getSuggestionAiConsent: jest.fn(),
  updateSuggestionAiConsent: jest.fn(),
  getRoutineBreak: jest.fn(),
  getSuggestion: jest.fn(),
  regenerateSuggestion: jest.fn(),
  startRoutineBreak: jest.fn(),
  resumeRoutineBreak: jest.fn(),
  updateRoutineBreak: jest.fn(),
  useNormalRoutineForToday: jest.fn(),
  recordSuggestionGapAction: jest.fn(),
  snoozeRecordingReminder: jest.fn(),
  getSuggestionHistory: jest.fn(),
  getSuggestionHistoryDay: jest.fn(),
}));

const mockGetToday = getTodaysSuggestion as jest.MockedFunction<
  typeof getTodaysSuggestion
>;
const mockGetRoutineBreak = getRoutineBreak as jest.MockedFunction<
  typeof getRoutineBreak
>;
const mockGetSuggestion = getSuggestion as jest.MockedFunction<
  typeof getSuggestion
>;
const mockCreateOnDemand = createOnDemandSuggestion as jest.MockedFunction<
  typeof createOnDemandSuggestion
>;
const mockRetryOnDemand = retryOnDemandSuggestion as jest.MockedFunction<
  typeof retryOnDemandSuggestion
>;
const mockGetAiConsent = getSuggestionAiConsent as jest.MockedFunction<
  typeof getSuggestionAiConsent
>;
const mockUpdateAiConsent = updateSuggestionAiConsent as jest.MockedFunction<
  typeof updateSuggestionAiConsent
>;
const mockRegenerate = regenerateSuggestion as jest.MockedFunction<
  typeof regenerateSuggestion
>;
const mockUseNormalRoutine = useNormalRoutineForToday as jest.MockedFunction<
  typeof useNormalRoutineForToday
>;
const mockStartRoutineBreak = startRoutineBreak as jest.MockedFunction<
  typeof startRoutineBreak
>;
const mockResumeRoutineBreak = resumeRoutineBreak as jest.MockedFunction<
  typeof resumeRoutineBreak
>;
const mockUpdateRoutineBreak = updateRoutineBreak as jest.MockedFunction<
  typeof updateRoutineBreak
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
    expect(mockGetSuggestion).toHaveBeenCalledWith(
      "suggestion-1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("runs regenerate through mutate and keeps history queries enabled", async () => {
    mockRegenerate.mockResolvedValue(
      suggestionInstance({ id: "suggestion-2" }),
    );
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
    expect(mockGetHistory).toHaveBeenCalledWith(
      { range: "7d" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    const day = renderHookWithProviders(() =>
      useSuggestionHistoryDay("2026-05-03"),
    );
    await waitFor(() => expect(day.result.current.isSuccess).toBe(true));
    expect(mockGetHistoryDay).toHaveBeenCalledWith(
      "2026-05-03",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("queues on-demand suggestions through mutate", async () => {
    mockCreateOnDemand.mockResolvedValue(
      suggestionInstance({
        id: "suggestion-on-demand-1",
        slotId: null,
        requestSource: "on_demand",
      }),
    );

    const mutation = renderHookWithProviders(() =>
      useCreateOnDemandSuggestion(),
    );
    mutation.result.current.mutate({
      intent: "post_workout",
      intensity: "minimal",
      note: "Back from training.",
      requestId: "quick-20260506",
    });

    await waitFor(() => expect(mockCreateOnDemand).toHaveBeenCalled());
    expect(mockCreateOnDemand).toHaveBeenCalledWith({
      intent: "post_workout",
      intensity: "minimal",
      note: "Back from training.",
      requestId: "quick-20260506",
    });
  });

  it("fetches and updates AI suggestion consent", async () => {
    mockGetAiConsent.mockResolvedValue(aiConsent({ granted: false }));
    mockUpdateAiConsent.mockResolvedValue(
      aiConsent({
        granted: true,
        grantedAt: "2026-05-07T09:00:00.000Z",
      }),
    );

    const state = renderHookWithProviders(() => useSuggestionAiConsent());
    await waitFor(() => expect(state.result.current.isSuccess).toBe(true));
    expect(mockGetAiConsent).toHaveBeenCalledTimes(1);

    const mutation = renderHookWithProviders(() =>
      useUpdateSuggestionAiConsent(),
    );
    mutation.result.current.mutate({ granted: true });
    await waitFor(() => expect(mockUpdateAiConsent).toHaveBeenCalled());
    expect(mockUpdateAiConsent).toHaveBeenCalledWith({ granted: true });
  });

  it("retries failed on-demand suggestions through mutate", async () => {
    mockRetryOnDemand.mockResolvedValue(
      suggestionInstance({
        id: "suggestion-on-demand-1",
        slotId: null,
        requestSource: "on_demand",
      }),
    );

    const mutation = renderHookWithProviders(() =>
      useRetryOnDemandSuggestion(),
    );
    mutation.result.current.mutate("suggestion-on-demand-1");

    await waitFor(() => expect(mockRetryOnDemand).toHaveBeenCalled());
    expect(mockRetryOnDemand).toHaveBeenCalledWith("suggestion-on-demand-1");
  });

  it("polls every 15 seconds while a suggestion is generating", () => {
    expect(getTodaysSuggestionRefetchInterval(undefined)).toBe(false);
    expect(getTodaysSuggestionRefetchInterval(todayResponse())).toBe(false);
    expect(
      getTodaysSuggestionRefetchInterval({
        ...todayResponse(),
        onDemandSuggestions: [
          {
            id: "on-demand-generating",
            status: "generating",
            requestedAt: "2026-05-04T10:00:00.000Z",
            recording: null,
            applicationLog: null,
            suggestion: suggestionInstance({
              id: "on-demand-generating",
              slotId: null,
              requestSource: "on_demand",
              generationStatus: "generating",
            }),
          },
        ],
      }),
    ).toBe(15_000);
  });

  it("polls only until the next locked slot becomes visible", () => {
    expect(
      getTodaysSuggestionRefetchInterval(
        {
          ...todayResponse(),
          slots: [
            todaySlot({
              slotId: "slot-locked",
              status: "locked",
              visibleAt: "2026-05-04T10:00:20.000Z",
            }),
          ],
        },
        Date.parse("2026-05-04T10:00:00.000Z"),
      ),
    ).toBe(20_000);
    expect(
      getTodaysSuggestionRefetchInterval(
        {
          ...todayResponse(),
          slots: [
            todaySlot({
              slotId: "slot-elapsed",
              status: "missed",
              visibleAt: "2026-05-04T08:00:00.000Z",
            }),
          ],
        },
        Date.parse("2026-05-04T10:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("refreshes Today when environment context reaches the one-hour cache window", () => {
    const withEnvironment = {
      ...todayResponse(),
      environmentSummary: environmentSummary({
        generatedAt: "2026-05-04T10:00:00.000Z",
      }),
    };

    expect(
      getTodaysSuggestionRefetchInterval(
        withEnvironment,
        Date.parse("2026-05-04T10:30:00.000Z"),
      ),
    ).toBe(30 * 60_000);
    expect(
      getTodaysSuggestionRefetchInterval(
        withEnvironment,
        Date.parse("2026-05-04T10:59:57.000Z"),
      ),
    ).toBe(5_000);
    expect(
      getTodaysSuggestionRefetchInterval(
        withEnvironment,
        Date.parse("2026-05-04T11:00:00.000Z"),
      ),
    ).toBe(5_000);
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

  it("fetches and mutates routine break state", async () => {
    mockGetRoutineBreak.mockResolvedValue({ routineBreak: null });
    mockStartRoutineBreak.mockResolvedValue({ routineBreak: null });
    mockResumeRoutineBreak.mockResolvedValue({ routineBreak: null });
    mockUpdateRoutineBreak.mockResolvedValue({ routineBreak: null });

    const state = renderHookWithProviders(() => useRoutineBreak());
    await waitFor(() => expect(state.result.current.isSuccess).toBe(true));
    expect(mockGetRoutineBreak).toHaveBeenCalled();

    const start = renderHookWithProviders(() => useStartRoutineBreak());
    start.result.current.mutate({
      endsAt: "2026-05-07T08:00:00.000Z",
      reason: "Travel",
    });
    await waitFor(() => expect(mockStartRoutineBreak).toHaveBeenCalled());

    const resume = renderHookWithProviders(() => useResumeRoutineBreak());
    resume.result.current.mutate();
    await waitFor(() => expect(mockResumeRoutineBreak).toHaveBeenCalled());

    const update = renderHookWithProviders(() => useUpdateRoutineBreak());
    update.result.current.mutate({ id: "break-1", payload: { endsAt: null } });
    await waitFor(() => expect(mockUpdateRoutineBreak).toHaveBeenCalled());
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
      onDemand: 0,
    },
    weatherSummary: null,
    environmentSummary: null,
    environmentAlerts: [],
    slots: [],
    onDemandSuggestions: [],
    reactionAlert: null,
    routineBreak: null,
  };
}

function todaySlot(
  partial: Partial<TodaysSuggestionResponse["slots"][number]> = {},
): TodaysSuggestionResponse["slots"][number] {
  return {
    slotId: "slot-1",
    daypart: "morning",
    slotTime: "08:00",
    mode: "ai",
    slotNotes: null,
    routineStepCount: 0,
    specialistLockedStepCount: 0,
    specialist: null,
    visibleAt: "2026-05-04T06:00:00.000Z",
    status: "locked",
    slotStartsAt: "2026-05-04T08:00:00.000Z",
    recordableAt: "2026-05-04T08:30:00.000Z",
    expiresAt: "2026-05-04T21:59:59.999Z",
    recording: null,
    recordingReminderSnoozedUntil: null,
    applicationLog: null,
    isVisible: false,
    suggestion: null,
    ...partial,
  };
}

function environmentSummary(
  partial: Partial<TodaysSuggestionEnvironmentSummary> = {},
): TodaysSuggestionEnvironmentSummary {
  return {
    status: EnvironmentStatus.Available,
    provider: EnvironmentProviderName.OpenMeteo,
    generatedAt: "2026-05-04T10:00:00.000Z",
    locationPersonalized: true,
    season: "spring",
    temperatureCelsius: 14,
    temperatureBand: "mild",
    humidity: 42,
    humidityBand: EnvironmentHumidityBand.Balanced,
    uvIndex: 5,
    uvRisk: EnvironmentUvRisk.Moderate,
    airQualityIndex: 24,
    airQualityRisk: EnvironmentAirQualityRisk.Good,
    pm25: 5,
    pm10: 12,
    pollenRisk: null,
    conditionLabel: "Clear",
    waterHardness: EnvironmentWaterHardness.Unknown,
    waterSensitivity: EnvironmentWaterSensitivity.None,
    climateSensitivities: [],
    transitionSignals: [],
    confidence: "provider",
    stale: false,
    sourceIds: [],
    ...partial,
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
        environmentSummary: null,
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

function aiConsent(
  partial: Partial<SuggestionAiConsent> = {},
): SuggestionAiConsent {
  return {
    granted: false,
    grantedAt: null,
    canReadSensitiveContext: false,
    blockedReason: "ai_suggestion_processing_consent_missing",
    activeSensitiveConsentTypes: [],
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
    environmentSummary: null,
    productDataQuality: {
      verifiedCount: 0,
      partialCount: 0,
      insufficientCount: 0,
      warnings: [],
    },
    steps: [],
    applicationLogId: null,
    createdAt: "2026-05-04T04:00:00.000Z",
    updatedAt: "2026-05-04T04:00:00.000Z",
    ...partial,
  };
}
