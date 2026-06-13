import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodayPageHeaderActions } from "@/components/today-suggestion/today-page-header-actions";
import { renderWithProviders } from "@/test/utils";
import type { RoutineBreak } from "@/types/suggestions";

type RenderActionsOptions = {
  hasData?: boolean;
  quickSuggestionDisabled?: boolean;
  routineBreak?: RoutineBreak | null;
  onQuickSuggestion?: () => void;
  onReportReaction?: () => void;
  onStartBreak?: () => void;
};

describe("TodayPageHeaderActions", () => {
  it("renders the reaction action as a compact danger-styled header button", async () => {
    const user = userEvent.setup();
    const onReportReaction = jest.fn();

    renderActions({ onReportReaction });

    const headerActions = screen.getByTestId("today-header-actions");
    const reactionButton = within(headerActions).getByRole("button", {
      name: /my skin is reacting/i,
    });

    expect(reactionButton).toHaveClass(
      "w-7",
      "sm:w-auto",
      "border-danger/40",
      "bg-surface",
      "text-danger",
      "focus-visible:ring-danger/30",
    );
    expect(reactionButton).toContainElement(
      within(reactionButton).getByText("My skin is reacting"),
    );

    await user.click(reactionButton);

    expect(onReportReaction).toHaveBeenCalledTimes(1);
  });

  it("keeps the reaction and history actions available without Today data", () => {
    renderActions({ hasData: false });

    const headerActions = screen.getByTestId("today-header-actions");

    expect(
      within(headerActions).queryByRole("button", {
        name: /quick suggestion/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(headerActions).queryByRole("button", { name: /take a break/i }),
    ).not.toBeInTheDocument();
    expect(
      within(headerActions).getByRole("button", {
        name: /my skin is reacting/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(headerActions).getByRole("link", { name: /history/i }),
    ).toHaveAttribute("href", "/history");
  });

  it("hides routine-changing actions while a routine break is active", () => {
    renderActions({ routineBreak: activeRoutineBreak() });

    const headerActions = screen.getByTestId("today-header-actions");

    expect(
      within(headerActions).queryByRole("button", {
        name: /quick suggestion/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(headerActions).queryByRole("button", { name: /take a break/i }),
    ).not.toBeInTheDocument();
    expect(
      within(headerActions).getByRole("button", {
        name: /my skin is reacting/i,
      }),
    ).toBeInTheDocument();
  });
});

function renderActions({
  hasData = true,
  quickSuggestionDisabled = false,
  routineBreak = null,
  onQuickSuggestion = jest.fn(),
  onReportReaction = jest.fn(),
  onStartBreak = jest.fn(),
}: RenderActionsOptions = {}) {
  renderWithProviders(
    <TodayPageHeaderActions
      hasData={hasData}
      quickSuggestionDisabled={quickSuggestionDisabled}
      routineBreak={routineBreak}
      onQuickSuggestion={onQuickSuggestion}
      onReportReaction={onReportReaction}
      onStartBreak={onStartBreak}
    />,
  );
}

function activeRoutineBreak(): RoutineBreak {
  return {
    id: "break-1",
    status: "active",
    startedAt: "2026-06-13T08:00:00.000Z",
    endsAt: null,
    canResumeNow: true,
    message: "Routine break is active.",
  };
}
