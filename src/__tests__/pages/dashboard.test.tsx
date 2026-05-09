import { screen } from "@testing-library/react";
import { AppRoute } from "@/constants/app-routes";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";

jest.mock("next/navigation", () => ({
  usePathname: () => AppRoute.Dashboard,
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-skin-journal", () => ({
  useActiveSimplification: () => ({
    data: null,
  }),
  useTodayEntry: () => ({
    data: { entry: { has_photo: true } },
    isLoading: false,
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => ({
    data: {
      city: "Stockholm",
      countryCode: "SE",
    },
    isLoading: false,
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useTodaysSuggestion: () => ({
    data: {
      timeZone: "Europe/Stockholm",
      generatedAt: "2026-05-08T20:30:00.000Z",
      environmentSummary: {
        status: "available",
        provider: "open_meteo",
        generatedAt: "2026-05-08T20:00:00.000Z",
        locationPersonalized: true,
        season: "spring",
        temperatureCelsius: 12,
        temperatureBand: "mild",
        humidity: 44,
        humidityBand: "balanced",
        uvIndex: 5,
        uvRisk: "moderate",
        airQualityIndex: 22,
        airQualityRisk: "good",
        pm25: 6,
        pm10: 12,
        pollenRisk: null,
        conditionLabel: "Clear",
        waterHardness: "moderate",
        waterSensitivity: "none",
        climateSensitivities: [],
        transitionSignals: [],
        confidence: "provider",
        stale: false,
        sourceIds: [],
      },
    },
  }),
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
        timeZone: null,
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

  it("shows climate context in the dashboard panel", () => {
    renderWithProviders(<DashboardPage />);

    expect(
      screen.getByRole("region", { name: "Climate data" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/City-level/)).toBeInTheDocument();
    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
    expect(screen.getByText("Spring")).toBeInTheDocument();
    expect(screen.getByText("Clear, 12°C")).toBeInTheDocument();
    expect(screen.getByText("Moderate · UV 5")).toBeInTheDocument();
    expect(screen.getByText("Balanced · 44%")).toBeInTheDocument();
    expect(screen.getByText("Good · AQI 22")).toBeInTheDocument();
    expect(screen.getByText("PM2.5")).toBeInTheDocument();
    expect(screen.getByText("6 µg/m³")).toBeInTheDocument();
    expect(screen.getByText("PM10")).toBeInTheDocument();
    expect(screen.getByText("12 µg/m³")).toBeInTheDocument();
  });
});
