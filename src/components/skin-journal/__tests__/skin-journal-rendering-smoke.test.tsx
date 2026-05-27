import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import {
  CheckInRadarChart,
  ConcernTrendChart,
  ReactionFrequencyChart,
} from "@/components/skin-journal/charts";
import {
  JournalCalendarSkeleton,
  JournalCompareSkeleton,
  JournalDayDetailSkeleton,
  JournalDayPageSkeleton,
  JournalPageSkeleton,
  JournalSimplificationSkeleton,
  JournalWrappedSkeleton,
} from "@/components/skin-journal/journal-loading-skeletons";
import { InsightsPanel } from "@/components/skin-journal/insights/insights-panel";
import { WrappedList } from "@/components/skin-journal/wrapped-list";
import {
  getSafeWrappedFrameIndex,
  WrappedPlayer,
} from "@/components/skin-journal/wrapped-player";
import type {
  JournalEntry,
  JournalInsight,
  Wrapped,
} from "@/types/skin-journal";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function entry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "entry-1",
    entry_date: "2026-05-01",
    time_zone: "Europe/Stockholm",
    photo_url: "/media/entry-1.webp",
    has_photo: true,
    photo_width: 100,
    photo_height: 120,
    angle: "head_on",
    concern_focus: null,
    is_pre_routine: true,
    ratings: {
      oiliness: 2,
      dryness: 2,
      redness: 3,
      breakouts: 2,
      texture: 3,
      irritation: 1,
      sensitivity: 1,
    },
    overall_feel: "good",
    sleep_band: "5to7h",
    stress_today: "low",
    sun_exposure_today: "brief",
    sweat_exercise_today: false,
    cycle_marker: null,
    recent_change: null,
    complaint_note: null,
    analysis_status: "completed",
    analysis_observations: null,
    analysis_interpretation: null,
    analysis_feedback: null,
    analysis_feedback_submitted: false,
    analysis_feedback_submitted_at: null,
    analysis_summary: null,
    analysis_model: null,
    analysis_version: null,
    analysis_prompt_version: null,
    analysis_error_code: null,
    analysis_started_at: null,
    analysis_completed_at: null,
    analysis_duration_ms: null,
    analysis_input_image_count: null,
    analysis_input_tokens: null,
    analysis_output_tokens: null,
    analysis_total_tokens: null,
    analysis_estimated_cost_usd: null,
    analysis_retry_count: 0,
    has_reaction: false,
    created_at: "2026-05-01T08:00:00.000Z",
    updated_at: "2026-05-01T08:00:00.000Z",
    ...overrides,
  };
}

function wrapped(overrides: Partial<Wrapped> = {}): Wrapped {
  return {
    id: "wrapped-1",
    period_kind: "monthly",
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    status: "ready",
    photo_count: 2,
    generated_at: "2026-05-31T22:00:00.000Z",
    error: null,
    manifest: {
      timing: { fade_ms: 300, hold_ms: 1000 },
      entries: [
        {
          entry_id: "entry-1",
          entry_date: "2026-05-01",
          photo_url: "/media/entry-1.webp",
          caption: "Week 1",
        },
        {
          entry_id: "entry-2",
          entry_date: "2026-05-15",
          photo_url: "/media/entry-2.webp",
          caption: "Week 3",
        },
      ],
    },
    ...overrides,
  };
}

function insight(overrides: Partial<JournalInsight> = {}): JournalInsight {
  return {
    id: "insight-1",
    kind: "trend",
    severity: "info",
    confidence: 0.82,
    headline: {
      key: "journal.insightsTab.headlines.trend",
      text: "Breakouts look calmer this month.",
    },
    blocks: [
      {
        type: "text",
        key: "journal.insightsTab.blocks.text.trend",
        text: "Your ratings moved down over the selected window.",
      },
      {
        type: "metric_delta",
        value: 2,
        previous: 3,
        direction: "down_is_good",
        unit: "rating",
      },
    ],
    actions: [{ kind: "view_entries", entry_ids: ["entry-1"] }],
    caveats: [],
    source_entry_ids: ["entry-1"],
    time_window: { start: "2026-05-01", end: "2026-05-31" },
    data_cutoff_at: "2026-05-31T22:00:00.000Z",
    generation_trigger: "scheduled_refresh",
    metadata: {
      source: "deterministic",
      model: null,
      prompt_version: null,
      facts_hash: "facts-1",
      cache_hit: false,
      duration_ms: 12,
    },
    sources: [],
    generated_at: "2026-05-31T22:00:00.000Z",
    seen_at: null,
    dismissed_at: null,
    ...overrides,
  };
}

