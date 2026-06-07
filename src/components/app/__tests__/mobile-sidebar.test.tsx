import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { MobileSidebar } from "@/components/app/mobile-sidebar";
import { AppRoute } from "@/constants/app-routes";

jest.mock("next/navigation", () => ({
  usePathname: () => AppRoute.Dashboard,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-nav-badge-counts", () => ({
  useNavBadgeCounts: () => ({}),
}));

describe("MobileSidebar", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("restores the previous body overflow when it closes", () => {
    document.body.style.overflow = "clip";
    const { rerender } = renderWithProviders(
      <MobileSidebar open onClose={jest.fn()} />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<MobileSidebar open={false} onClose={jest.fn()} />);

    expect(document.body.style.overflow).toBe("clip");
  });

  it("keeps the closed drawer out of the accessibility tree", () => {
    const { container } = renderWithProviders(
      <MobileSidebar open={false} onClose={jest.fn()} />,
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper).toHaveAttribute("inert");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = jest.fn();
    renderWithProviders(<MobileSidebar open onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
