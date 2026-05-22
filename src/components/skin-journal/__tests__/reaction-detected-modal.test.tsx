import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { ReactionDetectedModal } from "../reaction-detected-modal";

describe("ReactionDetectedModal", () => {
  it("does not render the explanation affordance as a hash link", () => {
    renderWithProviders(
      <ReactionDetectedModal
        open
        onOpenChange={jest.fn()}
        severity="moderate"
        indicators={["redness_spike"]}
        date="2026-04-29"
        onSimplify={jest.fn()}
        onKeep={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /how does ritora decide/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /how does ritora decide/i }))
      .not.toBeInTheDocument();
  });
});
