import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api-error";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";
import {
  PushPlatformValue,
  PushProviderValue,
  type NotificationPreferences,
  type UpdatePreferencesPayload,
} from "@/types/notifications";

const mockUpdatePreferencesMutate = jest.fn();
const mockRefetchPreferences = jest.fn();
const mockGetBrowserPushSupportState = jest.fn();
const mockGetCurrentBrowserPushSubscription = jest.fn();
const mockSubscribeCurrentBrowserToPush = jest.fn();
const mockRevokeCurrentBrowserPushSubscription = jest.fn();
const mockHashPushEndpoint = jest.fn();
const mockGetPushPublicKey = jest.fn();
const mockGetPushStatus = jest.fn();
const mockListPushSubscriptions = jest.fn();
const mockRevokePushSubscription = jest.fn();
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
let mockPreferences: NotificationPreferences | undefined;
let mockIsLoading = false;
let mockIsError = false;

type PreferencesMutationOptions = {
  onSuccess?: (data: NotificationPreferences) => void;
  onError?: () => void;
};

jest.mock("sonner", () => ({
  toast: {
    error: (message: string) => mockToastError(message),
    success: (message: string) => mockToastSuccess(message),
  },
}));

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

jest.mock("@/lib/browser-push", () => ({
  BrowserPushErrorCode: {
    Unsupported: "unsupported",
    InsecureContext: "insecure_context",
    PermissionDenied: "permission_denied",
    MissingPublicKey: "missing_public_key",
    InvalidPublicKey: "invalid_public_key",
    SubscriptionFailed: "subscription_failed",
    IncompleteSubscription: "incomplete_subscription",
    BackendRegistrationFailed: "backend_registration_failed",
  },
  getBrowserPushErrorCode: (error: unknown) => {
    if (typeof error !== "object" || error === null || !("code" in error)) {
      return null;
    }
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  },
  getBrowserPushErrorDetail: (error: unknown) => {
    if (typeof error !== "object" || error === null || !("detail" in error)) {
      return null;
    }
    const detail = (error as { detail?: unknown }).detail;
    return typeof detail === "string" ? detail : null;
  },
  getBrowserPushSupportState: () => mockGetBrowserPushSupportState(),
  getCurrentBrowserPushSubscription: () =>
    mockGetCurrentBrowserPushSubscription(),
  subscribeCurrentBrowserToPush: (publicKey: string) =>
    mockSubscribeCurrentBrowserToPush(publicKey),
  revokeCurrentBrowserPushSubscription: () =>
    mockRevokeCurrentBrowserPushSubscription(),
  hashPushEndpoint: (endpoint: string | null | undefined) =>
    mockHashPushEndpoint(endpoint),
}));

