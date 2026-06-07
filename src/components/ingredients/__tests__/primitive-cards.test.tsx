import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictCard } from "@/components/ingredients/conflict-card";
import { LayeringOrderList } from "@/components/ingredients/layering-order-list";
import { OverlapCard } from "@/components/ingredients/overlap-card";
import { SafetyScoreRing } from "@/components/ingredients/safety-score-ring";
import { SeverityBadge } from "@/components/ingredients/severity-badge";
import { renderWithProviders } from "@/test/utils";
import {
  AnalysisSeverity,
  type IngredientConflict,
  type IngredientOverlap,
} from "@/types/ingredients";

describe("ingredient primitive cards", () => {
  it("expands conflict and overlap explanations", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ConflictCard conflict={conflict()} />
        <OverlapCard overlap={overlap()} />
      </>,
    );

    expect(screen.getByText(/Retinol \+ AHA/i)).toBeInTheDocument();
    expect(screen.getByText(/Found in 2 products/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /show why/i })[0]!);
    await user.click(screen.getAllByRole("button", { name: /show why/i })[0]!);

    expect(screen.getByText(/alternate nights/i)).toBeInTheDocument();
    expect(screen.getByText(/too many leave-on actives/i)).toBeInTheDocument();
  });

  it("renders layering order, badges, and score tones", () => {
    const { rerender } = render(
      <>
        <LayeringOrderList
          steps={[
            {
              productId: "p1",
              brand: "Ava Lab",
              name: "Gel Cleanser",
              reason: "Cleanse before leave-on products.",
            },
          ]}
        />
        <SafetyScoreRing score={88} />
        <SeverityBadge severity={AnalysisSeverity.Low} />
      </>,
    );

    expect(screen.getByText(/Gel Cleanser/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /88 of 100/i })).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();

    rerender(
      <>
        <LayeringOrderList steps={[]} />
        <SafetyScoreRing score={42} showLabel={false} />
      </>,
    );

    expect(screen.queryByText(/Gel Cleanser/)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /42 of 100/i })).toHaveClass(
      "text-danger",
    );
  });
});

function conflict(): IngredientConflict {
  return {
    code: "retinoid_aha_spacing",
    severity: AnalysisSeverity.High,
    ingredientA: "Retinol",
    ingredientB: "AHA",
    productAId: "retinol",
    productBId: "aha",
    mitigation: "Alternate nights.",
    explanation: null,
    description: "Do not layer these in one routine.",
  };
}

function overlap(): IngredientOverlap {
  return {
    ingredient: "Niacinamide",
    productIds: ["serum", "cream"],
    severity: AnalysisSeverity.Medium,
    explanation: "Too many leave-on actives can irritate sensitive skin.",
    description: "Repeated active.",
  };
}
