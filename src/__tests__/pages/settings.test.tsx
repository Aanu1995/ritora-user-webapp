import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@/types/auth";
import { AppRoute } from "@/constants/app-routes";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";

const mockLogoutMutate = jest.fn();
const mockLogoutAllMutate = jest.fn();
const mockDeleteAccountMutate = jest.fn();
const mockUpdateProfileMutate = jest.fn();
const mockUpdatePreferredLanguageMutate = jest.fn();
const mockUpdateTimeZoneMutate = jest.fn();
const mockUpdateAiConsentMutate = jest.fn();
const mockCreateSupportFeedbackMutate = jest.fn();
const mockRouterRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => AppRoute.Settings,
  useRouter: () => ({
    refresh: mockRouterRefresh,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/hooks/use-auth", () => ({
  useLogout: () => ({
    mutate: mockLogoutMutate,
    isPending: false,
  }),
  useLogoutAll: () => ({
    mutate: mockLogoutAllMutate,
    isPending: false,
  }),
  useDeleteAccount: () => ({
    mutate: mockDeleteAccountMutate,
    isPending: false,
  }),
  useUpdateProfile: () => ({
    mutate: mockUpdateProfileMutate,
    isPending: false,
  }),
  useUpdatePreferredLanguage: () => ({
    mutate: mockUpdatePreferredLanguageMutate,
    isPending: false,
  }),
  useUpdateTimeZone: () => ({
    mutate: mockUpdateTimeZoneMutate,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => ({ data: null }),
  useSkinProfileAccessLogs: () => ({ data: [], isLoading: false }),
  useUpdateSkinProfile: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteSkinProfileHealthContext: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useDeleteSkinProfileHormonalContext: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useSuggestionAiConsent: () => ({
    data: {
      granted: false,
      grantedAt: null,
      canReadSensitiveContext: false,
      blockedReason: "ai_suggestion_processing_consent_missing",
      activeSensitiveConsentTypes: [],
    },
    isLoading: false,
  }),
  useUpdateSuggestionAiConsent: () => ({
    mutate: mockUpdateAiConsentMutate,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-support", () => ({
  useCreateSupportFeedback: () => ({
    mutate: mockCreateSupportFeedbackMutate,
    isPending: false,
  }),
}));

import SettingsPage from "@/app/(app)/settings/page";

describe("SettingsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatePreferredLanguageMutate.mockImplementation(
      (
        values: { preferredLanguage: string },
        options?: { onSuccess?: () => void },
      ) => {
        options?.onSuccess?.();
      },
    );
    mockUpdateTimeZoneMutate.mockImplementation(
      (
        values: { timeZone: string },
        options?: { onSuccess?: () => void },
      ) => {
        options?.onSuccess?.();
      },
    );
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        emailVerified: true,
        hasPassword: true,
        preferredLanguage: "en",
        timeZone: "Europe/Stockholm",
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders the settings page with tabs", () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /privacy/i })).toBeInTheDocument();
  });

  it("uses the same underline indicator rail as journal tabs", () => {
    renderWithProviders(<SettingsPage />);

    const tabList = screen.getByRole("tablist");
    const rail = screen.getByTestId("settings-tab-indicator-rail");
    const scrollRegion = screen.getByTestId("settings-tab-scroll-region");
    const activeTab = screen.getByRole("tab", { selected: true });

    expect(rail).toHaveClass("border-b", "border-border");
    expect(rail).not.toHaveClass("overflow-x-auto");
    expect(scrollRegion).toHaveClass("overflow-x-auto", "pb-px");
    expect(tabList).toHaveClass("border-b-0");
    expect(activeTab).toHaveClass(
      "after:h-[2px]",
      "data-[state=active]:after:opacity-100",
    );
    expect(rail).toContainElement(tabList);
  });

  it("shows account info on the default Account tab", () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("submits support feedback from the account settings entry point", async () => {
    mockCreateSupportFeedbackMutate.mockImplementation(
      (
        _values: unknown,
        options?: { onSuccess?: () => void },
      ) => {
        options?.onSuccess?.();
      },
    );

    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /contact support/i }));
    await user.click(
      screen.getByRole("combobox", { name: "What is this about?" }),
    );
    await user.click(screen.getByRole("option", { name: "Suggestion" }));
    await user.type(screen.getByLabelText("Subject"), "Settings did not save");
    await user.type(
      screen.getByLabelText("Details"),
      "The settings page did not save my latest preference.",
    );
    await user.click(screen.getByRole("button", { name: /^send message$/i }));

    expect(mockCreateSupportFeedbackMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "The settings page did not save my latest preference.",
        title: "Settings did not save",
        type: "suggestion",
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(
      screen.queryByRole("dialog", { name: /contact ritora support/i }),
    ).not.toBeInTheDocument();
  });

  it("edits and saves the user name", async () => {
    mockUpdateProfileMutate.mockImplementation(
      (
        values: { firstName: string; lastName: string },
        options?: { onSuccess?: () => void },
      ) => {
        useAuthStore.getState().setUser({
          ...(useAuthStore.getState().user as User),
          firstName: values.firstName,
          lastName: values.lastName,
        });
        options?.onSuccess?.();
      },
    );

    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "  Ada  ");
    await user.clear(screen.getByLabelText("Last name"));
    await user.type(screen.getByLabelText("Last name"), "  Byron  ");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(mockUpdateProfileMutate).toHaveBeenCalledWith(
      { firstName: "Ada", lastName: "Byron" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(screen.getByText("Ada Byron")).toBeInTheDocument();
  });

  it("shows an inline validation error when either name is blank", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    await user.clear(screen.getByLabelText("First name"));
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "First and last name are required.",
    );
    expect(mockUpdateProfileMutate).not.toHaveBeenCalled();
  });

  it("shows the server error inline when profile update fails", async () => {
    mockUpdateProfileMutate.mockImplementation(
      (
        _values: { firstName: string; lastName: string },
        options?: { onError?: (error: Error) => void },
      ) => {
        options?.onError?.(new Error("Could not save profile"));
      },
    );

    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.clear(screen.getByLabelText("Last name"));
    await user.type(screen.getByLabelText("Last name"), "Byron");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save profile",
    );
  });

  it("calls logout when sign out button is clicked", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(
      screen.getByRole("button", { name: /^sign out$/i }),
    );
    expect(mockLogoutMutate).toHaveBeenCalledTimes(1);
  });

  it("opens confirmation before signing out from all devices", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(
      screen.getByRole("button", { name: /sign out all devices/i }),
    );

    expect(
      screen.getByRole("heading", { name: /sign out on all devices/i }),
    ).toBeInTheDocument();
    expect(mockLogoutAllMutate).not.toHaveBeenCalled();
  });

  it("calls logoutAll after confirmation", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(
      screen.getByRole("button", { name: /sign out all devices/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /^sign out all devices$/i }),
    );

    expect(mockLogoutAllMutate).toHaveBeenCalledTimes(1);
  });

  it("keeps the user signed in when all-devices sign out is cancelled", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(
      screen.getByRole("button", { name: /sign out all devices/i }),
    );
    await user.click(screen.getByRole("button", { name: /keep sessions/i }));

    expect(mockLogoutAllMutate).not.toHaveBeenCalled();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("requires the current password before scheduling account deletion", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(
      screen.getByRole("button", { name: /^delete account$/i }),
    );
    await user.type(screen.getByLabelText(/current password/i), "NewPass1!");
    await user.click(
      screen.getByRole("button", { name: /^schedule deletion$/i }),
    );

    expect(mockDeleteAccountMutate).toHaveBeenCalledWith(
      { password: "NewPass1!" },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("requests an email confirmation for OAuth-only account deletion", async () => {
    useAuthStore.setState({
      user: {
        ...(useAuthStore.getState().user as User),
        hasPassword: false,
      },
    });

    renderWithProviders(<SettingsPage />);

    await user.click(
      screen.getByRole("button", { name: /^delete account$/i }),
    );

    expect(
      screen.getByText(/send a confirmation link to your inbox/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /^send confirmation email$/i }),
    );

    expect(mockDeleteAccountMutate).toHaveBeenCalledWith(
      { password: "" },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("switches to Appearance tab and shows theme controls", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /appearance/i }));
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("updates the preferred language when the user changes it in settings", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /language/i }));
    await user.click(screen.getByRole("combobox", { name: /language/i }));
    await user.click(await screen.findByRole("option", { name: /svenska/i }));

    expect(mockUpdatePreferredLanguageMutate).toHaveBeenCalledWith(
      { preferredLanguage: "sv" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
  });

  it("does not refresh the route when the server rejects the language change", async () => {
    mockUpdatePreferredLanguageMutate.mockImplementation(
      (
        _values: { preferredLanguage: string },
        options?: { onError?: (error: Error) => void },
      ) => {
        options?.onError?.(new Error("Could not update language"));
      },
    );

    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /language/i }));
    await user.click(screen.getByRole("combobox", { name: /language/i }));
    await user.click(await screen.findByRole("option", { name: /svenska/i }));

    expect(mockUpdatePreferredLanguageMutate).toHaveBeenCalledWith(
      { preferredLanguage: "sv" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(mockRouterRefresh).not.toHaveBeenCalled();
  });

  it("updates the saved timezone from settings", async () => {
    useAuthStore.setState({
      user: {
        ...(useAuthStore.getState().user as User),
        timeZone: null,
      },
    });

    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /language/i }));
    await user.click(screen.getByRole("button", { name: /timezone/i }));
    await user.click(screen.getByRole("option", { name: /europe\/stockholm/i }));

    expect(mockUpdateTimeZoneMutate).toHaveBeenCalledWith(
      { timeZone: "Europe/Stockholm" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("lets users grant AI suggestion consent from Privacy settings", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /privacy/i }));
    expect(screen.getByText("AI suggestion processing")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /allow ai suggestions/i }),
    );

    expect(mockUpdateAiConsentMutate).toHaveBeenCalledWith(
      { granted: true },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
