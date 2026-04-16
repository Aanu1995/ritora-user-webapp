import { screen } from "@testing-library/react";
import { AppRoute } from "@/constants/app-routes";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";

const mockLogoutMutate = jest.fn();
let mockPathname = AppRoute.Dashboard;
let mockLogoutState = {
  mutate: mockLogoutMutate,
  isPending: false,
};
let mockSkinProfileData: { data: unknown } = { data: null };

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("@/hooks/use-auth", () => ({
  useLogout: () => mockLogoutState,
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => mockSkinProfileData,
}));

import { AppShell } from "@/components/app/app-shell";

describe("AppShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = AppRoute.Dashboard;
    mockLogoutState = { mutate: mockLogoutMutate, isPending: false };
    mockSkinProfileData = { data: null };
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

  it("renders sidebar navigation and children", () => {
    renderWithProviders(
      <AppShell>
        <div>Dashboard content</div>
      </AppShell>,
    );

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(screen.getAllByText("Ritora").length).toBeGreaterThan(0);
  });

  it("renders main navigation links", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
    expect(homeLinks.some((l) => l.getAttribute("href") === AppRoute.Dashboard)).toBe(true);

    const profileLinks = screen.getAllByRole("link", { name: /^skin profile$/i });
    expect(profileLinks.some((l) => l.getAttribute("href") === AppRoute.SkinProfile)).toBe(true);
  });

  it("renders nav group labels", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getAllByText(/^more$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^account$/i).length).toBeGreaterThan(0);
  });

  it("renders Ritora branding in sidebar", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getAllByText("Ritora").length).toBeGreaterThan(0);
  });
});
