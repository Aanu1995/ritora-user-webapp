import { render, screen } from "@testing-library/react";
import { ConsentCheckbox } from "@/components/auth/consent-checkbox";

describe("ConsentCheckbox", () => {
  it("protects new-tab links with noopener and noreferrer", () => {
    render(
      <ConsentCheckbox
        id="privacy-consent"
        checked={false}
        onBlur={() => undefined}
        onChange={() => undefined}
        prefix="I agree to the"
        linkLabel="Privacy policy"
        href="/privacy"
      />,
    );

    const link = screen.getByRole("link", { name: /privacy policy/i });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
