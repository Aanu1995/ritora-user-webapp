import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import { HistoryDayCard } from "@/components/history/history-day-card";
import { HistoryDayDetailSkeleton } from "@/components/history/history-day-detail-skeleton";
import { HistoryDaySlotCompare } from "@/components/history/history-day-slot-compare";
import { HistoryExportButton } from "@/components/history/history-export-button";
import { HistoryFilterBar } from "@/components/history/history-filter-bar";
import { HistoryListSkeleton } from "@/components/history/history-list-skeleton";
import { HistorySummaryStrip } from "@/components/history/history-summary-strip";
import { exportSuggestionHistoryCsv } from "@/services/suggestions.service";
import {
  EnvironmentAirQualityRisk,
  EnvironmentProviderName,
  EnvironmentStatus,
  EnvironmentUvRisk,
  EnvironmentWaterHardness,
  EnvironmentWaterSensitivity,
  type SuggestionHistoryDay,
  type SuggestionHistorySlotSummary,
  type SuggestionInstance,
  type SuggestionStep,
  type TodaysSuggestionEnvironmentSummary,
} from "@/types/suggestions";
import type {
  ApplicationLog,
  ApplicationLogItem,
} from "@/types/application-tracking";

jest.mock("@/services/suggestions.service", () => ({
  exportSuggestionHistoryCsv: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockExportSuggestionHistoryCsv =
  exportSuggestionHistoryCsv as jest.MockedFunction<
    typeof exportSuggestionHistoryCsv
  >;

describe("history suggestion components", () => {
  beforeEach(() => {
    mockExportSuggestionHistoryCsv.mockResolvedValue(
      new Blob(["Date\n"], { type: "text/csv" }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders only provided suggestion days with status pills", () => {
    renderWithProviders(<HistoryDayCard day={historyDay()} />);

    expect(screen.getByText(/cleanser applied/i)).toBeInTheDocument();
    expect(screen.getAllByText(/applied/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/edited/i)).toBeInTheDocument();
    expect(screen.getAllByText(/partial/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/simplified/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/missed/i).length).toBeGreaterThan(0);
  });

  it("renders history loading skeletons without user-visible copy", () => {
    const { container } = renderWithProviders(
      <>
        <HistoryListSkeleton />
        <HistoryDayDetailSkeleton />
      </>,
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      20,
    );
    expect(screen.queryByText(/suggested/i)).not.toBeInTheDocument();
  });

  it("renders suggested-vs-applied comparison and edit callback", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onShowDetail = jest.fn();

    const { container } = renderWithProviders(
      <CompareHarness
        slot={historyDay().slots[0]!}
        onEdit={onEdit}
        onShowDetail={onShowDetail}
      />,
    );

    expect(screen.getAllByText(/Suggested/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Applied/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Substitute serum/i)).toBeInTheDocument();
    expect(screen.getByText(/Ran out of original/i)).toBeInTheDocument();
    expect(screen.getByText(/8:42 AM/i)).toBeInTheDocument();
    expect(screen.queryByText(/same record your AI saw/i)).not.toBeInTheDocument();
    expect(screen.getByText("Cloudy · 11°C")).toBeInTheDocument();
    expect(screen.getByText("UV 3 · moderate")).toBeInTheDocument();
    expect(
      container.querySelector('img[src*="history-cleanser.webp"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('img[src*="history-substitute.webp"]'),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /why this routine/i }),
    ).not.toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: /edit record/i });
    expect(editButton).toHaveClass("min-w-32");
    expect(editButton.parentElement).toHaveClass("justify-end", "sm:ml-auto");

    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        slotId: "slot-1",
        status: "edited",
      }),
      expect.objectContaining({ id: "log-1" }),
    );
  });

  it("lets users record a missed history suggestion inside the 24-hour window", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onRecord = jest.fn();
    const missedSlot = historySlot({
      slotId: "slot-late",
      suggestionId: "suggestion-late",
      applicationLogId: null,
      daypart: "evening",
      slotTime: "22:30",
      appliedCount: 0,
      status: "missed",
      hasBeenEdited: false,
      summaryLine: "Late routine was not recorded.",
      suggestion: suggestionInstance({
        id: "suggestion-late",
        slotId: "slot-late",
        targetTime: "22:30",
        daypart: "evening",
        applicationLogId: null,
      }),
      applicationLog: null,
    });

    renderWithProviders(
      <CompareHarness
        slot={missedSlot}
        onEdit={onEdit}
        onRecord={onRecord}
        nowMs={new Date("2026-05-04T21:29:00").getTime()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /record what i applied/i }),
    );

    expect(onRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        slotId: "slot-late",
        status: "recordable",
        recording: null,
        applicationLog: null,
        expiresAt: "2026-05-04T22:30:00",
      }),
    );
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("does not show a history record action when the suggestion has no steps", () => {
    const onEdit = jest.fn();
    const onRecord = jest.fn();
    const emptyStepSlot = historySlot({
      slotId: "slot-empty",
      suggestionId: "suggestion-empty",
      applicationLogId: null,
      daypart: "evening",
      slotTime: "22:30",
      appliedCount: 0,
      totalSteps: 0,
      status: "missed",
      hasBeenEdited: false,
      summaryLine: "No routine steps were suggested.",
      suggestion: suggestionInstance({
        id: "suggestion-empty",
        slotId: "slot-empty",
        targetTime: "22:30",
        daypart: "evening",
        applicationLogId: null,
        steps: [],
      }),
      applicationLog: null,
    });

    renderWithProviders(
      <CompareHarness
        slot={emptyStepSlot}
        onEdit={onEdit}
        onRecord={onRecord}
        nowMs={new Date("2026-05-04T21:29:00").getTime()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /record what i applied/i }),
    ).not.toBeInTheDocument();
  });

  it("hides history record and edit actions after the 24-hour window", () => {
    const onEdit = jest.fn();
    const onRecord = jest.fn();

    renderWithProviders(
      <CompareHarness
        slot={historyDay().slots[0]!}
        onEdit={onEdit}
        onRecord={onRecord}
        nowMs={new Date("2026-05-04T08:01:00").getTime()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /edit record/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /record what i applied/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/same record your AI saw/i)).toBeInTheDocument();
  });

  it("shows edited counts in the history summary strip", () => {
    renderWithProviders(
      <HistorySummaryStrip
        applied={4}
        edited={2}
        total={5}
        adherencePercent={80}
      />,
    );

    expect(screen.getByText(/4 of 5 applied/i)).toBeInTheDocument();
    expect(screen.getByText(/2 edited/i)).toBeInTheDocument();
    expect(screen.getByText(/80% adherence/i)).toBeInTheDocument();
  });

  it("exports all matching history filters as a backend CSV file", async () => {
    const user = userEvent.setup();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: jest.fn(() => "blob:history"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: jest.fn(),
    });
    const createObjectURL = jest
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:history");
    const revokeObjectURL = jest
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    renderWithProviders(
      <HistoryExportButton
        query={{
          range: "custom",
          fromDate: "2026-05-01",
          toDate: "2026-05-04",
          mode: "mixed",
          cursor: "visible-page-cursor",
          limit: 10,
        }}
        disabled={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /export/i }));
    expect(mockExportSuggestionHistoryCsv).toHaveBeenCalledWith({
      range: "custom",
      fromDate: "2026-05-01",
      toDate: "2026-05-04",
      mode: "mixed",
      cursor: "visible-page-cursor",
      limit: 10,
    });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:history");

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });

  it("shows an export failure toast when the backend export fails", async () => {
    const user = userEvent.setup();
    mockExportSuggestionHistoryCsv.mockRejectedValue(new Error("nope"));

    renderWithProviders(
      <HistoryExportButton query={{ range: "7d" }} disabled={false} />,
    );

    await user.click(screen.getByRole("button", { name: /export/i }));
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/export/i));
  });

  it("updates history filters without fetching scheduled-only days", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <HistoryFilterBar
        value={{
          range: "custom",
          fromDate: "2026-05-01",
          toDate: "2026-05-04",
        }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText(/May 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /date range/i }));
    await user.click(await screen.findByRole("button", { name: /30 days/i }));
    await user.click(screen.getByRole("button", { name: /time of day/i }));
    await user.click(await screen.findByRole("button", { name: /morning/i }));
    await user.click(screen.getByRole("button", { name: /routine type/i }));
    await user.click(await screen.findByRole("button", { name: /mixed/i }));
    await user.click(screen.getByRole("button", { name: /source/i }));
    await user.click(await screen.findByRole("button", { name: /on-demand/i }));
    await user.click(screen.getByRole("button", { name: /edited/i }));

    expect(onChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ range: "30d" }),
    );
    expect(onChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ daypart: "morning" }),
    );
    expect(onChange).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ mode: "mixed" }),
    );
    expect(onChange).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ requestSource: "on_demand" }),
    );
    expect(onChange).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({ hasBeenEdited: true }),
    );
  });
});

