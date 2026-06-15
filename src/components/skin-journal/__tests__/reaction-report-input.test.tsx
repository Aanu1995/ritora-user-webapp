import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ReactionReportInput } from "../reaction-report-input";
import { EMPTY_REACTION_REPORT } from "../daily-check-in-validation";
import type { ReactionReport } from "@/types/skin-journal";

describe("ReactionReportInput", () => {
  it("records user-visible symptoms without requiring photo detection", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <ReactionReportInput
        value={{ ...EMPTY_REACTION_REPORT }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Burning" }));
    await user.click(screen.getByRole("button", { name: "Severe" }));

    expect(onChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        symptoms: ["burning"],
      }),
    );
    expect(onChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        severity: "severe",
      }),
    );
  });

  it("lets users clear a reaction report before saving", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const report: ReactionReport = {
      ...EMPTY_REACTION_REPORT,
      symptoms: ["itching"],
      severity: "moderate",
    };

    renderWithProviders(
      <ReactionReportInput value={report} onChange={onChange} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Clear symptom report" }),
    );

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
