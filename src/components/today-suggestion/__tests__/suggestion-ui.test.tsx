import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { SuggestionDetailDrawer } from "@/components/today-suggestion/suggestion-detail-drawer";
import { RecordApplicationSheet } from "@/components/today-suggestion/record-application-sheet";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { SuggestionStepRow } from "@/components/today-suggestion/step-row";
import { GapRecommendationBanner } from "@/components/today-suggestion/gap-recommendation-banner";
import {
  DayAdherencePill,
  DaySummaryPills,
} from "@/components/today-suggestion/day-summary-pills";
import { LockedDayBanners } from "@/components/today-suggestion/today-timeline-layout";
import { RecordingReminderBanner } from "@/components/today-suggestion/recording-reminder-banner";
import { RoutineBreakBanner } from "@/components/today-suggestion/routine-break-banner";
import { RoutineBreakStartDialog } from "@/components/today-suggestion/routine-break-start-dialog";
import { OnDemandSuggestionSection } from "@/components/today-suggestion/on-demand-suggestion-section";
import {
  routineBreakResumeSchema,
  toRoutineBreakEndsAt,
} from "@/components/today-suggestion/routine-break-validation";
import { TodayGapRecommendationSection } from "@/components/today-suggestion/today-gap-recommendation-section";
import {
  applicationRecordFormSchema,
  buildApplicationRecordDefaultValues,
  updateApplicationRecordRowStatus,
} from "@/components/today-suggestion/record-application-form";
import { buildRecordApplicationPayload } from "@/components/today-suggestion/record-application-payload";
import type { ApplicationLog } from "@/types/application-tracking";
import {
  SuggestionEvidenceSourceId,
  type SuggestionInstance,
  type SuggestionStep,
  type TodaysOnDemandSuggestion,
  type TodaysSuggestionResponse,
  type TodaysSuggestionSlot,
} from "@/types/suggestions";

const mockRegenerateMutate = jest.fn();
const mockGapActionMutate = jest.fn();
const mockRecordApplicationMutate = jest.fn();
const mockRouterPush = jest.fn();
const mockSnoozeMutate = jest.fn();
const mockTodayEntry = jest.fn();

