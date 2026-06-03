import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { DayDetailPanel } from "../day-detail";
import {
  AnalysisFeedbackVote,
  PhotoAnalysisInterpretationVersion,
  PhotoAnalysisReadingLabel,
  PhotoAnalysisSchemaVersion,
  type AnalysisFeedback,
  type AnalysisObservations,
  type DayDetail,
  type JournalEvent,
  type JournalEntry,
  type PhotoAnalysisInterpretation,
} from "@/types/skin-journal";

const ANALYSIS_VERSION = PhotoAnalysisInterpretationVersion.V1_1;
const mockAcknowledgeEventMutate = jest.fn();
let mockAcknowledgeEventPending = false;
let mockAcknowledgeEventVariables: string | undefined;

jest.mock("@/hooks/use-skin-journal", () => ({
  ...jest.requireActual<typeof import("@/hooks/use-skin-journal")>(
    "@/hooks/use-skin-journal",
  ),
  useAcknowledgeEvent: () => ({
    isPending: mockAcknowledgeEventPending,
    mutate: mockAcknowledgeEventMutate,
    variables: mockAcknowledgeEventVariables,
  }),
}));

jest.mock("next/image", () => {
  const react = jest.requireActual<typeof import("react")>("react");

  type MockImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    unoptimized?: boolean;
  };

  return {
    __esModule: true,
    default: ({
      fill,
      priority,
      unoptimized,
      ...props
    }: MockImageProps) => {
      void fill;
      void priority;
      void unoptimized;
      return react.createElement("img", props);
    },
  };
});

function observations(): AnalysisObservations {
  return {
    schema_version: PhotoAnalysisSchemaVersion.V1_1,
    model_version: "test-model",
    image_quality: {
      face_detected: true,
      lighting_quality: "good",
      framing_quality: "good",
      blur_detected: false,
      issues: [],
      needs_retake: false,
      quality_score: 0.9,
      excluded_from_trends_reason: null,
    },
    detected_concerns: [],
    reaction_signals: {
      reaction_detected: false,
      reaction_severity: "none",
      indicators: [],
      confidence: 0.1,
    },
    barrier_signs: { barrier_compromise: false, indicators: [] },
    overall_assessment: "Skin appears stable today.",
    overall_change_from_previous: "stable",
    user_visible_message: "Skin appears stable today.",
    safety_flags: {
      urgent_review_recommended: false,
      doctor_follow_up_recommended: false,
      reasons: [],
    },
    should_flag_for_doctor: false,
  };
}

function interpretation(): PhotoAnalysisInterpretation {
  return {
    version: ANALYSIS_VERSION,
    code: "no_clear_change",
    severity: "info",
    summary_key: "journal.analysis.interpretation.noClearChange.summary",
    summary_values: {},
    guidance_keys: [],
    caveat_keys: [],
    source_ids: [],
    sources: [],
    generated_at: "2026-05-27T08:00:00.000Z",
  };
}

function journalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "entry-1",
    entry_date: "2026-04-29",
    time_zone: "UTC",
    photo_url: "https://example.com/photo.webp",
    has_photo: true,
    photo_width: 100,
    photo_height: 120,
    angle: "head_on",
    concern_focus: null,
    is_pre_routine: true,
    ratings: null,
    overall_feel: null,
    sleep_band: null,
    stress_today: null,
    sun_exposure_today: null,
    sweat_exercise_today: null,
    cycle_marker: null,
    recent_change: null,
    complaint_note: null,
    analysis_status: "failed",
    analysis_reference: null,
    photo_reference_quality: {
      status: "not_trend_safe",
      reasons: ["analysis_unavailable"],
      quality_score: null,
    },
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
    analysis_retry_count: 1,
    has_reaction: false,
    created_at: "2026-04-29T00:00:00.000Z",
    updated_at: "2026-04-29T00:00:00.000Z",
    ...overrides,
  };
}

function journalEvent(overrides: Partial<JournalEvent> = {}): JournalEvent {
  return {
    id: "event-1",
    entry_id: "entry-1",
    kind: "worsening",
    severity: "warning",
    payload: {
      concern: "redness",
      previous: 1,
      current: 4,
    },
    acknowledged_at: null,
    created_at: "2026-04-29T08:00:00.000Z",
    ...overrides,
  };
}

function dayDetail(
  entry: JournalEntry | null,
  events: JournalEvent[] = [],
): DayDetail {
  return {
    date: entry?.entry_date ?? "2026-04-29",
    entry,
    events,
    insights: [],
  };
}

