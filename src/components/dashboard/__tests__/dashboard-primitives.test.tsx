import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { DashboardRouteSkeleton } from "@/components/dashboard/dashboard-route-skeleton";
import { UpcomingFeatures } from "@/components/dashboard/upcoming-features";

describe("dashboard primitive components", () => {
  it("renders upcoming feature cards and the route skeleton", () => {
    const { container } = renderWithProviders(
      <>
        <UpcomingFeatures />
        <DashboardRouteSkeleton />
      </>,
    );

    expect(screen.getByTestId("upcoming-features")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-route-skeleton")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      5,
    );
  });
});
