import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { DayDetailSkeleton } from "@/components/skin-journal/day-detail-skeleton";
import { PhotoGrid } from "@/components/skin-journal/photo-grid";
import {
  CompactSimplificationAlert,
  SimplificationBanner,
} from "@/components/skin-journal/simplification-banner";
import type { JournalEntry } from "@/types/skin-journal";

const mockPush = jest.fn();
const mockAcknowledge = jest.fn();
const simplification = {
  id: "simplification-1",
  started_at: "2026-05-04T07:00:00.000Z",
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/use-skin-journal", () => ({
  useActiveSimplification: () => ({ data: simplification }),
  useAcknowledgeSimplification: () => ({
    mutate: mockAcknowledge,
    isPending: false,
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("skin journal primitive components", () => {
  it("renders day detail skeleton and simplification controls", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <>
        <DayDetailSkeleton label="Loading day detail" />
        <SimplificationBanner />
        <CompactSimplificationAlert />
      </>,
    );

    expect(screen.getByLabelText(/loading day detail/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      15,
    );

    await user.click(screen.getByRole("button", { name: /view details/i }));
    await user.click(screen.getByRole("button", { name: /restore/i }));
    await user.click(screen.getByRole("button", { name: /view in journal/i }));

    expect(mockPush).toHaveBeenCalledWith(
      "/journal/simplification/simplification-1",
    );
    expect(mockAcknowledge).toHaveBeenCalledWith("simplification-1");
  });

  it("renders photo grid empty, list, reaction, and load-more states", async () => {
    const user = userEvent.setup();
    const onLoadMore = jest.fn();
    const { rerender } = renderWithProviders(<PhotoGrid entries={[]} />);

    expect(screen.getByText(/no photos/i)).toBeInTheDocument();

    rerender(
      <PhotoGrid
        entries={[journalEntry()]}
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />,
    );

    await user.click(screen.getByRole("button", { name: /reaction/i }));
    await user.click(screen.getByRole("button", { name: /load more/i }));

    expect(mockPush).toHaveBeenCalledWith("/journal/days/2026-05-04");
    expect(onLoadMore).toHaveBeenCalled();
  });
});

function journalEntry(): JournalEntry {
  return {
    id: "entry-1",
    entry_date: "2026-05-04",
    time_zone: "Europe/Stockholm",
    photo_url: null,
    has_photo: false,
    photo_width: null,
    photo_height: null,
    angle: "head_on",
    concern_focus: null,
    is_pre_routine: false,
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
      status: "not_trend_safe",
      reasons: ["no_photo"],
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
    analysis_retry_count: 0,
    has_reaction: true,
    created_at: "2026-05-04T08:00:00.000Z",
    updated_at: "2026-05-04T08:00:00.000Z",
  };
}
