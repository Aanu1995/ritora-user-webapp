import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ApiError } from "@/lib/api-error";
import {
  getAppScrollPosition,
  saveAppScrollPosition,
} from "@/lib/app-scroll-restoration";
import type { SkinProfile, SkinProfileOptions } from "@/types/skin-profile";

type RefetchMock = jest.Mock<Promise<void>, []>;

type SkinProfileQueryMock = {
  data: SkinProfile | null;
  isPending: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: RefetchMock;
};

type SkinProfileOptionsQueryMock = {
  data: SkinProfileOptions | null;
  isPending: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: RefetchMock;
};

let mockSkinProfileReturn: SkinProfileQueryMock;
let mockOptionsReturn: SkinProfileOptionsQueryMock;

jest.mock("next/navigation", () => ({
  usePathname: () => "/skin-profile",
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => mockSkinProfileReturn,
  useSkinProfileOptions: () => mockOptionsReturn,
  useCreateSkinProfile: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateSkinProfile: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/lib/post-login-route", () => ({
  hasMissingSkinProfileHandoff: jest.fn(() => false),
  consumeMissingSkinProfileHandoff: jest.fn(() => false),
}));

import SkinProfilePage from "@/app/(app)/skin-profile/page";
import {
  hasMissingSkinProfileHandoff,
} from "@/lib/post-login-route";
import {
  mockSkinProfile,
  mockSkinProfileOptions,
} from "@/test/skin-profile-fixtures";

const createRefetchMock = (): RefetchMock => jest.fn(() => Promise.resolve());

const completeProfile: SkinProfile = {
  ...mockSkinProfile,
  countryCode: "SE",
  city: "Stockholm",
  createdAt: "2026-04-15T10:00:00.000Z",
  updatedAt: "2026-04-15T10:00:00.000Z",
};

describe("SkinProfilePage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    window.sessionStorage.clear();
    mockOptionsReturn = {
      data: mockSkinProfileOptions,
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };
  });

  it("shows skeleton while loading", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: true,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(
      screen.getByRole("heading", { name: /skin profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("skin-profile-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("skin-profile-skeleton")).toHaveAttribute(
      "data-skeleton-mode",
      "onboarding",
    );
    expect(screen.queryByText(/what best describes/i)).not.toBeInTheDocument();
  });

  it("uses the overview skeleton when an existing profile is refetching", () => {
    mockSkinProfileReturn = {
      data: completeProfile,
      isPending: true,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);

    expect(screen.getByTestId("skin-profile-skeleton")).toHaveAttribute(
      "data-skeleton-mode",
      "overview",
    );
  });

  it("keeps the page header visible when profile loading fails", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Server error", { status: 500 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);

    expect(
      screen.getByRole("heading", { name: /skin profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/we couldn't load your profile/i),
    ).toBeInTheDocument();
  });

  it("keeps the page header visible when profile options fail to load", () => {
    mockSkinProfileReturn = {
      data: completeProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };
    mockOptionsReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Server error", { status: 500 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);

    expect(
      screen.getByRole("heading", { name: /skin profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows the wizard when no profile exists (404)", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(
      screen.getByText(/tell us your skin baseline/i),
    ).toBeInTheDocument();
  });

  it("shows the wizard without fetching profile again when login already confirmed no profile", () => {
    (hasMissingSkinProfileHandoff as jest.Mock).mockReturnValueOnce(true);
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(
      screen.getByText(/tell us your skin baseline/i),
    ).toBeInTheDocument();
  });

  it("shows the overview if cached profile data exists even after a missing-profile handoff", () => {
    (hasMissingSkinProfileHandoff as jest.Mock).mockReturnValueOnce(true);
    mockSkinProfileReturn = {
      data: completeProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(screen.getByText("Oily")).toBeInTheDocument();
    expect(
      screen.queryByText(/tell us your skin baseline/i),
    ).not.toBeInTheDocument();
  });

  it("shows skin type chips on step 1", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(screen.getByRole("radio", { name: /oily/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /dry/i })).toBeInTheDocument();
  });

  it("shows Zod validation messages when continuing with incomplete baseline", async () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/pick a skin type/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your date of birth/i)).toBeInTheDocument();
    expect(screen.getByText(/pick a sex at birth/i)).toBeInTheDocument();
  });

  it("navigates to step 2 after selecting skin type and clicking continue", async () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole("radio", { name: /oily/i }));
    await user.click(screen.getByRole("radio", { name: "Medium" }));
    await user.type(screen.getByLabelText(/date of birth day/i), "15");
    await user.type(screen.getByLabelText(/date of birth month/i), "04");
    await user.type(screen.getByLabelText(/date of birth year/i), "1992");
    await user.click(screen.getByRole("radio", { name: /female/i }));
    await user.click(screen.getByRole("radio", { name: /black/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/what concerns you most/i),
    ).toBeInTheDocument();
  });

  it("does not show a skip action in the essential track", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(
      screen.queryByRole("button", { name: /skip/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the overview when a profile exists", () => {
    mockSkinProfileReturn = {
      data: completeProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(screen.getByText("Oily")).toBeInTheDocument();
    expect(screen.getAllByText("Acne").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/edit/i).length).toBeGreaterThan(0);
  });

  it("renders saved free-text option values without missing-message crashes", () => {
    mockSkinProfileReturn = {
      data: {
        ...completeProfile,
        currentConcerns: ["post-breakout marks"],
        primaryGoal: "calm redness while improving texture slowly",
        routinePreferences: {
          ...completeProfile.routinePreferences,
          pace: "slow",
        },
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };

    renderWithProviders(<SkinProfilePage />);

    expect(screen.getByText("Post-breakout marks")).toBeInTheDocument();
    expect(
      screen.getByText("Calm redness while improving texture slowly"),
    ).toBeInTheDocument();
    expect(screen.getByText("Slow")).toBeInTheDocument();
  });

  it.each([
    "/skin-profile/medical-safety",
    "/skin-profile/reactions",
    "/skin-profile/active-tolerance",
  ])("saves overview scroll before opening %s", async (href) => {
    mockSkinProfileReturn = {
      data: completeProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: createRefetchMock(),
    };
    const scrollRoot = document.createElement("main");
    scrollRoot.setAttribute("data-app-scroll-root", "");
    Object.defineProperty(scrollRoot, "scrollTop", {
      configurable: true,
      value: 640,
    });
    document.body.appendChild(scrollRoot);

    const { container } = renderWithProviders(<SkinProfilePage />);
    const optionalSectionLink = container.querySelector<HTMLAnchorElement>(
      `a[href="${href}"]`,
    );

    expect(optionalSectionLink).not.toBeNull();
    await user.click(optionalSectionLink!);
    saveAppScrollPosition("/skin-profile", 0);

    expect(getAppScrollPosition("/skin-profile")).toBe(640);
    scrollRoot.remove();
  });
});
