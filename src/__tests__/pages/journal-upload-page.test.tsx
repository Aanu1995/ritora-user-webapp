import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import type { DayDetail, JournalEntry } from "@/types/skin-journal";

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockDeleteEntryMutate = jest.fn();
const mockUpsertTodayMutate = jest.fn();
let mockSearchParams = new URLSearchParams();
let mockTodayPayload: DayDetail | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/hooks/use-skin-journal", () => ({
  useTodayEntry: () => ({ data: mockTodayPayload }),
  useUpsertToday: () => ({ mutate: mockUpsertTodayMutate, isPending: false }),
  useDeleteEntry: () => ({
    mutate: mockDeleteEntryMutate,
    isPending: false,
  }),
}));

import JournalUploadPage from "@/app/(app)/journal/upload/page";

beforeAll(() => {
  Object.defineProperty(URL, "createObjectURL", {
    writable: true,
    value: jest.fn(() => "blob:journal-photo"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    writable: true,
    value: jest.fn(),
  });
});

function journalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "entry-1",
    entry_date: "2026-04-30",
    time_zone: "Europe/Stockholm",
    photo_url: "https://example.com/today.webp",
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
    analysis_status: "completed",
    analysis_observations: null,
    analysis_summary: null,
    analysis_completed_at: "2026-04-30T08:00:00.000Z",
    analysis_retry_count: 0,
    has_reaction: false,
    created_at: "2026-04-30T08:00:00.000Z",
    updated_at: "2026-04-30T08:00:00.000Z",
    ...overrides,
  };
}

describe("JournalUploadPage edit actions", () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockRouterBack.mockReset();
    mockDeleteEntryMutate.mockReset();
    mockUpsertTodayMutate.mockReset();
    mockSearchParams = new URLSearchParams("mode=edit");
    mockTodayPayload = {
      date: "2026-04-30",
      entry: journalEntry(),
      events: [],
      insights: [],
    };
  });

  it("keeps default upload mode as add even when today's entry exists", () => {
    mockSearchParams = new URLSearchParams();

    renderWithProviders(<JournalUploadPage />);

    expect(
      screen.getByRole("heading", { name: /add today's photo/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /edit today's photo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete entry/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/current photo/i)).not.toBeInTheDocument();
  });

  it("labels explicit edit mode as editing today's photo", () => {
    renderWithProviders(<JournalUploadPage />);

    expect(
      screen.getByRole("heading", { name: /edit today's photo/i }),
    ).toBeInTheDocument();
  });

  it("falls back to add mode when edit is requested before an entry exists", () => {
    mockTodayPayload = {
      date: "2026-04-30",
      entry: null,
      events: [],
      insights: [],
    };

    renderWithProviders(<JournalUploadPage />);

    expect(
      screen.getByRole("heading", { name: /add today's photo/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /edit today's photo/i }),
    ).not.toBeInTheDocument();
  });

  it("lets users delete today's entry from edit mode after confirmation", () => {
    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(screen.getByRole("button", { name: /delete entry/i }));
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(mockDeleteEntryMutate).toHaveBeenCalledWith(
      "entry-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("does not show a skip check-in action inside the check-in step", () => {
    mockSearchParams = new URLSearchParams();

    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );

    expect(
      screen.queryByRole("button", { name: /skip check-in/i }),
    ).not.toBeInTheDocument();
  });

  it("validates required check-in fields before saving check-in data", () => {
    mockSearchParams = new URLSearchParams();

    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /complete the check-in/i,
    );
    expect(mockUpsertTodayMutate).not.toHaveBeenCalled();
  });

  it("validates required check-in fields before saving edit check-ins", () => {
    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /complete the check-in/i,
    );
    expect(mockUpsertTodayMutate).not.toHaveBeenCalled();
  });

  it("still lets users save only a selected photo before check-ins", () => {
    mockSearchParams = new URLSearchParams();
    const { container } = renderWithProviders(<JournalUploadPage />);
    const file = new File(["photo"], "today.jpg", { type: "image/jpeg" });
    const fileInput = container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );

    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [file] },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /processing this skin-progress/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /save photo only/i }),
    );

    expect(mockUpsertTodayMutate).toHaveBeenCalledWith(
      {
        payload: expect.objectContaining({
          skip_check_in: true,
          photo_processing_consent: true,
        }),
        photo: file,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
