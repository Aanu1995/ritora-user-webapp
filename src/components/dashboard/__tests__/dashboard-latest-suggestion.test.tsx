import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { DashboardLatestSuggestion } from "@/components/dashboard/dashboard-latest-suggestion";
import type {
  SuggestionInstance,
  SuggestionStep,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

jest.mock("@/hooks/use-shelf", () => ({
  useShelfProducts: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({ timeZone: "UTC" }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("DashboardLatestSuggestion", () => {
  it("renders the slot summary and step preview", () => {
    renderWithProviders(<DashboardLatestSuggestion slot={slot()} />);

    expect(
      screen.getByRole("region", { name: /morning routine/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/next up · morning routine/i)).toBeInTheDocument();
    expect(screen.getByText("8:00 AM")).toBeInTheDocument();
    expect(screen.getByText(/keep the routine light/i)).toBeInTheDocument();
    expect(screen.getByText(/barrier serum/i)).toBeInTheDocument();
  });

  it("links the Open routine action to /todays-suggestion", () => {
    renderWithProviders(<DashboardLatestSuggestion slot={slot()} />);

    const link = screen.getByRole("link", { name: /open routine/i });
    expect(link).toHaveAttribute("href", "/todays-suggestion");
  });

  it("does not render an inline record-application action", () => {
    // The dashboard card is preview-only; recording lives on
    // /todays-suggestion. If a record/applied button creeps back in,
    // this catches it.
    renderWithProviders(
      <DashboardLatestSuggestion slot={slot({ status: "recordable" })} />,
    );

    expect(
      screen.queryByRole("button", { name: /mark as applied/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /record what i applied/i }),
    ).not.toBeInTheDocument();
  });

  it("collapses extra steps into a +N more line", () => {
    const steps = [0, 1, 2, 3, 4].map((index) =>
      suggestionStep({ id: `step-${index}`, stepOrder: index }),
    );
    renderWithProviders(
      <DashboardLatestSuggestion
        slot={slot({ suggestion: suggestionInstance({ steps }) })}
      />,
    );

    expect(screen.getByText(/\+ 2 more steps/)).toBeInTheDocument();
  });
});

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
    aiModel: null,
    aiPromptVersion: null,
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
    steps: [suggestionStep()],
    applicationLogId: null,
    createdAt: "2026-05-04T06:00:00.000Z",
    updatedAt: "2026-05-04T06:00:00.000Z",
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
    productName: "Barrier Serum",
    stepLabel: "serum",
    customLabel: null,
    applicationMethod: "fingertips",
    quantity: "pea-size",
    waitAfterMinutes: 5,
    explanation: "Selected for hydration.",
    provenance: "ai_added",
    routineNote: null,
    chips: [],
    safetyWarnings: [],
    product: null,
    ...partial,
  };
}