function CompareHarness({
  slot,
  onEdit,
  onRecord,
  onShowDetail,
  nowMs = new Date("2026-05-03T10:00:00").getTime(),
}: {
  slot: SuggestionHistorySlotSummary;
  onEdit: Parameters<typeof HistoryDaySlotCompare>[0]["onEdit"];
  onRecord?: Parameters<typeof HistoryDaySlotCompare>[0]["onRecord"];
  onShowDetail?: Parameters<typeof HistoryDaySlotCompare>[0]["onShowDetail"];
  nowMs?: number;
}) {
  const tSummary = useTranslations("history.dayCard");
  return (
    <HistoryDaySlotCompare
      slot={slot}
      date="2026-05-03"
      tSummary={tSummary}
      onEdit={onEdit}
      onRecord={onRecord}
      onShowDetail={onShowDetail}
      nowMs={nowMs}
    />
  );
}

function historyDay(): SuggestionHistoryDay {
  return {
    date: "2026-05-03",
    weatherSummary: {
      temperatureCelsius: 15,
      uvIndex: 4,
      humidity: 60,
      conditionLabel: "Cloudy",
    },
    environmentSummary: null,
    moodScore: 4,
    hydrationTrend: "up",
    reactionFlagged: true,
    photoEntryId: "journal-1",
    slots: [
      historySlot({
        status: "applied",
        hasBeenEdited: true,
        summaryLine: "Cleanser applied, serum substituted.",
      }),
      historySlot({
        slotId: "slot-2",
        suggestionId: "suggestion-2",
        applicationLogId: null,
        daypart: "noon",
        slotTime: "13:00",
        status: "partial",
        hasBeenEdited: false,
        summaryLine: "Partial sunscreen reminder.",
        suggestion: suggestionInstance({ id: "suggestion-2", daypart: "noon" }),
        applicationLog: null,
      }),
      historySlot({
        slotId: "slot-3",
        suggestionId: "suggestion-3",
        applicationLogId: null,
        daypart: "evening",
        slotTime: "20:00",
        status: "simplified",
        hasBeenEdited: false,
        summaryLine: "Simplified barrier routine.",
        suggestion: suggestionInstance({
          id: "suggestion-3",
          daypart: "evening",
          simplifiedForReaction: true,
        }),
        applicationLog: null,
      }),
      historySlot({
        slotId: "slot-4",
        suggestionId: "suggestion-4",
        applicationLogId: null,
        daypart: "evening",
        slotTime: "22:00",
        status: "missed",
        hasBeenEdited: false,
        summaryLine: "Missed record.",
        suggestion: suggestionInstance({ id: "suggestion-4" }),
        applicationLog: null,
      }),
    ],
  };
}

