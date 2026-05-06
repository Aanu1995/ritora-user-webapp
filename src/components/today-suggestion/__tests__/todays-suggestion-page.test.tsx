import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodaysSuggestionPage from "@/app/(app)/todays-suggestion/page";
import { renderWithProviders } from "@/test/utils";
import type { TodaysSuggestionResponse } from "@/types/suggestions";

const mockStartBreakMutate = jest.fn();

jest.mock("@/hooks/use-suggestions", () => ({
  useTodaysSuggestion: () => ({
    data: mockTodayResponse(),
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useNormalRoutineToday: () => ({ mutate: jest.fn(), isPending: false }),
  useRegenerateSuggestion: () => ({ mutate: jest.fn(), isPending: false }),
  useResumeRoutineBreak: () => ({ mutate: jest.fn(), isPending: false }),
  useStartRoutineBreak: () => ({
    mutate: mockStartBreakMutate,
    isPending: false,
  }),
  useUpdateRoutineBreak: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/use-application-tracking", () => ({
  useApplicationLog: () => ({ data: null }),
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: { user: { timeZone: string } }) => string) =>
    selector({ user: { timeZone: "UTC" } }),
}));

describe("TodaysSuggestionPage routine break integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("opens and submits the start-break dialog from the empty Today state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodaysSuggestionPage />);

    await user.click(screen.getByRole("button", { name: /take a break/i }));

    expect(
      screen.getByRole("heading", { name: /take a routine break/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start break/i }));

    expect(mockStartBreakMutate).toHaveBeenCalledWith(
      { endsAt: null },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });
});

function mockTodayResponse(): TodaysSuggestionResponse {
  return {
    date: "2026-05-06",
    timeZone: "UTC",
    generatedAt: "2026-05-06T08:00:00.000Z",
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
    },
    weatherSummary: null,
    slots: [],
    reactionAlert: null,
    routineBreak: null,
  };
}
