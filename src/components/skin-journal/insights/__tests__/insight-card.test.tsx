import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { InsightCard } from "../insight-card";
import type { JournalInsight } from "@/types/skin-journal";

function insight(overrides: Partial<JournalInsight> = {}): JournalInsight {
  return {
    id: "insight-1",
    kind: "trend",
    severity: "info",
    confidence: 0.82,
    headline: {
      key: "journal.insightsTab.headlines.trend",
      text: "Your breakouts look calmer this month.",
      values: { concern: "breakouts", direction: "improved", delta: 0.8 },
    },
    blocks: [
      {
        type: "evidence_grade",
        grade: "moderate",
        basis: { key: "journal.insightsTab.evidenceGrade.basis.trend" },
      },
      {
        type: "text",
        key: "journal.insightsTab.blocks.trend.explanation",
        text: "This tracks with your recent entries.",
        tone: "positive",
      },
      {
        type: "metric_delta",
        value: 1.8,
        previous: 2.6,
        direction: "down_is_good",
        unit: "entries",
      },
      {
        type: "factor_table",
        rows: [
          {
            factor: { key: "journal.insightsTab.factors.highStress" },
            effect: 1.2,
            n: 4,
          },
        ],
        effect_unit: "rating",
      },
      {
        type: "source_link",
        kb_id: "derm_6_8_week_acne_window",
      },
    ],
    actions: [{ kind: "dismiss" }],
    caveats: [],
    source_entry_ids: ["entry-1", "entry-2"],
    time_window: { start: "2026-04-01", end: "2026-04-30" },
    data_cutoff_at: "2026-05-01T08:00:00.000Z",
    generation_trigger: "scheduled_refresh",
    metadata: {
      source: "ai_polished",
      model: "gpt-4o-mini",
      prompt_version: "skin-journal-insights-v2026-05-01.1",
      facts_hash: "facts-1",
      cache_hit: false,
      duration_ms: 240,
    },
    sources: [
      {
        id: "derm_6_8_week_acne_window",
        title_key: "journal.insightsTab.kb.derm_6_8_week_acne_window.title",
        organization: "American Academy of Dermatology",
        summary_key:
          "journal.insightsTab.kb.derm_6_8_week_acne_window.summary",
        url: "https://www.aad.org/public/diseases/acne/derm-treat/treat",
        evidence_grade: "moderate",
        last_verified: "2026-05-01",
      },
    ],
    generated_at: "2026-05-01T08:00:00.000Z",
    seen_at: null,
    dismissed_at: null,
    ...overrides,
  };
}

describe("InsightCard", () => {
  it("renders structured evidence, source links, and generation metadata", () => {
    renderWithProviders(<InsightCard insight={insight()} />);

    expect(
      screen.getByText("Your breakouts look calmer this month."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Generated/)).toBeInTheDocument();
    expect(screen.getByText(/Based on/)).toBeInTheDocument();
    expect(screen.getByText(/Moderate evidence/)).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: /American Academy of Dermatology/i,
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("opens a why-this modal for AI touched insights", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InsightCard insight={insight()} />);

    await user.click(screen.getByRole("button", { name: "Why this?" }));

    expect(screen.getByText("Why Ritora is saying this")).toBeInTheDocument();
    expect(screen.getByText("scheduled_refresh")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o-mini")).toBeInTheDocument();
  });

  it("does not crash on unknown block types", () => {
    renderWithProviders(
      <InsightCard
        insight={insight({
          blocks: [{ type: "future_block", value: 1 } as never],
        })}
      />,
    );

    expect(screen.getByText("New insight format")).toBeInTheDocument();
  });

  it("renders actionable insight buttons and emits their actions", async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    renderWithProviders(
      <InsightCard
        insight={insight({
          metadata: {
            ...insight().metadata,
            source: "deterministic",
          },
          actions: [
            { kind: "view_entries", entry_ids: ["entry-1"] },
            {
              kind: "open_compare",
              from_date: "2026-04-01",
              to_date: "2026-04-30",
            },
            { kind: "open_product", inventory_product_id: "product-1" },
            { kind: "open_today_upload" },
            { kind: "open_settings", tab: "notifications" },
            { kind: "dismiss" },
          ],
        })}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "View entries" }));
    await user.click(screen.getByRole("button", { name: "Open compare" }));
    await user.click(screen.getByRole("button", { name: "Open product" }));
    await user.click(screen.getByRole("button", { name: "Add today's photo" }));
    await user.click(screen.getByRole("button", { name: "Open settings" }));

    expect(onAction).toHaveBeenCalledTimes(5);
    expect(screen.getByText("entries")).toBeInTheDocument();
    expect(screen.getByText(/rating/)).toBeInTheDocument();
  });
});