describe("Skin Journal rendering smoke coverage", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("renders route-level skeleton shapes that mirror journal layouts", () => {
    renderWithProviders(
      <div>
        <JournalPageSkeleton />
        <JournalCalendarSkeleton />
        <JournalDayDetailSkeleton ariaLabel="Loading day detail" />
        <JournalCompareSkeleton />
        <JournalDayPageSkeleton />
        <JournalWrappedSkeleton />
        <JournalSimplificationSkeleton />
      </div>,
    );

    expect(screen.getByTestId("journal-page-skeleton")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading day detail")).toBeInTheDocument();
    expect(screen.getByTestId("journal-compare-skeleton")).toBeInTheDocument();
  });

  it("renders chart cards from journal entries", () => {
    const entries = [
      entry({ entry_date: "2026-05-01", has_reaction: true }),
      entry({ id: "entry-2", entry_date: "2026-05-08", has_reaction: false }),
    ];

    renderWithProviders(
      <div>
        <ConcernTrendChart entries={entries} />
        <ReactionFrequencyChart entries={entries} />
        <CheckInRadarChart entries={entries} />
      </div>,
    );

    expect(screen.getByText(/concern severity over time/i)).toBeInTheDocument();
    expect(screen.getByText(/reaction frequency/i)).toBeInTheDocument();
    expect(screen.getByText(/check-in average/i)).toBeInTheDocument();
  });

  it("renders insights panel states and action routing", () => {
    const onOpenEntries = jest.fn();
    const onRefreshInsights = jest.fn();
    const onRecordInsightAction = jest.fn();

    renderWithProviders(
      <InsightsPanel
        photos={[entry()]}
        totalPhotoCount={1}
        insights={[insight()]}
        insightsMeta={{
          total_entries: 14,
          entries_until_next_insight: 0,
          last_generated_at: "2026-05-31T22:00:00.000Z",
          generation_status: "completed",
          active_job_trigger: null,
          active_job_run_after: null,
          active_job_last_error: null,
        }}
        insightsLoading={false}
        insightsWindow="all"
        onInsightsWindowChange={jest.fn()}
        onRefreshInsights={onRefreshInsights}
        isRefreshingInsights={false}
        onOpenUpload={jest.fn()}
        onOpenCompare={jest.fn()}
        onOpenExport={jest.fn()}
        onOpenEntries={onOpenEntries}
        onOpenProduct={jest.fn()}
        onOpenSettings={jest.fn()}
        onRecordInsightAction={onRecordInsightAction}
        onDismissInsight={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /check for updates/i }));
    fireEvent.click(screen.getByRole("button", { name: /view entries/i }));

    expect(onRefreshInsights).toHaveBeenCalled();
    expect(onOpenEntries).toHaveBeenCalledWith(["entry-1"]);
    expect(onRecordInsightAction).toHaveBeenCalledWith(
      "insight-1",
      expect.objectContaining({ kind: "view_entries" }),
    );
  });

  it("renders wrapped list and player controls", () => {
    jest.useFakeTimers();
    const readyWrapped = wrapped();

    renderWithProviders(
      <div>
        <WrappedList
          wrapped={[
            readyWrapped,
            wrapped({ id: "wrapped-2", status: "generating", manifest: null }),
            wrapped({
              id: "wrapped-3",
              status: "not_enough_photos",
              manifest: null,
              photo_count: 1,
            }),
          ]}
        />
        <WrappedPlayer wrapped={readyWrapped} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: /^play$/i }));
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(mockPush).toHaveBeenCalledWith("/journal/wrapped/wrapped-1");
    expect(getSafeWrappedFrameIndex(12, 2)).toBe(1);
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
