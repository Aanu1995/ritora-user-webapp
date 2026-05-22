import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import svMessages from "../../../../messages/sv.json";
import { SupportingSections } from "@/components/smart-picks/smart-picks-supporting-sections";
import type { SmartPicksOverview } from "@/types/smart-picks";

describe("SupportingSections", () => {
  it("uses localized labels for covered roles and active tags", () => {
    render(
      <NextIntlClientProvider locale="sv" messages={svMessages}>
        <SupportingSections overview={overview()} />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Här är du täckt" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Aknebehandling")).toBeInTheDocument();
    expect(screen.getByText("Barriärstöd")).toBeInTheDocument();
    expect(
      screen.getByText("Treatment Gel · Täcker rollen aknebehandling."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Du har 2 produkter med signaler för barriärstöd. Använd upp en innan du lägger till en till.",
      ),
    ).toBeInTheDocument();
  });
});

function overview(): SmartPicksOverview {
  return {
    mode: "refine",
    generatedAt: "2026-05-12T09:00:00.000Z",
    inputsHash: "hash-1",
    recap: {
      primaryGoal: "dark marks",
      skinType: "combination",
      location: { city: "Stockholm", countryCode: "SE" },
      budgetTier: "mid",
      ethnicity: "Yoruba",
    },
    coverage: { slots: [], filled: 0, total: 0 },
    priorityGaps: [],
    considerGaps: [],
    covered: [
      {
        role: "acne-treatment",
        productName: "Treatment Gel",
        reason: "Täcker rollen aknebehandling.",
      },
    ],
    redundancy: [
      {
        activeTag: "barrier_support",
        hint: "Du har 2 produkter med signaler för barriärstöd. Använd upp en innan du lägger till en till.",
        products: [
          {
            id: "one",
            brand: "Brand",
            name: "Barrier Cream",
            recommendation: "keep",
          },
          {
            id: "two",
            brand: "Brand",
            name: "Repair Balm",
            recommendation: "finish-first",
          },
        ],
      },
    ],
    consentRequired: false,
    skinProfileRequired: false,
    productSuggestionsUnavailable: false,
    productGeneration: {
      status: "ready",
      reason: null,
      missingPickCount: 0,
      isProcessing: false,
      attemptedAt: null,
      retryAfter: null,
    },
    emptyState: {
      reason: null,
      dismissedGapCount: 0,
      nextEligibleAt: null,
      missingProfileFields: [],
      activeProductCount: 2,
      canAssessReplacements: false,
      historyReadiness: {
        usablePhotoCheckpoints: 0,
        loggedUseDaysLast90: 0,
        canAssessReplacements: false,
        reason: "needs_usage_and_photos",
      },
    },
    starterKit: { summary: "", steps: [] },
  };
}
