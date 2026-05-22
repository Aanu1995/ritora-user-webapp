import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { GrantLocationDialog } from "@/components/settings/privacy-location-dialog";

jest.mock("@/components/ui/country-select", () => ({
  CountrySelect: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: string | null;
    onChange: (value: string | null) => void;
    ariaLabel: string;
  }) => (
    <select
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">Choose</option>
      <option value="SE">Sweden</option>
    </select>
  ),
}));

describe("GrantLocationDialog", () => {
  it("validates consent and submits normalized location data", async () => {
    const user = userEvent.setup();
    const onGrant = jest.fn();
    const onOpenChange = jest.fn();

    renderWithProviders(
      <GrantLocationDialog
        open
        onOpenChange={onOpenChange}
        onGrant={onGrant}
        pending={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: /grant and save/i }),
    ).toBeDisabled();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /country/i }),
      "SE",
    );
    await user.type(
      screen.getByRole("textbox", { name: /city/i }),
      "Stockholm",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /grant and save/i }));

    await waitFor(() =>
      expect(onGrant).toHaveBeenCalledWith("SE", "Stockholm"),
    );
  });

  it("resets when cancelled", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    renderWithProviders(
      <GrantLocationDialog
        open
        onOpenChange={onOpenChange}
        onGrant={jest.fn()}
        pending={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
