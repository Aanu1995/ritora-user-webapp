import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { DashboardRouteSkeleton } from "@/components/dashboard/dashboard-route-skeleton";

describe("dashboard primitive components", () => {
  it("renders the route skeleton with animated placeholders", () => {
    const { container } = renderWithProviders(<DashboardRouteSkeleton />);

    expect(screen.getByTestId("dashboard-route-skeleton")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      5,
    );
  });
});
