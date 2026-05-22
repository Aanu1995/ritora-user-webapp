import { fireEvent, screen } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import {
  CYCLE_MARKER_DONT_TRACK,
  type DayDetail,
  type JournalEntry,
} from "@/types/skin-journal";

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockDeleteEntryMutate = jest.fn();
const mockUpsertTodayMutate = jest.fn();
let mockSearchParams = new URLSearchParams();
let mockTodayPayload: DayDetail | null | undefined = null;
let mockSkinProfilePayload: { sexAtBirth?: string } | undefined;

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

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => ({ data: mockSkinProfilePayload }),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

import JournalUploadPage from "@/app/(app)/journal/upload/page";

const mockToast = toast as jest.Mocked<typeof toast>;

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
    analysis_completed_at: "2026-04-30T08:00:00.000Z",
    analysis_duration_ms: null,
    analysis_input_image_count: null,
    analysis_input_tokens: null,
    analysis_output_tokens: null,
    analysis_total_tokens: null,
    analysis_estimated_cost_usd: null,
    analysis_retry_count: 0,
    has_reaction: false,
    created_at: "2026-04-30T08:00:00.000Z",
    updated_at: "2026-04-30T08:00:00.000Z",
    ...overrides,
  };
}

function selectPhoto(container: HTMLElement): File {
  const file = new File(["photo"], "today.jpg", { type: "image/jpeg" });
  const fileInputs = container.querySelectorAll<HTMLInputElement>(
    'input[type="file"]',
  );
  const fileInput = container.querySelector<HTMLInputElement>(
    'input[data-angle="head_on"]',
  );

  expect(fileInputs).toHaveLength(3);
  expect(fileInput).toBeInstanceOf(HTMLInputElement);
  fireEvent.change(fileInput, {
    target: { files: [file] },
  });
  fireEvent.click(
    screen.getByRole("checkbox", { name: /analysis of this photo/i }),
  );
  return file;
}

function selectAnglePhoto(container: HTMLElement, angle: string, name: string): File {
  const file = new File([name], `${name}.jpg`, { type: "image/jpeg" });
  const input = container.querySelector<HTMLInputElement>(
    `input[data-angle="${angle}"]`,
  );

  expect(input).toBeInstanceOf(HTMLInputElement);
  fireEvent.change(input, {
    target: { files: [file] },
  });
  return file;
}

function completeCheckIn({ includeCycle = false } = {}) {
  fireEvent.click(screen.getByRole("button", { name: "Good" }));

  for (const concern of [
    "Oiliness",
    "Dryness",
    "Redness",
    "Breakouts",
    "Texture",
    "Irritation",
    "Sensitivity",
  ]) {
    fireEvent.click(screen.getByRole("button", { name: `${concern} 2` }));
  }

  fireEvent.click(screen.getByRole("button", { name: "5–7h" }));
  fireEvent.click(screen.getByRole("button", { name: "Low" }));
  fireEvent.click(screen.getByRole("button", { name: "Brief" }));
  fireEvent.click(screen.getByRole("button", { name: "No" }));
  if (includeCycle) {
    fireEvent.click(screen.getByRole("button", { name: "Don't track" }));
  }
}

