import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import messages from "../../../messages/en.json";
import { AppPreferencesProvider } from "@/components/preferences/app-preferences-provider";
import { QueryKey } from "@/constants/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import {
  useSkinProfile,
  useSkinProfileAccessLogs,
  useSkinProfileOptions,
  useCreateSkinProfile,
  useUpdateSkinProfile,
} from "@/hooks/use-skin-profile";
import {
  mockSkinProfileAccessLogs,
  mockSkinProfile,
  mockSkinProfileOptions,
} from "@/test/skin-profile-fixtures";

const mockProfile = mockSkinProfile;
const mockOptions = mockSkinProfileOptions;

jest.mock("@/services/skin-profile.service", () => ({
  getSkinProfile: jest.fn(),
  getSkinProfileAccessLogs: jest.fn(),
  getSkinProfileOptions: jest.fn(),
  createSkinProfile: jest.fn(),
  updateSkinProfile: jest.fn(),
  deleteSkinProfile: jest.fn(),
}));

import * as skinProfileService from "@/services/skin-profile.service";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderSkinProfileHook<T>(hook: () => T, queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient();

  return {
    queryClient: client,
    ...renderHook(hook, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NextIntlClientProvider locale="en" messages={messages}>
          <AppPreferencesProvider>
            <QueryClientProvider client={client}>
              {children}
            </QueryClientProvider>
          </AppPreferencesProvider>
        </NextIntlClientProvider>
      ),
    }),
  };
}

afterEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe("useSkinProfile", () => {
  it("fetches profile when authenticated", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (skinProfileService.getSkinProfile as jest.Mock).mockResolvedValue(
      mockProfile,
    );

    const { result } = renderSkinProfileHook(() => useSkinProfile());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.skinType).toBe("oily");
    expect(result.current.data?.currentConcerns).toEqual(["acne"]);
  });

  it("does not fetch when unauthenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { result } = renderSkinProfileHook(() => useSkinProfile());

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSkinProfileOptions", () => {
  it("fetches options", async () => {
    (skinProfileService.getSkinProfileOptions as jest.Mock).mockResolvedValue(
      mockOptions,
    );

    const { result } = renderSkinProfileHook(() => useSkinProfileOptions());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.skinTypes).toEqual(mockOptions.skinTypes);
  });
});

describe("useSkinProfileAccessLogs", () => {
  it("fetches access logs when authenticated", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (
      skinProfileService.getSkinProfileAccessLogs as jest.Mock
    ).mockResolvedValue(mockSkinProfileAccessLogs);

    const { result } = renderSkinProfileHook(() => useSkinProfileAccessLogs());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSkinProfileAccessLogs);
  });
});

describe("useCreateSkinProfile", () => {
  it("creates a profile", async () => {
    (skinProfileService.createSkinProfile as jest.Mock).mockResolvedValue(
      mockProfile,
    );

    const queryClient = createTestQueryClient();
    const { result } = renderSkinProfileHook(
      () => useCreateSkinProfile(),
      queryClient,
    );

    await act(
      () =>
        new Promise<void>((resolve, reject) => {
          result.current.mutate(
            {
              skinType: "oily",
              currentConcerns: ["acne"],
            },
            { onSuccess: () => resolve(), onError: reject },
          );
        }),
    );

    expect(skinProfileService.createSkinProfile).toHaveBeenCalledWith({
      skinType: "oily",
      currentConcerns: ["acne"],
    });
    expect(queryClient.getQueryData([QueryKey.SkinProfile])).toEqual(
      mockProfile,
    );
  });
});

describe("useUpdateSkinProfile", () => {
  it("updates a profile", async () => {
    (skinProfileService.updateSkinProfile as jest.Mock).mockResolvedValue({
      ...mockProfile,
      skinType: "combination",
    });

    const queryClient = createTestQueryClient();
    const { result } = renderSkinProfileHook(
      () => useUpdateSkinProfile(),
      queryClient,
    );

    await act(
      () =>
        new Promise<void>((resolve, reject) => {
          result.current.mutate(
            { skinType: "combination" },
            { onSuccess: () => resolve(), onError: reject },
          );
        }),
    );

    expect(skinProfileService.updateSkinProfile).toHaveBeenCalledWith({
      skinType: "combination",
    });
    expect(queryClient.getQueryData([QueryKey.SkinProfile])).toEqual({
      ...mockProfile,
      skinType: "combination",
    });
  });
});
