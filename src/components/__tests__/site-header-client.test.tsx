import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { SiteHeaderClient } from "@/components/site-header-client";
import { AppRoute } from "@/constants/app-routes";

let mockPathname = AppRoute.Home;
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

const headerProps = {
  navLinks: [
    { href: "#how-it-works", label: "How it works" },
    { href: "#privacy", label: "Privacy" },
  ],
  loginLabel: "Log in",
  signUpLabel: "Create account",
  openMenuLabel: "Open menu",
  closeMenuLabel: "Close menu",
  primaryNavLabel: "Primary navigation",
} as const;

describe("SiteHeaderClient", () => {
  beforeEach(() => {
    mockPathname = AppRoute.Home;
    mockSearchParams = new URLSearchParams();
  });

  it("keeps the closed mobile panel out of the accessibility tree", () => {
    const { container } = renderWithProviders(
      <SiteHeaderClient {...headerProps} />,
    );

    const panel = container.querySelector("#site-header-mobile-panel");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).toHaveAttribute("inert");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the mobile panel without immediately closing on the same route", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <SiteHeaderClient {...headerProps} />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = screen.getByRole("dialog", { name: "Open menu" });
    expect(dialog).toBeInTheDocument();
    const panel = container.querySelector("#site-header-mobile-panel");
    expect(panel).not.toHaveAttribute("inert");
  });

  it("closes the mobile panel when the route changes", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(
      <SiteHeaderClient {...headerProps} />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    mockPathname = AppRoute.Login;
    rerender(<SiteHeaderClient {...headerProps} />);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
