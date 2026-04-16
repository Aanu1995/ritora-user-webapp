import { screen } from "@testing-library/react";
import { AppRoute } from "@/constants/app-routes";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";

jest.mock("next/navigation", () => ({
  usePathname: () => AppRoute.Dashboard,
}));

import DashboardPage from "@/app/(app)/dashboard/page";

describe("DashboardPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        emailVerified: true,
        preferredLanguage: "en",
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders the welcome message with user name", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/welcome back, ada/i)).toBeInTheDocument();
  });
});
