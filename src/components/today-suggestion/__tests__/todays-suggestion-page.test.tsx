import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodaysSuggestionPage from "@/app/(app)/todays-suggestion/page";
import { renderWithProviders } from "@/test/utils";
import {
  EnvironmentAirQualityRisk,
  EnvironmentHumidityBand,
  EnvironmentProviderName,
  EnvironmentStatus,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
  type TodaysSuggestionEnvironmentSummary,
  type TodaysSuggestionResponse,
} from "@/types/suggestions";

const mockStartBreakMutate = jest.fn();
const mockCreateOnDemandMutate = jest.fn();
const mockUpdateAiConsentMutate = jest.fn();
const mockRouterPush = jest.fn();
let mockAiConsentGranted = true;
let mockTodayData: TodaysSuggestionResponse | null = null;

jest.mock("@/hooks/use-suggestions", () => ({
  useTodaysSuggestion: () => ({
    data: mockTodayData ?? mockTodayResponse(),
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useNormalRoutineToday: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateOnDemandSuggestion: () => ({
    mutate: mockCreateOnDemandMutate,
    isPending: false,
  }),
  useSuggestionAiConsent: () => ({
    data: {
      granted: mockAiConsentGranted,
      grantedAt: mockAiConsentGranted
        ? "2026-05-07T09:00:00.000Z"
        : null,
      canReadSensitiveContext: false,
      blockedReason: mockAiConsentGranted
        ? "sensitive_recommendation_context_consent_missing"
        : "ai_suggestion_processing_consent_missing",
      activeSensitiveConsentTypes: [],
    },
    isLoading: false,
  }),
  useUpdateSuggestionAiConsent: () => ({
    mutate: mockUpdateAiConsentMutate,
    isPending: false,
  }),
  useRegenerateSuggestion: () => ({ mutate: jest.fn(), isPending: false }),
  useResumeRoutineBreak: () => ({ mutate: jest.fn(), isPending: false }),
  useStartRoutineBreak: () => ({
    mutate: mockStartBreakMutate,
    isPending: false,
  }),
  useUpdateRoutineBreak: () => ({ mutate: jest.fn(), isPending: false }),
  useSnoozeRecordingReminder: () => ({ mutate: jest.fn(), isPending: false }),
  useRetryOnDemandSuggestion: () => ({ mutate: jest.fn(), isPending: false }),
  useRecordSuggestionGapAction: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/use-application-tracking", () => ({
  useApplicationLog: () => ({ data: null }),
  useRecordApplication: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => ({
    data: {
      city: "Stockholm",
      countryCode: "SE",
    },
    isLoading: false,
  }),
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: { user: { timeZone: string } }) => string) =>
    selector({ user: { timeZone: "Europe/Stockholm" } }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

describe("TodaysSuggestionPage routine break integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockAiConsentGranted = true;
    mockTodayData = null;
  });

  it("opens and submits the start-break dialog from the empty Today state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodaysSuggestionPage />);

    await user.click(screen.getByRole("button", { name: /take a break/i }));

    expect(
      screen.getByRole("heading", { name: /take a routine break/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start break/i }));

    expect(mockStartBreakMutate).toHaveBeenCalledWith(
      { endsAt: null },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("opens and submits the quick suggestion dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodaysSuggestionPage />);

    await user.click(
      screen.getByRole("button", { name: /quick suggestion/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /generate suggestion/i }),
    );

    expect(mockCreateOnDemandMutate).toHaveBeenCalledWith(
      {
        intent: "post_workout",
        intensity: "minimal",
        note: undefined,
        requestId: expect.any(String),
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("asks for AI consent before opening quick suggestions", async () => {
    mockAiConsentGranted = false;
    const user = userEvent.setup();
    renderWithProviders(<TodaysSuggestionPage />);

    await user.click(
      screen.getByRole("button", { name: /quick suggestion/i }),
    );
    expect(
      screen.getByRole("heading", { name: /allow ai suggestions/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /allow ai suggestions/i }),
    );

    expect(mockUpdateAiConsentMutate).toHaveBeenCalledWith(
      { granted: true },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(mockCreateOnDemandMutate).not.toHaveBeenCalled();
  });

  it("offers AI consent from Today for scheduled suggestions", async () => {
    mockAiConsentGranted = false;
    mockTodayData = mockTodayResponse({
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
      slots: [mockSlot()],
    });
    const user = userEvent.setup();
    renderWithProviders(<TodaysSuggestionPage />);

    expect(
      screen.getByText(/Personalized routines, made for your skin/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Basic suggestion/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /allow ai suggestions/i }),
    );

    expect(mockUpdateAiConsentMutate).toHaveBeenCalledWith(
      { granted: true },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("renders compact climate data beside today's summary pills", () => {
    mockTodayData = mockTodayResponse({
      timeZone: "Europe/Stockholm",
      generatedAt: "2026-05-08T20:30:00.000Z",
      environmentSummary: mockEnvironmentSummary(),
      slots: [mockSlot()],
    });

    renderWithProviders(<TodaysSuggestionPage />);

    expect(screen.getAllByText("Stockholm").length).toBeGreaterThan(0);
    expect(screen.getByText("Local time:")).toBeInTheDocument();
    expect(screen.getByText("City:")).toBeInTheDocument();
    expect(screen.queryByText("City-level")).not.toBeInTheDocument();
    expect(screen.queryByText("Spring")).not.toBeInTheDocument();
    expect(screen.getByText("Clear · 12°C")).toBeInTheDocument();
    expect(screen.getByText("UV 5 · moderate")).toBeInTheDocument();
    expect(screen.getByText("Balanced · 44% humidity")).toBeInTheDocument();
    expect(screen.queryByText("Good · AQI 22")).not.toBeInTheDocument();
    expect(screen.queryByText("PM2.5 6 µg/m³")).not.toBeInTheDocument();
    expect(screen.queryByText("PM10 12 µg/m³")).not.toBeInTheDocument();
  });
});

function mockTodayResponse(
  partial: Partial<TodaysSuggestionResponse> = {},
): TodaysSuggestionResponse {
  return {
    date: "2026-05-06",
    timeZone: "UTC",
    generatedAt: "2026-05-06T08:00:00.000Z",
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

function mockEnvironmentSummary(): TodaysSuggestionEnvironmentSummary {
  return {
    status: EnvironmentStatus.Available,
    provider: EnvironmentProviderName.OpenMeteo,
    generatedAt: "2026-05-08T20:00:00.000Z",
    locationPersonalized: true,
    season: "spring",
    temperatureCelsius: 12,
    temperatureBand: "mild",
    humidity: 44,
    humidityBand: EnvironmentHumidityBand.Balanced,
    uvIndex: 5,
    uvRisk: EnvironmentUvRisk.Moderate,
    airQualityIndex: 22,
    airQualityRisk: EnvironmentAirQualityRisk.Good,
    pm25: 6,
    pm10: 12,
    pollenRisk: null,
    conditionLabel: "Clear",
    waterHardness: EnvironmentWaterHardness.Moderate,
    waterSensitivity: EnvironmentWaterSensitivity.None,
    climateSensitivities: [],
    transitionSignals: [],
    confidence: "provider",
    stale: false,
    sourceIds: [],
  };
}

function mockSlot() {
  return {
    slotId: "slot-1",
    daypart: "morning" as const,
    slotTime: "08:00",
    mode: "ai" as const,
    slotNotes: null,
    routineStepCount: 1,
    specialistLockedStepCount: 0,
    specialist: null,
    visibleAt: "2026-05-06T06:00:00.000Z",
    status: "ready" as const,
    slotStartsAt: "2026-05-06T08:00:00.000Z",
    recordableAt: "2026-05-06T08:30:00.000Z",
    expiresAt: "2026-05-06T23:59:00.000Z",
    recording: null,
    recordingReminderSnoozedUntil: null,
    applicationLog: null,
    isVisible: true,
    suggestion: {
      id: "suggestion-1",
      slotId: "slot-1",
      requestSource: "scheduled" as const,
      requestContext: null,
      targetDate: "2026-05-06",
      targetTime: "08:00",
      daypart: "morning" as const,
      mode: "ai" as const,
      generationStatus: "ready" as const,
      visibleAt: "2026-05-06T06:00:00.000Z",
      generatedAt: "2026-05-06T06:05:00.000Z",
      aiModel: "deterministic-baseline:ai_suggestion_processing_consent_missing",
      aiPromptVersion: "2026-05-03.v1",
      hasReactionSignal: false,
      simplifiedForReaction: false,
      rationaleHeadline: "Safe basics today.",
      explanation: {
        headline: "Safe basics today.",
        body: ["Personalization is off, so this stays simple."],
        perStepReasons: [],
        skipped: [],
        inputs: [],
      },
      gapRecommendations: [],
      safetyFlags: [],
      inputTrace: null,
      evidenceSources: [],
      productDataQuality: {
        verifiedCount: 0,
        partialCount: 0,
        insufficientCount: 0,
        warnings: [],
      },
      steps: [],
      applicationLogId: null,
      createdAt: "2026-05-06T06:00:00.000Z",
      updatedAt: "2026-05-06T06:00:00.000Z",
    },
  };
}
