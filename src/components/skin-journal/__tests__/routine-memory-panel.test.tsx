import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { RoutineMemoryPanel } from "@/components/skin-journal/routine-memory-panel";
import type { RoutineMemoryResponse } from "@/types/routine-memory";

describe("RoutineMemoryPanel", () => {
  it("renders a loading skeleton while the timeline is fetching", () => {
    renderWithProviders(<RoutineMemoryPanel data={null} isLoading />);

    expect(screen.getByLabelText(/loading routine memory/i)).toBeInTheDocument();
  });

  it("shows horizontal timeline trees per product without claiming causation", async () => {
    const user = userEvent.setup();
    const onDurationDaysChange = jest.fn();
    const { container } = renderWithProviders(
      <RoutineMemoryPanel
        data={routineMemory()}
        durationDays={30}
        onDurationDaysChange={onDurationDaysChange}
      />,
    );

    expect(screen.getByText("Routine Memory")).toBeInTheDocument();
    expect(screen.getByText(/timing is a clue, not proof/i)).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Memory window" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "14 days" }));
    expect(onDurationDaysChange).toHaveBeenCalledWith(14);
    expect(screen.getByText("A timeline for each product")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Paula Choice Retinol 0.3% timeline tree"),
    ).toHaveClass(
      "overflow-x-auto",
    );
    const timelineTree = screen.getByLabelText(
      "Paula Choice Retinol 0.3% timeline tree",
    );
    const treeText = timelineTree.textContent ?? "";
    expect(treeText.indexOf("Used")).toBeLessThan(
      treeText.indexOf("Recovery started"),
    );
    expect(treeText.indexOf("Recovery started")).toBeLessThan(
      treeText.indexOf("Reaction signal"),
    );
    expect(treeText.indexOf("Reaction signal")).toBeLessThan(
      treeText.indexOf("First logged use"),
    );
    const pageText = container.textContent ?? "";
    expect(pageText.indexOf("Retinol 0.3%")).toBeLessThan(
      pageText.indexOf("Barrier Serum"),
    );
    expect(screen.getAllByText("Jun 6").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jun 7").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jun 8").length).toBeGreaterThan(0);
    expect(within(timelineTree).getByText("Jun 8")).toBeInTheDocument();
    expect(within(timelineTree).getByText("Used")).toBeInTheDocument();
    expect(screen.getAllByText("Retinol 0.3%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paula Choice").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Treatment").length).toBeGreaterThan(0);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.example.com/retinol.webp",
    );
    expect(screen.getByText("Review this product")).toBeInTheDocument();
    expect(
      screen.getByText("A reaction showed up soon after you first used this"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("First logged use").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Reaction signal")).toBeInTheDocument();
    expect(screen.getByText("Recovery started")).toBeInTheDocument();
    expect(screen.queryByText(/caused/i)).not.toBeInTheDocument();
  });

  it("handles empty memory without implying the user failed to track", () => {
    renderWithProviders(
      <RoutineMemoryPanel
        data={{
          ...routineMemory(),
          summary: {
            timelineEventCount: 0,
            productChangeCount: 0,
            applicationLogCount: 0,
            reactionSignalCount: 0,
            recoveryEventCount: 0,
            suspiciousProductCount: 0,
            hasPossibleLinks: false,
          },
          timeline: [],
          suspiciousProducts: [],
          productTimelines: [],
        }}
      />,
    );

    expect(screen.getByText("Nothing to show here yet")).toBeInTheDocument();
    expect(screen.getByText(/keep logging/i)).toBeInTheDocument();
  });
});

function routineMemory(): RoutineMemoryResponse {
  return {
    generatedAt: "2026-06-13T10:00:00.000Z",
    timeZone: "UTC",
    window: {
      start: "2026-05-15",
      end: "2026-06-13",
      days: 30,
    },
    disclaimer:
      "Routine Memory shows timing patterns, not proof of what caused a reaction.",
    summary: {
      timelineEventCount: 4,
      productChangeCount: 2,
      applicationLogCount: 2,
      reactionSignalCount: 1,
      recoveryEventCount: 1,
      suspiciousProductCount: 1,
      hasPossibleLinks: true,
    },
    suspiciousProducts: [
      {
        productId: "retinol-1",
        brand: "Paula Choice",
        name: "Retinol 0.3%",
        category: "treatment",
        imageUrl: "https://cdn.example.com/retinol.webp",
        suspicionLevel: "possible",
        score: 5,
        reasonCodes: [
          "reaction_after_first_logged_use",
          "skipped_after_reaction",
        ],
        firstUseDate: "2026-06-06",
        lastUseDate: "2026-06-08",
        nearestReactionDate: "2026-06-07",
        daysFromFirstUseToReaction: 1,
        reactionSignalCountNearUse: 1,
      },
    ],
    productTimelines: [
      {
        product: {
          productId: "serum-1",
          brand: "Sensitive Lab",
          name: "Barrier Serum",
          category: "serum",
        },
        suspicionLevel: null,
        reasonCodes: [],
        firstUseDate: "2026-06-03",
        lastUseDate: "2026-06-03",
        nearestReactionDate: null,
        eventCount: 1,
        timeline: [
          {
            id: "first-use:log-0:item-1",
            date: "2026-06-03",
            occurredAt: "2026-06-03T20:00:00.000Z",
            type: "first_logged_use",
            severity: "info",
            product: {
              productId: "serum-1",
              brand: "Sensitive Lab",
              name: "Barrier Serum",
              category: "serum",
            },
            sourceType: "application_log",
            sourceId: "log-0",
          },
        ],
      },
      {
        product: {
          productId: "retinol-1",
          brand: "Paula Choice",
          name: "Retinol 0.3%",
          category: "treatment",
          imageUrl: "https://cdn.example.com/retinol.webp",
        },
        suspicionLevel: "possible",
        reasonCodes: [
          "reaction_after_first_logged_use",
          "skipped_after_reaction",
        ],
        firstUseDate: "2026-06-06",
        lastUseDate: "2026-06-08",
        nearestReactionDate: "2026-06-07",
        eventCount: 3,
        timeline: [
          {
            id: "product-used:log-3:item-1",
            date: "2026-06-09",
            occurredAt: "2026-06-09T20:00:00.000Z",
            type: "product_used",
            severity: "info",
            product: {
              productId: "retinol-1",
              brand: "Paula Choice",
              name: "Retinol 0.3%",
              category: "treatment",
              imageUrl: "https://cdn.example.com/retinol.webp",
            },
            sourceType: "application_log",
            sourceId: "log-3",
          },
          {
            id: "first-use:log-1:item-1",
            date: "2026-06-06",
            occurredAt: "2026-06-06T20:00:00.000Z",
            type: "first_logged_use",
            severity: "info",
            product: {
              productId: "retinol-1",
              brand: "Paula Choice",
              name: "Retinol 0.3%",
              category: "treatment",
            },
            sourceType: "application_log",
            sourceId: "log-1",
          },
          {
            id: "reaction-signal:entry-1",
            date: "2026-06-07",
            occurredAt: "2026-06-07T08:00:00.000Z",
            type: "reaction_signal",
            severity: "watch",
            product: null,
            sourceType: "skin_journal_entry",
            sourceId: "entry-1",
          },
          {
            id: "recovery-started:simplification-1",
            date: "2026-06-08",
            occurredAt: "2026-06-08T09:00:00.000Z",
            type: "recovery_started",
            severity: "recovery",
            product: null,
            sourceType: "routine_simplification",
            sourceId: "simplification-1",
          },
        ],
      },
    ],
    timeline: [
      {
        id: "first-use:log-1:item-1",
        date: "2026-06-06",
        occurredAt: "2026-06-06T20:00:00.000Z",
        type: "first_logged_use",
        severity: "info",
        product: {
          productId: "retinol-1",
          brand: "Paula Choice",
          name: "Retinol 0.3%",
          category: "treatment",
        },
        sourceType: "application_log",
        sourceId: "log-1",
      },
      {
        id: "reaction-signal:entry-1",
        date: "2026-06-07",
        occurredAt: "2026-06-07T08:00:00.000Z",
        type: "reaction_signal",
        severity: "watch",
        product: null,
        sourceType: "skin_journal_entry",
        sourceId: "entry-1",
      },
    ],
  };
}