jest.mock("@/hooks/use-suggestions", () => ({
  useRegenerateSuggestion: () => ({
    mutate: mockRegenerateMutate,
    isPending: false,
  }),
  useRecordSuggestionGapAction: () => ({
    mutate: mockGapActionMutate,
    isPending: false,
  }),
  useSnoozeRecordingReminder: () => ({
    mutate: mockSnoozeMutate,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-application-tracking", () => ({
  useEditApplication: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useRecordApplication: () => ({
    mutate: mockRecordApplicationMutate,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-skin-journal", () => ({
  useTodayEntry: () => mockTodayEntry(),
}));

jest.mock("@/hooks/use-shelf", () => ({
  useShelfProducts: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({ timeZone: "UTC" }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
  mockTodayEntry.mockReturnValue({ data: { entry: null } });
});

describe("today suggestion UI contract", () => {
  beforeEach(() => {
    mockTodayEntry.mockReturnValue({ data: { entry: null } });
  });

  it("renders routine reasoning sections, trusted evidence, and regenerate action in the drawer", async () => {
    const user = userEvent.setup();
    const suggestion = suggestionInstance({
      explanation: {
        headline: "Barrier support today.",
        body: ["Use a simple routine because the last photo showed dryness."],
        perStepReasons: [
          { stepOrder: 0, reason: "Cleanser removes sunscreen residue." },
        ],
        skipped: [{ name: "Retinol serum", reason: "Hold during dryness." }],
        inputs: [
          { label: "Skin profile", detail: "Sensitive and dryness-prone." },
          { label: "Shelf", detail: "Four active products scored." },
          { label: "Photo record", detail: "Dryness was detected." },
          { label: "Application record", detail: "Retinol used yesterday." },
          { label: "Weather", detail: "UV 3." },
          { label: "Other", detail: "No extra notes." },
        ],
      },
      evidenceSources: [
        {
          id: SuggestionEvidenceSourceId.AadSunscreenSelection,
          title: "How to select a sunscreen",
          organization: "American Academy of Dermatology",
          url: "https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-select-sunscreen",
          evidenceType: "dermatology_association",
          summary: "Use broad-spectrum SPF 30 or higher.",
          reviewedAt: "2026-05-04",
        },
      ],
    });

    renderWithProviders(
      <SuggestionDetailDrawer
        open
        onOpenChange={jest.fn()}
        suggestion={suggestion}
        onMarkApplied={jest.fn()}
        allowRegeneration
      />,
    );

    expect(screen.queryByText(/Model gpt-4.1-mini/i)).not.toBeInTheDocument();
    expect(screen.getByText(/What I am trying to do/i)).toBeInTheDocument();
    expect(screen.getByText(/Why each step/i)).toBeInTheDocument();
    expect(screen.getByText(/Ava Lab Barrier Serum/i)).toBeInTheDocument();
    expect(screen.getByText(/Trusted evidence/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sunscreen/i })).toHaveAttribute(
      "href",
      expect.stringContaining("aad.org"),
    );
    expect(
      screen.getByTestId("suggestion-detail-scroll-body"),
    ).toContainElement(
      screen.getByRole("button", { name: /try another suggestion/i }),
    );
    expect(
      screen.getByRole("button", { name: /mark as applied/i }),
    ).toHaveClass("bg-[color:var(--accent)]");
    expect(
      screen.queryByRole("button", {
        name: /customise this before applying/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try another suggestion/i }),
    ).toHaveClass("border");

    await user.click(
      screen.getByRole("button", { name: /try another suggestion/i }),
    );
    expect(mockRegenerateMutate).toHaveBeenCalledWith({
      id: "suggestion-1",
      payload: { reason: "user_requested" },
    });
  });

  it("uses step explanations as why-each-step drawer fallback", () => {
    renderWithProviders(
      <SuggestionDetailDrawer
        open
        onOpenChange={jest.fn()}
        suggestion={suggestionInstance({
          explanation: {
            headline: "Keep the routine light.",
            body: [],
            perStepReasons: [],
            skipped: [],
            inputs: [],
          },
        })}
      />,
    );

    expect(screen.getByText(/What I am trying to do/i)).toBeInTheDocument();
    expect(screen.getByText(/Why each step/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected for hydration/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /mark as applied/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /try another suggestion/i }),
    ).not.toBeInTheDocument();
  });

  it("shows persisted gap save state instead of a local-only wishlist action", () => {
    renderWithProviders(
      <GapRecommendationBanner
        recommendation={{
          ingredientOrCategory: "Vitamin C serum",
          reason: "Supports the brightening goal.",
          budgetTier: "mid",
          goalAlignment: "Brightening",
          sourceIds: [],
          userAction: "saved",
        }}
        onSaveToWishlist={jest.fn()}
      />,
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("renders locked, processing, ready, and recorded slot states", async () => {
    const user = userEvent.setup();
    const onRecord = jest.fn();
    const onEdit = jest.fn();
    const onShowDetail = jest.fn();

    const { rerender } = renderWithProviders(
      <SuggestionSlotCard
        slot={slot({ isVisible: false, suggestion: null })}
        onRecord={onRecord}
      />,
    );
    expect(screen.getByText(/Available/i)).toBeInTheDocument();

    rerender(
      <SuggestionSlotCard
        slot={slot({
          status: "failed",
          suggestion: suggestionInstance({ generationStatus: "failed" }),
        })}
      />,
    );
    expect(screen.getByText(/Needs retry/i)).toBeInTheDocument();

    rerender(
      <SuggestionSlotCard
        slot={slot({ suggestion: suggestionInstance() })}
        onRecord={onRecord}
        onShowDetail={onShowDetail}
      />,
    );
    await user.click(screen.getByRole("button", { name: /mark as applied/i }));
    expect(
      screen.queryByRole("button", { name: /customise/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^more$/i }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getAllByRole("button", { name: /why this routine/i })[0],
    );
    expect(screen.getAllByText(/Morning routine/i).length).toBeGreaterThan(0);
    expect(onRecord).toHaveBeenCalled();
    expect(onShowDetail).toHaveBeenCalled();

    rerender(
      <SuggestionSlotCard
        slot={slot({
          status: "recorded",
          recording: {
            applicationLogId: "log-1",
            appliedAt: "2026-05-04T08:05:00.000Z",
            hasBeenEdited: false,
            editCount: 0,
            lastEditedAt: null,
            appliedCount: 1,
            totalItems: 1,
          },
          suggestion: suggestionInstance({ applicationLogId: "log-1" }),
        })}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ slotId: "slot-1" }),
      "log-1",
    );
  });

  it("marks scheduled cards as basic when AI personalization is off", () => {
    renderWithProviders(
      <SuggestionSlotCard
        slot={slot({ suggestion: suggestionInstance() })}
        personalizationOff
      />,
    );

    expect(screen.getByText(/Basic suggestion/i)).toBeInTheDocument();
    expect(screen.getByText(/Personalization is off/i)).toBeInTheDocument();
  });

  it("renders on-demand suggestion states and retry actions", async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const onRecord = jest.fn();
    const onEdit = jest.fn();
    const onShowDetail = jest.fn();

    renderWithProviders(
      <OnDemandSuggestionSection
        suggestions={[
          onDemandSuggestion({ id: "on-demand-generating" }),
          onDemandSuggestion({ id: "on-demand-ready", status: "ready" }),
          onDemandSuggestion({ id: "on-demand-failed", status: "failed" }),
        ]}
        onRetry={onRetry}
        onRecord={onRecord}
        onEdit={onEdit}
        onShowDetail={onShowDetail}
      />,
    );

    expect(screen.getByText(/Quick suggestions/i)).toBeInTheDocument();
    expect(screen.getAllByText(/On-demand/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledWith("on-demand-failed");
    await user.click(screen.getByRole("button", { name: /mark as applied/i }));
    expect(onRecord).toHaveBeenCalledWith(
      expect.objectContaining({ slotId: "on-demand:on-demand-ready" }),
    );
  });

  it("shows a product quality warning for limited on-demand product data", () => {
    renderWithProviders(
      <OnDemandSuggestionSection
        suggestions={[
          onDemandSuggestion({
            id: "on-demand-ready",
            status: "ready",
            suggestion: suggestionInstance({
              id: "on-demand-ready",
              slotId: null,
              requestSource: "on_demand",
              productDataQuality: {
                verifiedCount: 0,
                partialCount: 1,
                insufficientCount: 1,
                warnings: ["ingredient list missing"],
              },
            }),
          }),
        ]}
        onRetry={jest.fn()}
        onRecord={jest.fn()}
        onEdit={jest.fn()}
        onShowDetail={jest.fn()}
      />,
    );

    expect(screen.getByText(/Product data is limited/i)).toBeInTheDocument();
    expect(screen.getByText(/ingredient list missing/i)).toBeInTheDocument();
  });

  it("shows each product quality warning instead of hiding later issues", () => {
    renderWithProviders(
      <OnDemandSuggestionSection
        suggestions={[
          onDemandSuggestion({
            id: "on-demand-ready",
            status: "ready",
            suggestion: suggestionInstance({
              id: "on-demand-ready",
              slotId: null,
              requestSource: "on_demand",
              productDataQuality: {
                verifiedCount: 0,
                partialCount: 1,
                insufficientCount: 0,
                warnings: [
                  "application guidance missing",
                  "key active ingredients not matched",
                ],
              },
            }),
          }),
        ]}
        onRetry={jest.fn()}
        onRecord={jest.fn()}
        onEdit={jest.fn()}
        onShowDetail={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/application guidance missing/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/key active ingredients not matched/i),
    ).toBeInTheDocument();
  });

  it("shows the why-this-routine card from explanation copy when headline is missing", () => {
    renderWithProviders(
      <SuggestionSlotCard
        slot={slot({
          suggestion: suggestionInstance({
            rationaleHeadline: null,
            explanation: {
              headline: "Brighten and protect today.",
              body: ["Last night's photo showed mild dryness."],
              perStepReasons: [],
              skipped: [],
              inputs: [],
            },
          }),
        })}
        onShowDetail={jest.fn()}
      />,
    );

    expect(screen.getByText(/Brighten and protect today/i)).toBeInTheDocument();
    expect(screen.getByText(/Last night's photo/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /why this routine/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: /^more$/i }),
    ).not.toBeInTheDocument();
  });

  it("renders actual application log items on recorded Today cards", () => {
    renderWithProviders(
      <SuggestionSlotCard
        slot={slot({
          status: "edited",
          recording: {
            applicationLogId: "log-1",
            appliedAt: "2026-05-04T08:05:00.000Z",
            hasBeenEdited: true,
            editCount: 1,
            lastEditedAt: "2026-05-04T09:00:00.000Z",
            appliedCount: 1,
            totalItems: 3,
          },
          applicationLog: applicationLog(),
          suggestion: suggestionInstance({ applicationLogId: "log-1" }),
        })}
      />,
    );

    expect(screen.getByText(/Applied 10:05 AM · 1 of 3/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Recorded 10:05 AM/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/application log/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Recovery Balm/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Skin felt warm/i)).toBeInTheDocument();
    expect(screen.getByText(/Used gentler product/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Instead of Ava Lab Retinol Serum/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Skipped/i)).toBeInTheDocument();
    expect(screen.getByText(/Edited at 11:00 AM/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Substituted Ava Lab Retinol Serum with Plain Lab Recovery Balm/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Edited/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("recorded-item-marker")).toHaveLength(3);
  });

  it("renders routine break resume and change-date actions", async () => {
    const user = userEvent.setup();
    const onResume = jest.fn();
    const onUpdateEndsAt = jest.fn();

    renderWithProviders(
      <RoutineBreakBanner
        routineBreak={{
          id: "break-1",
          status: "active",
          startedAt: "2026-05-06T08:00:00.000Z",
          endsAt: "2026-05-08T08:00:00.000Z",
          canResumeNow: true,
          message:
            "Your routine is paused. Ritora will not generate new skincare suggestions until you resume.",
        }}
        isResuming={false}
        isUpdating={false}
        onResume={onResume}
        onUpdateEndsAt={onUpdateEndsAt}
      />,
    );

    expect(screen.getByText(/routine break/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /resume routine/i }));
    expect(onResume).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /save resume date/i }));

    expect(onUpdateEndsAt).toHaveBeenCalledWith({
      endsAt: expect.any(String),
    });
  });

  it("submits the start routine break dialog", async () => {
    const user = userEvent.setup();
    const onStart = jest.fn();

    renderWithProviders(
      <RoutineBreakStartDialog
        open
        isStarting={false}
        onOpenChange={jest.fn()}
        onStart={onStart}
      />,
    );

    await user.click(screen.getByRole("button", { name: /start break/i }));

    expect(onStart).toHaveBeenCalledWith({
      endsAt: null,
    });
  });

  it("centers the record sheet on desktop while keeping mobile bottom-sheet behavior", () => {
    renderWithProviders(
      <RecordApplicationSheet
        open
        onOpenChange={jest.fn()}
        mode={{
          kind: "record",
          slot: slot({ suggestion: suggestionInstance() }),
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", {
      name: /record what you applied/i,
    });

    expect(dialog).toHaveClass("bottom-0");
    expect(dialog).toHaveClass("sm:left-1/2");
    expect(dialog).toHaveClass("sm:top-1/2");
    expect(dialog).toHaveClass("sm:bottom-auto");
    expect(dialog).toHaveClass("sm:right-auto");
    expect(dialog).toHaveClass("sm:-translate-x-1/2");
    expect(dialog).toHaveClass("sm:-translate-y-1/2");
    expect(screen.getByLabelText(/applied at/i)).not.toHaveFocus();
  });

  it("validates routine break resume dates before converting to API payloads", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-05-06T08:00:00.000Z"));
    try {
      expect(
        routineBreakResumeSchema.safeParse({ endsAt: "2026-05-05" }).success,
      ).toBe(false);
      expect(
        routineBreakResumeSchema.safeParse({ endsAt: "2026-05-07" }).success,
      ).toBe(true);
      expect(
        routineBreakResumeSchema.safeParse({ endsAt: "2026-05-07T10:30" })
          .success,
      ).toBe(false);
      expect(toRoutineBreakEndsAt("2026-05-07")).toEqual(expect.any(String));
      expect(toRoutineBreakEndsAt("2026-05-07T10:30")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("keeps ad-hoc products visible when editing a recorded application", () => {
    renderWithProviders(
      <RecordApplicationSheet
        open
        onOpenChange={jest.fn()}
        mode={{
          kind: "edit",
          slot: slot({ suggestion: suggestionInstance() }),
          existingLog: applicationLog(),
        }}
      />,
    );

    expect(screen.getByDisplayValue("Plain Lab")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Recovery Balm")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/Used gentler product/i),
    ).toBeInTheDocument();
    const warningCard = screen.getByTestId("application-edit-history-warning");
    expect(warningCard).toHaveTextContent(/This record will be marked as/i);
    expect(within(warningCard).getByText("Edited")).toHaveClass("uppercase");
    expect(warningCard).toHaveTextContent(/First saved 10:05 AM by you/i);
    expect(screen.queryByText(/Version history/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Version 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Version 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Original record kept/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toHaveClass(
      "bg-[color:var(--accent)]",
    );
    expect(
      screen.getByRole("button", { name: /discard changes/i }),
    ).toHaveClass("border");
  });

  it("clears stale off-shelf substitution data when a suggested row is no longer substituted", () => {
    const rows = [
      {
        stepOrder: 0,
        suggestionStepId: "step-1",
        inventoryProductId: "product-1",
        productBrand: "Ava Lab",
        productName: "Barrier Serum",
        stepLabel: "serum",
        status: "substituted" as const,
        substitutedWithProductId: null,
        substitutionReason: "Used a travel product",
        isAdHoc: true,
        adHocBrand: "Travel Brand",
        adHocName: "Travel Cream",
        notes: null,
        appliedAt: null,
      },
      {
        stepOrder: 1,
        suggestionStepId: null,
        inventoryProductId: null,
        productBrand: "Plain Lab",
        productName: "Recovery Balm",
        stepLabel: null,
        status: "applied" as const,
        substitutedWithProductId: null,
        substitutionReason: null,
        isAdHoc: true,
        adHocBrand: "Plain Lab",
        adHocName: "Recovery Balm",
        notes: null,
        appliedAt: null,
      },
    ];

    expect(updateApplicationRecordRowStatus(rows, 0, "applied")).toEqual([
      expect.objectContaining({
        stepOrder: 0,
        status: "applied",
        isAdHoc: false,
        adHocBrand: null,
        adHocName: null,
        substitutionReason: null,
      }),
      expect.objectContaining({
        stepOrder: 1,
        isAdHoc: true,
        adHocBrand: "Plain Lab",
        adHocName: "Recovery Balm",
      }),
    ]);
  });

  it("normalizes stale substitution fields before sending application payloads", () => {
    const suggestion = suggestionInstance();
    const payload = buildRecordApplicationPayload(
      slot({ suggestion }),
      suggestion,
      {
        appliedTime: "08:05",
        generalNotes: "",
        editReason: "",
        items: [
          {
            stepOrder: 0,
            suggestionStepId: "step-1",
            inventoryProductId: "product-1",
            productBrand: "Ava Lab",
            productName: "Barrier Serum",
            stepLabel: "serum",
            status: "applied",
            substitutedWithProductId: "product-2",
            substitutionReason: "Stale reason",
            isAdHoc: true,
            adHocBrand: "Travel Brand",
            adHocName: "Travel Cream",
            notes: null,
            appliedAt: null,
          },
          {
            stepOrder: 1,
            suggestionStepId: null,
            inventoryProductId: null,
            productBrand: "Plain Lab",
            productName: "Recovery Balm",
            stepLabel: null,
            status: "applied",
            substitutedWithProductId: null,
            substitutionReason: null,
            isAdHoc: true,
            adHocBrand: "Plain Lab",
            adHocName: "Recovery Balm",
            notes: null,
            appliedAt: null,
          },
        ],
      },
    );

    expect(payload.items).toEqual([
      expect.objectContaining({
        status: "applied",
        substitutedWithProductId: null,
        substitutionReason: null,
        isAdHoc: false,
        adHocBrand: null,
        adHocName: null,
      }),
      expect.objectContaining({
        status: "applied",
        isAdHoc: true,
        adHocBrand: "Plain Lab",
        adHocName: "Recovery Balm",
      }),
    ]);
  });

  it("does not send synthetic UI slot ids as persisted schedule ids", () => {
    const suggestion = suggestionInstance({
      slotId: null,
      requestSource: "on_demand",
    });
    const payload = buildRecordApplicationPayload(
      slot({ slotId: `on-demand:${suggestion.id}`, suggestion }),
      suggestion,
      {
        appliedTime: "12:15",
        generalNotes: "",
        editReason: "",
        items: [
          {
            stepOrder: 0,
            suggestionStepId: "step-1",
            inventoryProductId: "product-1",
            productBrand: "Ava Lab",
            productName: "Barrier Serum",
            stepLabel: "serum",
            status: "applied",
            substitutedWithProductId: null,
            substitutionReason: null,
            isAdHoc: false,
            adHocBrand: null,
            adHocName: null,
            notes: null,
            appliedAt: null,
          },
        ],
      },
    );

    expect(payload.slotId).toBeUndefined();
  });

  it("keeps deleted substitution snapshots visible when editing a record", () => {
    const suggestion = suggestionInstance();
    const existingLog = {
      ...applicationLog(),
      items: [
        {
          ...applicationLog().items[1]!,
          substitutedWithProductId: null,
          appliedSnapshot: {
            product_id: "deleted-substitute",
            brand: "Plain Lab",
            name: "Recovery Balm",
            step_label: "moisturizer",
          },
          substitutedWithProduct: null,
        },
      ],
    };
    const values = buildApplicationRecordDefaultValues(
      {
        kind: "edit",
        slot: slot({ suggestion }),
        existingLog,
      },
      suggestion,
    );

    expect(values.items[0]).toEqual(
      expect.objectContaining({
        status: "substituted",
        substitutedWithProductId: null,
        adHocBrand: "Plain Lab",
        adHocName: "Recovery Balm",
      }),
    );
    expect(applicationRecordFormSchema.safeParse(values).success).toBe(true);

    renderWithProviders(
      <RecordApplicationSheet
        open
        onOpenChange={jest.fn()}
        mode={{
          kind: "edit",
          slot: slot({ suggestion }),
          existingLog,
        }}
      />,
    );
    expect(
      screen.getByText(/Substituted with Plain Lab Recovery Balm/i),
    ).toBeInTheDocument();
  });

  it("covers step row provenance, fallback labels, and compact applied rendering", () => {
    const { rerender } = render(
      <SuggestionStepRow
        step={suggestionStep({
          provenance: "ai_added",
          routineNote: "Apply over damp skin before moisturiser.",
        })}
      />,
    );
    expect(screen.getByText(/Ava Lab/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/selected for hydration/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Routine note/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Apply over damp skin before moisturiser/i).length,
    ).toBeGreaterThan(0);

    rerender(
      <SuggestionStepRow
        step={suggestionStep({
          id: "snapshot",
          productBrand: "Original Brand",
          productName: "Original Serum",
          product: {
            id: "product-1",
            brand: "Edited Brand",
            name: "Edited Serum",
            category: "serum",
            imageUrl: null,
            status: "active",
          },
        })}
      />,
    );
    expect(screen.getByText(/Original Brand/i)).toBeInTheDocument();
    expect(screen.getByText(/Original Serum/i)).toBeInTheDocument();
    expect(screen.queryByText(/Edited Serum/i)).not.toBeInTheDocument();

    rerender(
      <SuggestionStepRow
        step={suggestionStep({
          id: "locked",
          product: null,
          productBrand: null,
          productName: null,
          customLabel: "Specialist cream",
          provenance: "specialist_locked",
        })}
      />,
    );
    expect(screen.getByText(/Specialist cream/i)).toBeInTheDocument();

    rerender(
      <SuggestionStepRow
        compactApplied
        step={suggestionStep({
          id: "fallback",
          stepLabel: "sun-protection",
          product: null,
          productBrand: null,
          productName: null,
          customLabel: null,
          provenance: "user_routine",
        })}
      />,
    );
    expect(screen.getByText(/sun protection/i)).toBeInTheDocument();
  });

  it("uses the configured suggestion arrival window in locked-day copy", () => {
    renderWithProviders(<LockedDayBanners leadTimeMinutes={90} />);

    expect(
      screen.getByText(
        /Visible 1 hour 30 minutes before each suggestion arrives/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(["couple", "of", "hours"].join(" "), "i")),
    ).not.toBeInTheDocument();
  });

  it("summarizes today's visible, locked, weather, photo, and adherence states", () => {
    renderWithProviders(
      <>
        <DaySummaryPills
          data={todaysResponse({
            weatherSummary: {
              conditionLabel: "Cloudy",
              temperatureCelsius: 19.4,
              uvIndex: 3,
              humidity: 60,
            },
            slots: [
              slot({
                slotId: "recorded",
                suggestion: suggestionInstance({ applicationLogId: "log-1" }),
              }),
              slot({
                slotId: "ready",
                suggestion: suggestionInstance({ id: "suggestion-2" }),
              }),
              slot({ slotId: "locked", isVisible: false, suggestion: null }),
            ],
          })}
        />
        <DayAdherencePill percent={83} />
        <DayAdherencePill percent={null} />
      </>,
    );

    expect(screen.getByText(/applied/)).toBeInTheDocument();
    expect(screen.getByText(/ready/)).toBeInTheDocument();
    expect(screen.getByText(/locked/)).toBeInTheDocument();
    expect(screen.getByText("Cloudy, 19°C, UV 3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log photo/i })).toHaveAttribute(
      "href",
      "/journal/upload",
    );
    expect(screen.getByText("83% adherence")).toBeInTheDocument();
  });

  it("records reminder actions without using local-only state", async () => {
    const user = userEvent.setup();
    const onRecord = jest.fn();
    renderWithProviders(
      <RecordingReminderBanner
        slots={[slot({ status: "recordable" })]}
        onRecord={onRecord}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /record morning now/i }),
    );
    expect(onRecord).toHaveBeenCalledWith(
      expect.objectContaining({ slotId: "slot-1" }),
    );

    await user.click(screen.getByRole("button", { name: /skipped today/i }));
    expect(mockRecordApplicationMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        suggestionInstanceId: "suggestion-1",
        generalNotes: "Marked skipped from Today's Suggestion reminder.",
        items: [
          expect.objectContaining({
            suggestionStepId: "step-1",
            status: "skipped",
          }),
        ],
      }),
    );

    await user.click(screen.getByRole("button", { name: /remind me later/i }));
    expect(mockSnoozeMutate).toHaveBeenCalledWith({
      suggestionInstanceId: "suggestion-1",
      minutes: 60,
    });
  });

  it("wires gap recommendation browse, save, and dismiss actions", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TodayGapRecommendationSection
        suggestionId="suggestion-1"
        recommendation={{
          ingredientOrCategory: "Vitamin C serum",
          reason: "Supports the brightening goal.",
          budgetTier: "mid",
          goalAlignment: "Brightening",
          sourceIds: [],
          userAction: null,
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /browse options/i }));
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/smart-picks?focus=Vitamin%20C%20serum",
    );

    await user.click(screen.getByRole("button", { name: /save to wishlist/i }));
    await user.click(screen.getByRole("button", { name: /not now/i }));
    expect(mockGapActionMutate).toHaveBeenNthCalledWith(
      1,
      {
        suggestionInstanceId: "suggestion-1",
        ingredientOrCategory: "Vitamin C serum",
        action: "saved",
      },
      expect.any(Object),
    );
    expect(mockGapActionMutate).toHaveBeenNthCalledWith(
      2,
      {
        suggestionInstanceId: "suggestion-1",
        ingredientOrCategory: "Vitamin C serum",
        action: "dismissed",
      },
      expect.any(Object),
    );
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

function applicationLog(): ApplicationLog {
  return {
    id: "log-1",
    suggestionInstanceId: "suggestion-1",
    slotId: "slot-1",
    targetDate: "2026-05-04",
    targetTime: "08:00",
    daypart: "morning",
    appliedAt: "2026-05-04T08:05:00.000Z",
    generalNotes: "Skin felt dry today.",
    editReason: "Corrected a substitution.",
    editCount: 1,
    hasBeenEdited: true,
    firstRecordedAt: "2026-05-04T08:05:00.000Z",
    lastEditedAt: "2026-05-04T09:00:00.000Z",
    createdAt: "2026-05-04T08:05:00.000Z",
    updatedAt: "2026-05-04T09:00:00.000Z",
    items: [
      {
        id: "item-1",
        stepOrder: 0,
        suggestionStepId: "step-1",
        inventoryProductId: "product-1",
        substitutedWithProductId: null,
        productBrand: "Ava Lab",
        productName: "Barrier Serum",
        stepLabel: "serum",
        status: "skipped",
        isAdHoc: false,
        itemSource: "recommended",
        adHocBrand: null,
        adHocName: null,
        notes: "Skin felt warm.",
        substitutionReason: null,
        recommendedSnapshot: null,
        appliedSnapshot: null,
        appliedAt: null,
        product: null,
        substitutedWithProduct: null,
      },
      {
        id: "item-2",
        stepOrder: 1,
        suggestionStepId: "step-2",
        inventoryProductId: "product-2",
        substitutedWithProductId: "product-3",
        productBrand: "Ava Lab",
        productName: "Retinol Serum",
        stepLabel: "serum",
        status: "substituted",
        isAdHoc: false,
        itemSource: "recommended",
        adHocBrand: null,
        adHocName: null,
        notes: null,
        substitutionReason: "Used gentler product",
        recommendedSnapshot: null,
        appliedSnapshot: {
          product_id: "product-3",
          brand: "Plain Lab",
          name: "Recovery Balm",
          step_label: "moisturizer",
        },
        appliedAt: null,
        product: null,
        substitutedWithProduct: {
          id: "product-3",
          brand: "Plain Lab",
          name: "Recovery Balm",
          category: "moisturizer",
          imageUrl: null,
          status: "active",
        },
      },
      {
        id: "item-3",
        stepOrder: 2,
        suggestionStepId: null,
        inventoryProductId: null,
        substitutedWithProductId: null,
        productBrand: "Plain Lab",
        productName: "Recovery Balm",
        stepLabel: "moisturizer",
        status: "applied",
        isAdHoc: true,
        itemSource: "added_off_shelf",
        adHocBrand: "Plain Lab",
        adHocName: "Recovery Balm",
        notes: null,
        substitutionReason: null,
        recommendedSnapshot: null,
        appliedSnapshot: {
          product_id: null,
          brand: "Plain Lab",
          name: "Recovery Balm",
          step_label: "moisturizer",
        },
        appliedAt: null,
        product: null,
        substitutedWithProduct: null,
      },
    ],
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
    explanation: {
      headline: "Keep the routine light.",
      body: ["A short morning routine fits today's shelf and schedule."],
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
    steps: [suggestionStep()],
    applicationLogId: null,
    createdAt: "2026-05-04T06:00:00.000Z",
    updatedAt: "2026-05-04T06:00:00.000Z",
    ...partial,
  };
}

function onDemandSuggestion(
  partial: Partial<TodaysOnDemandSuggestion> & { id: string },
): TodaysOnDemandSuggestion {
  const suggestion = suggestionInstance({
    id: partial.id,
    slotId: null,
    requestSource: "on_demand",
    requestContext: {
      intent: "post_workout",
      intensity: "minimal",
      note: "Back from training.",
      activityAt: null,
      requestedAt: "2026-05-04T12:15:00.000Z",
    },
    targetTime: "12:15",
    daypart: "noon",
    generationStatus:
      partial.status === "failed"
        ? "failed"
        : partial.status === "generating"
          ? "generating"
          : "ready",
  });
  return {
    id: partial.id,
    status: partial.status ?? "generating",
    requestedAt: "2026-05-04T12:15:00.000Z",
    recording: null,
    applicationLog: null,
    suggestion,
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
    chips: [{ tone: "ai", text: "Added by AI" }],
    safetyWarnings: [
      {
        severity: "info",
        message: "Patch test if sensitive.",
        ingredientSlugs: ["humectant"],
        sourceIds: [SuggestionEvidenceSourceId.MayoDrySkinCare],
      },
    ],
    routineNote: null,
    product: {
      id: "product-1",
      brand: "Ava Lab",
      name: "Barrier Serum",
      category: "serum",
      imageUrl: null,
      status: "active",
    },
    ...partial,
  };
}