describe("DayDetailPanel journal-day edit lock", () => {
  beforeEach(() => {
    mockAcknowledgeEventMutate.mockReset();
    mockAcknowledgeEventPending = false;
    mockAcknowledgeEventVariables = undefined;
  });

  it("hides replace and retry actions for elapsed journal days", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(journalEntry())}
        isToday={false}
        onReplacePhoto={jest.fn()}
        onRetryAnalysis={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /replace/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit entry/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry analysis/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps only edit and retry actions available for today's photo entry", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(journalEntry({ entry_date: "2026-04-30" }))}
        isToday
        onEditEntry={jest.fn()}
        onReplacePhoto={jest.fn()}
        onRetryAnalysis={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /edit photo/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /replace/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry analysis/i }),
    ).toBeInTheDocument();
  });

  it("labels retake-needed analysis as needs review", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(
          journalEntry({
            entry_date: "2026-04-30",
            analysis_status: "needs_review",
          }),
        )}
        isToday
      />,
    );

    expect(screen.getByText(/needs review/i)).toBeInTheDocument();
  });

  it("shows reference quality and the date used for analysis comparison", () => {
    const entry = {
      ...journalEntry({
        entry_date: "2026-04-30",
        analysis_status: "completed",
      }),
      analysis_reference: {
        entry_id: "entry-reference",
        entry_date: "2026-04-18",
        quality: {
          status: "good_reference",
          reasons: [],
          quality_score: 0.91,
        },
      },
      photo_reference_quality: {
        status: "good_reference",
        reasons: [],
        quality_score: 0.93,
      },
    } as JournalEntry;

    renderWithProviders(<DayDetailPanel detail={dayDetail(entry)} isToday />);

    expect(screen.getByText(/good reference photo/i)).toBeInTheDocument();
    expect(screen.getByText(/compared with/i)).toHaveTextContent(
      /apr 18, 2026/i,
    );
  });

  it("loads the primary above-the-fold photo angle eagerly", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(
          journalEntry({
            photos: [
              {
                angle: "left_profile",
                photo_url: "/media/left.webp",
                width: 100,
                height: 100,
              },
              {
                angle: "head_on",
                photo_url: "/media/front.webp",
                width: 100,
                height: 100,
              },
              {
                angle: "right_profile",
                photo_url: "/media/right.webp",
                width: 100,
                height: 100,
              },
            ],
            angle_count: 3,
          }),
        )}
        isToday
      />,
    );

    const frontPhoto = screen.getByRole("img", {
      name: /front skin journal photo/i,
    });
    const sidePhoto = screen.getByRole("img", {
      name: /left side skin journal photo/i,
    });

    expect(frontPhoto).toHaveAttribute("loading", "eager");
    expect(frontPhoto).toHaveAttribute("fetchpriority", "high");
    expect(sidePhoto).toHaveAttribute("loading", "lazy");
  });

  it("shows a specific failed analysis explanation when the API returns a failure code", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(
          journalEntry({
            entry_date: "2026-04-30",
            analysis_status: "failed",
            analysis_error_code: "photo_preflight_rejected",
          }),
        )}
        isToday
        onRetryAnalysis={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/photo could not pass the local quality check/i),
    ).toBeInTheDocument();
  });

  it("does not offer adding a photo for a past empty day", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(null)}
        isToday={false}
        onAddPhoto={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /add photo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/entries can only be added on the day itself/i),
    ).toBeInTheDocument();
  });

  it("hides the feedback prompt after anonymous feedback exists for the current interpretation", () => {
    const feedback: AnalysisFeedback = {
      vote: AnalysisFeedbackVote.Helpful,
      reason: null,
      note: null,
      interpretation_version: ANALYSIS_VERSION,
      reading_label: PhotoAnalysisReadingLabel.Useful,
      created_at: "2026-05-27T08:00:00.000Z",
      updated_at: "2026-05-27T08:00:00.000Z",
    };

    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(
          journalEntry({
            analysis_status: "completed",
            analysis_observations: observations(),
            analysis_interpretation: interpretation(),
          }),
        )}
        analysisFeedbackOverride={feedback}
        isToday
        onAnalysisFeedback={jest.fn()}
      />,
    );

    expect(
      screen.queryByText(/was this analysis helpful/i),
    ).not.toBeInTheDocument();
  });

  it("hides the feedback prompt when the entry says feedback was submitted", () => {
    const entry = journalEntry({
      analysis_status: "completed",
      analysis_observations: observations(),
      analysis_interpretation: interpretation(),
      analysis_feedback_submitted: true,
      analysis_feedback_submitted_at: "2026-05-27T08:01:00.000Z",
    });

    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(entry)}
        isToday
        onAnalysisFeedback={jest.fn()}
      />,
    );

    expect(
      screen.queryByText(/was this analysis helpful/i),
    ).not.toBeInTheDocument();
  });

  it("shows unacknowledged warning events and lets the user mark them read", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(journalEntry(), [journalEvent()])}
        isToday
      />,
    );

    expect(screen.getByText(/needs your attention/i)).toBeInTheDocument();
    expect(
      screen.getByText(/redness changed from 1 to 4/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /mark read/i }));

    expect(mockAcknowledgeEventMutate).toHaveBeenCalledWith("event-1");
  });

  it("does not show already acknowledged warning events", () => {
    renderWithProviders(
      <DayDetailPanel
        detail={dayDetail(journalEntry(), [
          journalEvent({
            acknowledged_at: "2026-04-29T09:00:00.000Z",
          }),
        ])}
        isToday
      />,
    );

    expect(screen.queryByText(/needs your attention/i)).not.toBeInTheDocument();
  });
});
