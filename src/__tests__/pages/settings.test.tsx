import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@/types/auth";
import { AppRoute } from "@/constants/app-routes";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/utils";

const mockLogoutMutate = jest.fn();
const mockUpdateProfileMutate = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => AppRoute.Settings,
}));

jest.mock("@/hooks/use-auth", () => ({
  useLogout: () => ({
    mutate: mockLogoutMutate,
    isPending: false,
  }),
  useUpdateProfile: () => ({
    mutate: mockUpdateProfileMutate,
    isPending: false,
  }),
}));

import SettingsPage from "@/app/(app)/settings/page";

describe("SettingsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("renders the settings page with tabs", () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /privacy/i })).toBeInTheDocument();
  });

  it("shows account info on the default Account tab", () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(mockLogoutMutate).toHaveBeenCalledTimes(1);
  });

  it("switches to Appearance tab and shows theme controls", async () => {
    renderWithProviders(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /appearance/i }));
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });
});
