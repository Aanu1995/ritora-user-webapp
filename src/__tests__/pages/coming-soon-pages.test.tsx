import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";

jest.mock("next/navigation", () => ({
  usePathname: () => "/todays-suggestion",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-smart-picks", () => ({
  useSmartPicksOverview: () => ({
    data: {
      mode: "refine",
      generatedAt: "2026-05-10T10:00:00.000Z",
      inputsHash: "hash-1",
      recap: {
        primaryGoal: null,
        skinType: null,
        location: { city: null, countryCode: null },
        budgetTier: null,
        ethnicity: null,
      },
      coverage: { slots: [], filled: 0, total: 0 },
      priorityGaps: [],
      considerGaps: [],
      covered: [],
      redundancy: [],
      consentRequired: false,
      skinProfileRequired: false,
      productSuggestionsUnavailable: false,
      starterKit: { summary: null, steps: [] },
      emptyState: {
        reason: null,
        dismissedGapCount: 0,
        nextEligibleAt: null,
        missingProfileFields: [],
        activeProductCount: 0,
        canAssessReplacements: false,
        historyReadiness: {
          usablePhotoCheckpoints: 0,
          loggedUseDaysLast90: 0,
          canAssessReplacements: false,
          reason: "needs_usage_and_photos",
        },
      },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  ...jest.requireActual("@/hooks/use-suggestions"),
  useRecordSuggestionGapAction: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

import TodaysSuggestionPage from "@/app/(app)/todays-suggestion/page";
import JournalPage from "@/app/(app)/journal/page";
import SmartPicksPage from "@/app/(app)/smart-picks/page";
import HistoryPage from "@/app/(app)/history/page";
import InsightsPage from "@/app/(app)/insights/page";
import NotificationsPage from "@/app/(app)/notifications/page";

describe("Placeholder pages", () => {
  it("renders Today's Suggestion page with title", () => {
    renderWithProviders(<TodaysSuggestionPage />);
    expect(screen.getByText("Today's Suggestion")).toBeInTheDocument();
  });

  it("renders Skin Journal page with title", () => {
    renderWithProviders(<JournalPage />);
    expect(screen.getByText("Skin Journal")).toBeInTheDocument();
  });

  it("renders Smart Picks page with title", () => {
    renderWithProviders(<SmartPicksPage />);
    expect(screen.getByText("Smart Picks")).toBeInTheDocument();
  });

  it("renders History page with title", () => {
    renderWithProviders(<HistoryPage />);
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("renders Insights page with title", () => {
    renderWithProviders(<InsightsPage />);
    expect(screen.getByText("Insights")).toBeInTheDocument();
  });

  it("renders Notifications page with title", () => {
    renderWithProviders(<NotificationsPage />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });
});
