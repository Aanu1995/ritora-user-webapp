import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";

jest.mock("next/navigation", () => ({
  usePathname: () => "/todays-suggestion",
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
