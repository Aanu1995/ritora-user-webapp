import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";
import type {
  NotificationPreferences,
  UpdatePreferencesPayload,
} from "@/types/notifications";

const mockUpdatePreferencesMutate = jest.fn();
const mockRefetchPreferences = jest.fn();
let mockPreferences: NotificationPreferences | undefined;
let mockIsLoading = false;
let mockIsError = false;

jest.mock("@/hooks/use-notifications", () => ({
  useNotificationPreferences: () => ({
    data: mockPreferences,
    isLoading: mockIsLoading,
    isError: mockIsError,
    refetch: mockRefetchPreferences,
  }),
  useUpdateNotificationPreferences: () => ({
    mutate: mockUpdatePreferencesMutate,
    isPending: false,
  }),
}));

function preferences(
  overrides: Partial<NotificationPreferences> = {},
): NotificationPreferences {
  return {
    photo_reminder_local_time: "08:00",
    photo_reminder_enabled: true,
    channels: ["in_app", "email"],
    reaction_alerts_enabled: true,
    simplification_alerts_enabled: true,
    insight_alerts_enabled: true,
    ai_polished_insights_enabled: true,
    wrapped_alerts_enabled: true,
    photo_tutorial_completed: false,
    ...overrides,
  };
}

describe("NotificationsTab", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPreferences = preferences();
    mockIsLoading = false;
    mockIsError = false;
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        emailVerified: true,
        preferredLanguage: "en",
        timeZone: "Europe/Stockholm",
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders a loading skeleton while preferences are fetching", () => {
    mockPreferences = undefined;
    mockIsLoading = true;

    renderWithProviders(<NotificationsTab />);

    expect(
      screen.getByTestId("notification-settings-skeleton"),
    ).toBeInTheDocument();
  });

  it("renders a retry state when preferences fail to load", async () => {
    mockPreferences = undefined;
    mockIsError = true;

    renderWithProviders(<NotificationsTab />);

    expect(
      screen.queryByTestId("notification-settings-skeleton"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "We couldn't load notification settings",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(mockRefetchPreferences).toHaveBeenCalledTimes(1);
  });

  it("does not keep the skeleton after auth has finished and no preferences are available", () => {
    mockPreferences = undefined;

    renderWithProviders(<NotificationsTab />);

    expect(
      screen.queryByTestId("notification-settings-skeleton"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "We couldn't load notification settings",
      }),
    ).toBeInTheDocument();
  });

  it("updates channel preferences from current form state instead of stale server props", async () => {
    renderWithProviders(<NotificationsTab />);

    await user.click(screen.getByLabelText("In-app"));
    await user.click(screen.getByLabelText("Email"));

    const channelPatches = mockUpdatePreferencesMutate.mock.calls.map(
      ([payload]: [UpdatePreferencesPayload]) => payload.channels,
    );

    expect(channelPatches).toEqual([["email"], []]);
  });

  it("uses the API mutation for reminder time and switch changes", async () => {
    renderWithProviders(<NotificationsTab />);

    await user.clear(screen.getByLabelText("Reminder time"));
    await user.type(screen.getByLabelText("Reminder time"), "09:30");
    await user.click(screen.getByRole("switch", { name: "Photo reminder" }));

    expect(
      mockUpdatePreferencesMutate.mock.calls.some(
        ([payload]: [UpdatePreferencesPayload]) =>
          payload.photo_reminder_enabled === false,
      ),
    ).toBe(true);
    expect(
      mockUpdatePreferencesMutate.mock.calls.some(
        ([payload]: [UpdatePreferencesPayload]) =>
          payload.photo_reminder_local_time === "09:30",
      ),
    ).toBe(true);
  });
});
