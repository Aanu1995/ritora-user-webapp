import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { DayDetailPanel } from "../day-detail";
import type { DayDetail, JournalEntry } from "@/types/skin-journal";

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
    analysis_observations: null,
    analysis_interpretation: null,
    analysis_summary: null,
    analysis_model: null,
    analysis_version: null,
    analysis_prompt_version: null,
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

function dayDetail(entry: JournalEntry | null): DayDetail {
  return {
    date: entry?.entry_date ?? "2026-04-29",
    entry,
    events: [],
    insights: [],
  };
}

describe("DayDetailPanel journal-day edit lock", () => {
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
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
  });
});