describe("JournalUploadPage edit actions", () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockRouterBack.mockReset();
    mockDeleteEntryMutate.mockReset();
    mockUpsertTodayMutate.mockReset();
    mockToast.error.mockReset();
    mockSearchParams = new URLSearchParams("mode=edit");
    mockSkinProfilePayload = undefined;
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

  it("keeps edit controls behind a skeleton while today's entry is loading", () => {
    mockTodayPayload = undefined;

    renderWithProviders(<JournalUploadPage />);

    expect(screen.getByTestId("journal-upload-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /continue to check-in/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save changes/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete entry/i }),
    ).not.toBeInTheDocument();
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

    const { container } = renderWithProviders(<JournalUploadPage />);
    selectPhoto(container);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );

    expect(
      screen.queryByRole("button", { name: /skip check-in/i }),
    ).not.toBeInTheDocument();
  });

  it("validates required check-in fields before saving check-in data", () => {
    mockSearchParams = new URLSearchParams();

    const { container } = renderWithProviders(<JournalUploadPage />);
    selectPhoto(container);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /complete the check-in/i,
    );
    expect(mockUpsertTodayMutate).not.toHaveBeenCalled();
  });

  it("allows users to continue to check-in without selecting a photo", () => {
    mockSearchParams = new URLSearchParams();
    mockTodayPayload = {
      date: "2026-04-30",
      entry: null,
      events: [],
      insights: [],
    };

    renderWithProviders(<JournalUploadPage />);

    const continueButton = screen.getByRole("button", {
      name: /continue to check-in/i,
    });
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);

    expect(screen.getByText(/today's check-in/i)).toBeInTheDocument();
  });

  it("saves a complete check-in without a photo", () => {
    mockSearchParams = new URLSearchParams();
    mockTodayPayload = {
      date: "2026-04-30",
      entry: null,
      events: [],
      insights: [],
    };

    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );
    completeCheckIn();
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(mockUpsertTodayMutate).toHaveBeenCalledWith(
      {
        payload: expect.objectContaining({
          overall_feel: "good",
          ratings: expect.objectContaining({
            oiliness: 2,
            dryness: 2,
            redness: 2,
            breakouts: 2,
            texture: 2,
            irritation: 2,
            sensitivity: 2,
          }),
          sleep_band: "5to7h",
          stress_today: "low",
          sun_exposure_today: "brief",
          sweat_exercise_today: false,
          cycle_marker: CYCLE_MARKER_DONT_TRACK,
        }),
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("shows a toast and keeps users on the page when save entry fails", () => {
    mockSearchParams = new URLSearchParams();
    mockTodayPayload = {
      date: "2026-04-30",
      entry: null,
      events: [],
      insights: [],
    };
    mockUpsertTodayMutate.mockImplementationOnce(
      (
        _input: unknown,
        options?: { onError?: (error: unknown) => void },
      ) => {
        options?.onError?.(new Error("Could not save entry"));
      },
    );

    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );
    completeCheckIn();
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(mockToast.error).toHaveBeenCalledWith("Could not save entry");
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("requires cycle marker only when the skin profile makes the cycle field visible", () => {
    mockSearchParams = new URLSearchParams();
    mockSkinProfilePayload = { sexAtBirth: "female" };
    mockTodayPayload = {
      date: "2026-04-30",
      entry: null,
      events: [],
      insights: [],
    };

    renderWithProviders(<JournalUploadPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to check-in/i }),
    );
    completeCheckIn();
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /complete the check-in/i,
    );
    expect(mockUpsertTodayMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Don't track" }));
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(mockUpsertTodayMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          cycle_marker: CYCLE_MARKER_DONT_TRACK,
        }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
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
    const file = selectPhoto(container);
    fireEvent.click(
      screen.getByRole("button", { name: /save photo only/i }),
    );

    expect(mockUpsertTodayMutate).toHaveBeenCalledWith(
      {
        payload: expect.objectContaining({
          skip_check_in: true,
          photo_processing_consent: true,
        }),
        photos: expect.objectContaining({
          head_on: file,
        }),
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("uploads front and optional side photos together from today's photo flow", () => {
    mockSearchParams = new URLSearchParams();
    mockTodayPayload = {
      date: "2026-04-30",
      entry: null,
      events: [],
      insights: [],
    };

    const { container } = renderWithProviders(<JournalUploadPage />);
    const front = selectAnglePhoto(container, "head_on", "front");
    const left = selectAnglePhoto(container, "left_profile", "left");
    fireEvent.click(
      screen.getByRole("checkbox", { name: /analysis of this photo/i }),
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
        photos: expect.objectContaining({
          head_on: front,
          left_profile: left,
        }),
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
