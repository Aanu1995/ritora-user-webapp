import { screen } from "@testing-library/react";
import { AppRoute } from "@/constants/app-routes";
import { ApiError } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";

let mockSkinProfileData:
  | { city: string; countryCode: string; skinType: string | null }
  | undefined = {
  city: "Stockholm",
  countryCode: "SE",
  skinType: "combination",
};
let mockSkinProfileError: Error | null = null;
let mockTodayData = { entry: { has_photo: true } };
let mockTodayLoading = false;
let mockTodaysSuggestionTimeZone = "Europe/Stockholm";

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
    data: mockTodayData,
    isLoading: mockTodayLoading,
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => ({
    data: mockSkinProfileData,
    isLoading: false,
    isError: mockSkinProfileError !== null,
    error: mockSkinProfileError,
  }),
}));

let mockShelfStats: Record<string, number> = { all: 5 };
let mockScheduleSlots: { id: string }[] = [{ id: "slot-1" }];

jest.mock("@/hooks/use-shelf", () => ({
  useShelfStats: () => ({ data: mockShelfStats, isLoading: false }),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({
    timeZone: "Europe/Stockholm",
    todayIso: "2026-05-19",
  }),
}));

jest.mock("@/hooks/use-schedule", () => ({
  useSchedule: () => ({
    data: { slots: mockScheduleSlots },
    isLoading: false,
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useTodaysSuggestion: () => ({
    data: {
      timeZone: mockTodaysSuggestionTimeZone,
      date: "2026-05-20",
      generatedAt: "2026-05-08T20:30:00.000Z",
      slots: [],
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
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-20T16:30:00.000Z"));
    mockSkinProfileData = {
      city: "Stockholm",
      countryCode: "SE",
      skinType: "combination",
    };
    mockSkinProfileError = null;
    mockTodayData = { entry: { has_photo: true } };
    mockTodayLoading = false;
    mockTodaysSuggestionTimeZone = "Europe/Stockholm";
    mockShelfStats = { all: 5 };
    mockScheduleSlots = [{ id: "slot-1" }];
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders a time-of-day greeting with user name", () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Good evening, Ada.")).toBeInTheDocument();
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
    // PM2.5, PM10, pollen, and water removed from the climate card —
    // those metrics are no longer surfaced on the dashboard.
    expect(screen.queryByText("PM2.5")).not.toBeInTheDocument();
    expect(screen.queryByText("PM10")).not.toBeInTheDocument();
  });

  it("shows the fresh-account empty state when no skin type is set", () => {
    mockSkinProfileData = {
      city: "Stockholm",
      countryCode: "SE",
      skinType: null,
    };

    renderWithProviders(<DashboardPage />);

    // Fresh welcome header replaces the regular climate-aware welcome.
    expect(screen.getByText("Welcome to Ritora, Ada.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /tell us about your skin/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /build skin profile/i }),
    ).toHaveAttribute("href", AppRoute.SkinProfile);
    expect(
      screen.getByRole("link", { name: /try quick check first/i }),
    ).toHaveAttribute("href", AppRoute.CheckProduct);

    // The climate panel should not render in the fresh-account state.
    expect(
      screen.queryByRole("region", { name: "Climate data" }),
    ).not.toBeInTheDocument();
  });

  it("hides the climate card when no city is set on the profile", () => {
    // Without a city the climate readout would be generic; suppress the
    // panel rather than render profile-only information that adds no value.
    mockSkinProfileData = {
      city: "",
      countryCode: "",
      skinType: "combination",
    };

    renderWithProviders(<DashboardPage />);

    // Returning-user greeting still shows (skinType is set).
    expect(
      screen.getByText(/good (morning|afternoon|evening), ada\./i),
    ).toBeInTheDocument();
    // No climate region in the document.
    expect(
      screen.queryByRole("region", { name: "Climate data" }),
    ).not.toBeInTheDocument();
  });

  it("shows the fresh-account empty state when the profile endpoint returns 404", () => {
    // Fresh accounts have no profile row yet, so the backend returns 404 and
    // skinProfile.data is undefined. The dashboard still has to recognise this
    // as the fresh state, not as a generic error.
    mockSkinProfileData = undefined;
    mockSkinProfileError = new ApiError("profile not found", { status: 404 });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Welcome to Ritora, Ada.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /tell us about your skin/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /build skin profile/i }),
    ).toHaveAttribute("href", AppRoute.SkinProfile);
    expect(
      screen.queryByRole("region", { name: "Climate data" }),
    ).not.toBeInTheDocument();
  });

  it("shows the setup checklist for a returning user with incomplete setup", () => {
    // Profile is done (returning user), but shelf is empty and no routine
    // slots exist yet. The setup card should surface those two gaps.
    mockShelfStats = { all: 0 };
    mockScheduleSlots = [];

    renderWithProviders(<DashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Finish setting up" }),
    ).toBeInTheDocument();

    // Profile is done -> "Profile set" caption appears.
    expect(screen.getByText("Profile set")).toBeInTheDocument();
    // Shelf and routine are not done -> their todo captions appear.
    expect(
      screen.getByText("Add the products you already own"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Set up morning and evening times"),
    ).toBeInTheDocument();
  });

  it("does not show the photo nudge before 08:00 in the user's dashboard time zone", () => {
    jest.setSystemTime(new Date("2026-05-20T14:30:00.000Z"));
    mockTodayData = { entry: { has_photo: false } };
    mockTodaysSuggestionTimeZone = "America/Los_Angeles";
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        emailVerified: true,
        preferredLanguage: "en",
        timeZone: "America/Los_Angeles",
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.queryByText("Add today's photo")).not.toBeInTheDocument();
  });

  it("shows the photo nudge after 08:00 in the user's dashboard time zone", () => {
    jest.setSystemTime(new Date("2026-05-20T15:00:00.000Z"));
    mockTodayData = { entry: { has_photo: false } };
    mockTodaysSuggestionTimeZone = "America/Los_Angeles";
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        emailVerified: true,
        preferredLanguage: "en",
        timeZone: "America/Los_Angeles",
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Add today's photo")).toBeInTheDocument();
  });

  it("hides the setup checklist when profile, shelf, and routine are all set", () => {
    // Default fixture: profile + shelf + slots all populated.
    renderWithProviders(<DashboardPage />);

    expect(
      screen.queryByRole("heading", { name: "Finish setting up" }),
    ).not.toBeInTheDocument();
  });

  it("always shows the three promise cards on the normal dashboard", () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Private by design")).toBeInTheDocument();
    expect(screen.getByText("Owned products first")).toBeInTheDocument();
    expect(screen.getByText("Skin tone aware")).toBeInTheDocument();
  });

  it("shows the three promise cards in the fresh-account state too", () => {
    mockSkinProfileData = undefined;
    mockSkinProfileError = new ApiError("profile not found", { status: 404 });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Private by design")).toBeInTheDocument();
    expect(screen.getByText("Owned products first")).toBeInTheDocument();
    expect(screen.getByText("Skin tone aware")).toBeInTheDocument();
  });
});