jest.mock("@/services/notifications.service", () => ({
  getPushPublicKey: () => mockGetPushPublicKey(),
  getPushStatus: () => mockGetPushStatus(),
  listPushSubscriptions: () => mockListPushSubscriptions(),
  revokePushSubscription: (id: string) => mockRevokePushSubscription(id),
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
    suggestion_ready_enabled: true,
    slot_start_enabled: true,
    recording_reminder_enabled: true,
    product_expiry_alerts_enabled: true,
    product_expiry_notice_days: 14,
    suggestion_lead_time_minutes: 120,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:30",
    quiet_hours_end: "06:30",
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
    mockGetBrowserPushSupportState.mockReturnValue("unsupported");
    mockGetCurrentBrowserPushSubscription.mockResolvedValue(null);
    mockHashPushEndpoint.mockImplementation(
      async (endpoint: string | null | undefined) =>
        endpoint ? "abcd" : null,
    );
    mockSubscribeCurrentBrowserToPush.mockResolvedValue(undefined);
    mockRevokeCurrentBrowserPushSubscription.mockResolvedValue(undefined);
    mockGetPushPublicKey.mockResolvedValue("public-key");
    mockGetPushStatus.mockResolvedValue({
      active_subscriptions: 0,
      web_push_subscriptions: 0,
      mobile_subscriptions: 0,
      failing_subscriptions: 0,
      recent_delivery_statuses: {
        sending: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
      },
      pending_retries: 0,
      exhausted_failures: 0,
      stale_sending: 0,
    });
    mockListPushSubscriptions.mockResolvedValue([]);
    mockRevokePushSubscription.mockResolvedValue(undefined);
    mockUpdatePreferencesMutate.mockImplementation(
      (
        payload: UpdatePreferencesPayload,
        options?: PreferencesMutationOptions,
      ) => {
        const nextPreferences = {
          ...(mockPreferences ?? preferences()),
          ...payload,
        };
        mockPreferences = nextPreferences;
        options?.onSuccess?.(nextPreferences);
      },
    );
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

  it("persists each alert preference independently", async () => {
    renderWithProviders(<NotificationsTab />);

    await user.click(
      screen.getByRole("switch", {
        name: "Notify me when AI flags a possible reaction",
      }),
    );
    await user.click(
      screen.getByRole("switch", {
        name: "Auto-simplify routine on moderate/severe reactions",
      }),
    );
    await user.click(
      screen.getByRole("switch", {
        name: "Insight notifications",
      }),
    );
    await user.click(
      screen.getByRole("switch", {
        name: "Use AI refined wording and AI sourced insight cards",
      }),
    );
    await user.click(
      screen.getByRole("switch", {
        name: "Wrapped ready notifications",
      }),
    );

    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { reaction_alerts_enabled: false },
      expect.any(Object),
    );
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { simplification_alerts_enabled: false },
      expect.any(Object),
    );
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { insight_alerts_enabled: false },
      expect.any(Object),
    );
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { ai_polished_insights_enabled: false },
      expect.any(Object),
    );
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { wrapped_alerts_enabled: false },
      expect.any(Object),
    );
  });

  it("persists product expiry alert settings", async () => {
    renderWithProviders(<NotificationsTab />);

    const noticeDays = screen.getByLabelText(
      "Notify me days before expiry",
    );
    await user.clear(noticeDays);
    await user.type(noticeDays, "30");
    await user.tab();
    await user.click(
      screen.getByRole("switch", {
        name: "Product expiry alerts",
      }),
    );

    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { product_expiry_alerts_enabled: false },
      expect.any(Object),
    );
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { product_expiry_notice_days: 30 },
      expect.any(Object),
    );
  });

  it("rolls back the product expiry notice days input when saving fails", async () => {
    mockUpdatePreferencesMutate.mockImplementation(
      (
        _payload: UpdatePreferencesPayload,
        options?: PreferencesMutationOptions,
      ) => {
        options?.onError?.();
      },
    );

    renderWithProviders(<NotificationsTab />);

    const noticeDays = screen.getByLabelText("Notify me days before expiry");
    await user.clear(noticeDays);
    await user.type(noticeDays, "30");
    await user.tab();

    await waitFor(() => expect(noticeDays).toHaveValue(14));
    expect(mockToastError).toHaveBeenCalledWith(
      "Could not save notification settings.",
    );
  });

  it("enables browser push and persists the push channel", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockGetCurrentBrowserPushSubscription.mockResolvedValue(null);

    renderWithProviders(<NotificationsTab />);

    const browserPushSwitch = screen.getByRole("switch", {
      name: "Browser push",
    });
    const photoReminderPushChannel = screen.getByLabelText("Push");
    expect(photoReminderPushChannel).toBeDisabled();

    await user.click(browserPushSwitch);

    expect(mockGetPushPublicKey).toHaveBeenCalled();
    expect(mockSubscribeCurrentBrowserToPush).toHaveBeenCalledWith(
      "public-key",
    );
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { channels: ["email", "in_app", "push"] },
      expect.any(Object),
    );
    await waitFor(() => expect(browserPushSwitch).toBeChecked());
    await waitFor(() => expect(photoReminderPushChannel).toBeChecked());
    expect(photoReminderPushChannel).toBeEnabled();
    expect(mockToastSuccess).toHaveBeenCalledWith("Browser push enabled.");
  });

  it("keeps the photo reminder push channel disabled when photo reminders are off", async () => {
    mockPreferences = preferences({
      photo_reminder_enabled: false,
      channels: ["email", "in_app", "push"],
    });

    renderWithProviders(<NotificationsTab />);

    const photoReminderPushChannel = screen.getByLabelText("Push");
    expect(photoReminderPushChannel).toBeChecked();
    expect(photoReminderPushChannel).toBeDisabled();

    await user.click(photoReminderPushChannel);

    expect(mockUpdatePreferencesMutate).not.toHaveBeenCalledWith(
      { channels: ["email", "in_app"] },
      expect.any(Object),
    );
  });

  it("disables every photo reminder channel when photo reminders are off", () => {
    mockPreferences = preferences({
      photo_reminder_enabled: false,
      channels: ["email", "in_app", "push"],
    });

    renderWithProviders(<NotificationsTab />);

    expect(screen.getByLabelText("In-app")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Push")).toBeDisabled();
  });

  it("cleans up the browser subscription when push channel persistence fails", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockGetCurrentBrowserPushSubscription.mockResolvedValue(null);
    mockUpdatePreferencesMutate.mockImplementation(
      (
        _payload: UpdatePreferencesPayload,
        options?: PreferencesMutationOptions,
      ) => {
        options?.onError?.();
      },
    );

    renderWithProviders(<NotificationsTab />);

    await user.click(screen.getByRole("switch", { name: "Browser push" }));

    await waitFor(() =>
      expect(mockRevokeCurrentBrowserPushSubscription).toHaveBeenCalled(),
    );
    expect(mockToastError).toHaveBeenCalledWith(
      "Could not save notification settings.",
    );
    expect(mockToastSuccess).not.toHaveBeenCalledWith("Browser push enabled.");
  });

  it("shows a specific error when browser permission is not granted", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockSubscribeCurrentBrowserToPush.mockRejectedValue({
      code: "permission_denied",
    });

    renderWithProviders(<NotificationsTab />);

    await user.click(screen.getByRole("switch", { name: "Browser push" }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "Browser notification permission was not granted.",
      ),
    );
  });

  it("shows a specific error when the server has no push configuration", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockGetPushPublicKey.mockRejectedValue(
      new ApiError("Push unavailable", { status: 503 }),
    );

    renderWithProviders(<NotificationsTab />);

    await user.click(screen.getByRole("switch", { name: "Browser push" }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Push unavailable"),
    );
  });

  it("shows the backend message when subscription registration fails", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockSubscribeCurrentBrowserToPush.mockRejectedValue({
      code: "backend_registration_failed",
      detail: "Missing web keys",
    });

    renderWithProviders(<NotificationsTab />);

    await user.click(screen.getByRole("switch", { name: "Browser push" }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Missing web keys"),
    );
  });

  it("shows a concise error when the browser push service rejects subscription", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockSubscribeCurrentBrowserToPush.mockRejectedValue({
      code: "subscription_failed",
    });

    renderWithProviders(<NotificationsTab />);

    await user.click(screen.getByRole("switch", { name: "Browser push" }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Subscription failed."),
    );
  });

  it("renders the browser push description once", async () => {
    renderWithProviders(<NotificationsTab />);

    await waitFor(() =>
      expect(
        screen.queryByTestId("browser-push-devices-skeleton"),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getAllByText(
        "Send device notifications from this browser for enabled notification types.",
      ),
    ).toHaveLength(1);
  });

  it("allows push to be disabled when browser permission is denied", async () => {
    mockPreferences = preferences({ channels: ["in_app", "push"] });
    mockGetBrowserPushSupportState.mockReturnValue("denied");

    renderWithProviders(<NotificationsTab />);

    const browserPushSwitch = screen.getByRole("switch", {
      name: "Browser push",
    });
    expect(browserPushSwitch).toBeEnabled();

    await user.click(browserPushSwitch);

    expect(mockRevokeCurrentBrowserPushSubscription).toHaveBeenCalled();
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith(
      { channels: ["in_app"] },
      expect.any(Object),
    );
  });

  it("shows a skeleton while browser push devices are loading", () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockListPushSubscriptions.mockImplementation(
      () => new Promise<never>(() => undefined),
    );

    renderWithProviders(<NotificationsTab />);

    expect(
      screen.getByTestId("browser-push-devices-skeleton"),
    ).toBeInTheDocument();
  });

  it("renders connected push devices and revokes one device", async () => {
    mockGetBrowserPushSupportState.mockReturnValue("supported");
    mockGetCurrentBrowserPushSubscription.mockResolvedValue({
      endpoint: "https://push.example/current",
      unsubscribe: jest.fn().mockResolvedValue(true),
    });
    mockListPushSubscriptions.mockResolvedValue([
      {
        id: "sub-1",
        provider: PushProviderValue.WebPush,
        platform: PushPlatformValue.Web,
        endpoint_hash: "abcd",
        device_name: "Chrome on web",
        last_seen_at: "2026-05-01T08:00:00.000Z",
        created_at: "2026-05-01T08:00:00.000Z",
        failure_count: 1,
        last_failure_at: "2026-05-01T08:05:00.000Z",
        last_failure_reason: "Provider overloaded",
      },
    ]);
    mockGetPushStatus.mockResolvedValue({
      active_subscriptions: 1,
      web_push_subscriptions: 1,
      mobile_subscriptions: 0,
      failing_subscriptions: 1,
      recent_delivery_statuses: {
        sending: 0,
        sent: 0,
        failed: 1,
        skipped: 0,
      },
      pending_retries: 1,
      exhausted_failures: 0,
      stale_sending: 0,
    });

    renderWithProviders(<NotificationsTab />);

    expect(await screen.findByText("Chrome on web")).toBeInTheDocument();
    expect(screen.getByText("This browser")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(mockRevokePushSubscription).toHaveBeenCalledWith("sub-1");
  });
});