function historySlot(
  partial: Partial<SuggestionHistorySlotSummary> = {},
): SuggestionHistorySlotSummary {
  return {
    slotId: "slot-1",
    suggestionId: "suggestion-1",
    applicationLogId: "log-1",
    requestSource: "scheduled",
    onDemandIntent: null,
    daypart: "morning",
    slotTime: "08:00",
    mode: "ai",
    appliedCount: 2,
    totalSteps: 3,
    status: "applied",
    hasBeenEdited: true,
    summaryLine: "Cleanser applied, serum substituted.",
    suggestion: suggestionInstance(),
    applicationLog: applicationLog(),
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
    targetDate: "2026-05-03",
    targetTime: "08:00",
    daypart: "morning",
    mode: "ai",
    generationStatus: "ready",
    visibleAt: "2026-05-03T06:00:00.000Z",
    generatedAt: "2026-05-03T06:05:00.000Z",
    aiModel: "gpt-4.1-mini",
    aiPromptVersion: "2026-05-03.v1",
    hasReactionSignal: false,
    simplifiedForReaction: false,
    rationaleHeadline: "Hydration focus.",
    explanation: null,
    gapRecommendations: [],
    safetyFlags: [],
    inputTrace: null,
    evidenceSources: [],
    environmentSummary: environmentSummary(),
    productDataQuality: {
      verifiedCount: 0,
      partialCount: 0,
      insufficientCount: 0,
      warnings: [],
    },
    steps: [
      suggestionStep(),
      suggestionStep({
        id: "step-2",
        stepOrder: 1,
        productName: "Original serum",
        product: {
          id: "product-2",
          brand: "Ava Lab",
          name: "Original serum",
          category: "serum",
          imageUrl: "/history-substitute.webp",
          status: "active",
        },
      }),
    ],
    applicationLogId: "log-1",
    createdAt: "2026-05-03T06:00:00.000Z",
    updatedAt: "2026-05-03T06:00:00.000Z",
    ...partial,
  };
}

