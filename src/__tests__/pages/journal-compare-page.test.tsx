import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import type {
  CalendarPayload,
  CompareResponse,
  JournalEntry,
  PhotoDateIndex,
} from "@/types/skin-journal";

const mockUsePhotoDates = jest.fn();
const mockUseCompareDays = jest.fn();
const mockUseCalendar = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock("@/hooks/use-skin-journal", () => ({
  usePhotoDates: (filters?: unknown) => mockUsePhotoDates(filters),
  useCompareDays: (
    from: string | null,
    to: string | null,
    options?: { enabled?: boolean },
  ) => mockUseCompareDays(from, to, options),
  useCalendar: (month: string) => mockUseCalendar(month),
}));

import JournalComparePage from "@/app/(app)/journal/compare/page";

function journalEntry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    id: overrides.id ?? "entry-1",
    entry_date: overrides.entry_date ?? "2026-04-10",
    time_zone: "Europe/Stockholm",
    photo_url: overrides.photo_url ?? "https://example.com/photo.webp",
    has_photo: true,
    photo_width: 100,
    photo_height: 100,
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
    analysis_status: "completed",
    analysis_reference: null,
    photo_reference_quality: {
      status: "good_reference",
      reasons: [],
      quality_score: 0.9,
    },
    analysis_observations: null,
    analysis_interpretation: null,
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
    created_at: "2026-04-10T00:00:00.000Z",
    updated_at: "2026-04-10T00:00:00.000Z",
    ...overrides,
  };
}

const PHOTO_DATES: PhotoDateIndex = {
  dates: [
    {
      date: "2025-12-01",
      entry_id: "entry-2025-12",
      analysis_status: "completed",
      has_reaction: false,
    },
    {
      date: "2026-04-10",
      entry_id: "entry-2026-04",
      analysis_status: "completed",
      has_reaction: false,
    },
    {
      date: "2026-03-08",
      entry_id: "entry-2026-03",
      analysis_status: "completed",
      has_reaction: false,
    },
  ],
  months: [
    { month: "2026-04", photo_count: 1 },
    { month: "2026-03", photo_count: 1 },
    { month: "2025-12", photo_count: 1 },
  ],
};

const APRIL_CALENDAR: CalendarPayload = {
  month: "2026-04",
  days: [
    {
      date: "2026-04-10",
      state: "completed",
      entry_id: "entry-2026-04",
      has_photo: true,
      has_reaction: false,
      has_insight: false,
      thumbnail_url: null,
      analysis_status: "completed",
    },
  ],
};

const COMPARE_RESPONSE: CompareResponse = {
  from: journalEntry({
    id: "entry-2026-03",
    entry_date: "2026-03-08",
    photo_url: "https://example.com/from.webp",
  }),
  to: journalEntry({
    id: "entry-2026-04",
    entry_date: "2026-04-10",
    photo_url: "https://example.com/to.webp",
  }),
  delta: {
    bullets: [
      {
        code: "rating_improved",
        tone: "good",
        concern: "redness",
        from_rating: 4,
        to_rating: 2,
      },
    ],
  },
};

describe("JournalComparePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePhotoDates.mockReturnValue({
      data: PHOTO_DATES,
      isLoading: false,
    });
    mockUseCalendar.mockReturnValue({
      data: APRIL_CALENDAR,
      isLoading: false,
    });
    mockUseCompareDays.mockReturnValue({
      data: COMPARE_RESPONSE,
      isLoading: false,
    });
  });

  it("defaults to the two most recent uploaded-photo dates", () => {
    renderWithProviders(<JournalComparePage />);

    expect(mockUseCompareDays).toHaveBeenCalledWith(
      "2026-03-08",
      "2026-04-10",
      expect.objectContaining({ enabled: true }),
    );
  });

  it("does not run compare when fewer than two uploaded-photo days exist", () => {
    mockUsePhotoDates.mockReturnValue({
      data: {
        dates: [PHOTO_DATES.dates[0]],
        months: [{ month: "2025-12", photo_count: 1 }],
      },
      isLoading: false,
    });

    renderWithProviders(<JournalComparePage />);

    expect(
      screen.getByText(/at least two uploaded-photo days/i),
    ).toBeInTheDocument();
    expect(mockUseCompareDays).toHaveBeenCalledWith(
      null,
      null,
      expect.objectContaining({ enabled: false }),
    );
  });

  it("renders photo-analysis deltas and quality limitations", () => {
    const richCompareResponse = {
      ...COMPARE_RESPONSE,
      delta: {
        bullets: [
          {
            code: "photo_concern_worsened",
            tone: "warn",
            analysis_concern: "acne",
            from_severity: "mild",
            to_severity: "moderate",
            confidence: 0.76,
          },
          {
            code: "reaction_signal_increased",
            tone: "warn",
            from_severity: "none",
            to_severity: "moderate",
            confidence: 0.75,
          },
          {
            code: "not_comparable",
            tone: "warn",
            reason: "poor_lighting",
          },
        ],
      },
    } as CompareResponse;
    mockUseCompareDays.mockReturnValue({
      data: richCompareResponse,
      isLoading: false,
    });

    renderWithProviders(<JournalComparePage />);

    expect(screen.getByText(/acne looks more noticeable/i)).toBeInTheDocument();
    expect(screen.getByText(/reaction signals increased/i)).toBeInTheDocument();
    expect(
      screen.getByText(/photo comparison is limited by lighting/i),
    ).toBeInTheDocument();
  });
});
