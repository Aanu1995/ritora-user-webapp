import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoute } from "@/constants/app-routes";
import { createReadySkinProfile } from "@/test/skin-profile";
import { renderWithProviders } from "@/test/utils";
import JournalPage from "../page";

const mockPush = jest.fn();
const mockUseSkinProfile = jest.fn();
let mockTodayPayload: unknown = { date: "2026-05-02", entry: null };

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => mockUseSkinProfile(),
}));

jest.mock("@/components/skin-journal/journal-tab-panels", () => ({
  JournalTabPanels: ({ onOpenUpload }: { onOpenUpload?: () => void }) => (
    <button type="button" onClick={onOpenUpload}>
      journal-empty-upload
    </button>
  ),
}));

jest.mock("@/components/skin-journal/journal-alert-button", () => ({
  JournalAlertButton: () => null,
}));

jest.mock("@/components/skin-journal/reaction-detected-modal", () => ({
  ReactionDetectedModal: () => null,
}));

jest.mock("@/hooks/use-skin-journal", () => ({
  useCalendar: () => ({ data: undefined, isLoading: false }),
  useDay: () => ({ data: null, isLoading: false }),
  useDismissInsight: () => ({ mutate: jest.fn() }),
  useInsights: () => ({
    data: { insights: [], meta: null },
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
  useJournalStats: () => ({ data: undefined }),
  usePhotoDates: () => ({ data: { dates: [], months: [] } }),
  usePhotoFilters: () => ({ data: { filters: [] } }),
  useRecordAnalysisFeedback: () => ({ mutate: jest.fn(), isPending: false }),
  useRecordInsightAction: () => ({ mutate: jest.fn() }),
  usePhotos: () => ({
    data: { pages: [{ items: [] }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useReinterpretAnalysis: () => ({ mutate: jest.fn(), isPending: false }),
  useRetryAnalysis: () => ({ mutate: jest.fn() }),
  useStartSimplification: () => ({ mutate: jest.fn() }),
  useTodayEntry: () => ({ data: mockTodayPayload }),
  useWrappedList: () => ({ data: [] }),
}));

describe("JournalPage profile gate", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockTodayPayload = { date: "2026-05-02", entry: null };
    mockUseSkinProfile.mockReset();
    mockUseSkinProfile.mockReturnValue({
      data: null,
      isError: false,
    });
  });

  it("opens the skin-profile prerequisite dialog instead of opening today's upload", async () => {
    const user = userEvent.setup();

    renderWithProviders(<JournalPage />);

    await user.click(
      screen.getByRole("button", { name: /add today's photo/i }),
    );

    expect(
      screen.getByRole("heading", { name: /finish your skin profile first/i }),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalledWith("/journal/upload");

    await user.click(screen.getByRole("button", { name: /open skin profile/i }));

    expect(mockPush).toHaveBeenCalledWith(AppRoute.SkinProfile);
  });

  it("uses the same gate for upload actions inside the journal body", async () => {
    const user = userEvent.setup();

    renderWithProviders(<JournalPage />);

    await user.click(screen.getByRole("button", { name: /journal-empty-upload/i }));

    expect(
      screen.getByRole("heading", { name: /finish your skin profile first/i }),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalledWith("/journal/upload");
  });

  it("disables the header add-today action when today's entry already exists", async () => {
    const user = userEvent.setup();
    mockUseSkinProfile.mockReturnValue({
      data: createReadySkinProfile(),
      isError: false,
    });
    mockTodayPayload = {
      date: "2026-05-02",
      entry: {
        id: "entry-today",
        entry_date: "2026-05-02",
        has_photo: true,
        photo_url: "/static/skin-journal/photo.webp",
      },
    };

    renderWithProviders(<JournalPage />);

    const addToday = screen.getByRole("button", {
      name: /add today's photo/i,
    });

    expect(addToday).toBeDisabled();

    await user.click(addToday);

    expect(mockPush).not.toHaveBeenCalledWith("/journal/upload");
  });

  it("disables the header add-today action when today has only check-ins", async () => {
    const user = userEvent.setup();
    mockUseSkinProfile.mockReturnValue({
      data: createReadySkinProfile(),
      isError: false,
    });
    mockTodayPayload = {
      date: "2026-05-02",
      entry: {
        id: "entry-checkin",
        entry_date: "2026-05-02",
        has_photo: false,
        photo_url: null,
        ratings: { redness: 2 },
      },
    };

    renderWithProviders(<JournalPage />);

    const addToday = screen.getByRole("button", {
      name: /add today's photo/i,
    });

    expect(addToday).toBeDisabled();

    await user.click(addToday);

    expect(mockPush).not.toHaveBeenCalledWith("/journal/upload");
  });
});