function environmentSummary(
  partial: Partial<TodaysSuggestionEnvironmentSummary> = {},
): TodaysSuggestionEnvironmentSummary {
  return {
    status: EnvironmentStatus.Available,
    provider: EnvironmentProviderName.OpenMeteo,
    generatedAt: "2026-05-03T06:05:00.000Z",
    locationPersonalized: true,
    season: "spring",
    temperatureCelsius: 11,
    temperatureBand: "mild",
    humidity: null,
    humidityBand: null,
    uvIndex: 3,
    uvRisk: EnvironmentUvRisk.Moderate,
    airQualityIndex: null,
    airQualityRisk: EnvironmentAirQualityRisk.Unknown,
    pm25: null,
    pm10: null,
    pollenRisk: null,
    conditionLabel: "Cloudy",
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

function suggestionStep(partial: Partial<SuggestionStep> = {}): SuggestionStep {
  return {
    id: "step-1",
    stepOrder: 0,
    routineStepId: null,
    inventoryProductId: "product-1",
    productBrand: "Ava Lab",
    productName: "Gel Cleanser",
    stepLabel: "cleanser",
    customLabel: null,
    applicationMethod: "fingertips",
    quantity: "pea-size",
    waitAfterMinutes: null,
    explanation: null,
    provenance: "ai_added",
    chips: [],
    safetyWarnings: [],
    routineNote: null,
    product: {
      id: "product-1",
      brand: "Ava Lab",
      name: "Gel Cleanser",
      category: "cleanser",
          imageUrl: "/history-substitute.webp",
      status: "active",
    },
    ...partial,
  };
}

function applicationLog(): ApplicationLog {
  return {
    id: "log-1",
    suggestionInstanceId: "suggestion-1",
    slotId: "slot-1",
    targetDate: "2026-05-03",
    targetTime: "08:00",
    daypart: "morning",
    appliedAt: "2026-05-03T08:05:00.000Z",
    generalNotes: null,
    editReason: "Corrected substitution.",
    editCount: 1,
    hasBeenEdited: true,
    firstRecordedAt: "2026-05-03T08:05:00.000Z",
    lastEditedAt: "2026-05-03T08:10:00.000Z",
    items: [
      applicationItem({ id: "item-1", status: "applied" }),
      applicationItem({
        id: "item-2",
        stepOrder: 1,
        status: "substituted",
        appliedAt: new Date(2026, 4, 3, 8, 42).toISOString(),
        productName: "Original serum",
        substitutedWithProduct: {
          id: "sub-1",
          brand: "Ava Lab",
          name: "Substitute serum",
          category: "serum",
        imageUrl: "/history-cleanser.webp",
          status: "active",
        },
        substitutionReason: "Ran out of original.",
        recommendedSnapshot: {
          product_id: "product-2",
          brand: "Ava Lab",
          name: "Original serum",
          step_label: "serum",
        },
      }),
      applicationItem({
        id: "item-3",
        stepOrder: 2,
        status: "skipped",
        productName: "Retinol",
      }),
    ],
    createdAt: "2026-05-03T08:05:00.000Z",
    updatedAt: "2026-05-03T08:10:00.000Z",
  };
}

function applicationItem(
  partial: Partial<ApplicationLogItem> = {},
): ApplicationLogItem {
  return {
    id: "item-1",
    stepOrder: 0,
    suggestionStepId: "step-1",
    inventoryProductId: "product-1",
    substitutedWithProductId: null,
    productBrand: "Ava Lab",
    productName: "Gel Cleanser",
    stepLabel: "cleanser",
    status: "applied",
    isAdHoc: false,
    itemSource: "recommended",
    adHocBrand: null,
    adHocName: null,
    notes: null,
    substitutionReason: null,
    recommendedSnapshot: null,
    appliedSnapshot: null,
    appliedAt: "2026-05-03T08:05:00.000Z",
    product: {
      id: "product-1",
      brand: "Ava Lab",
      name: "Gel Cleanser",
      category: "cleanser",
      imageUrl: "/history-cleanser.webp",
      status: "active",
    },
    substitutedWithProduct: null,
    ...partial,
  };
}
