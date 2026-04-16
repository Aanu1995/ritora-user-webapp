import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ApiError } from "@/lib/api-error";

let mockSkinProfileReturn: {
  data: unknown;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: jest.Mock;
};

let mockOptionsReturn: {
  data: unknown;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: jest.Mock;
};

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

import SkinProfilePage from "@/app/(app)/skin-profile/page";

const mockOptions = {
  skinTypes: ["oily", "dry", "combination", "normal", "sensitive"],
  skinTones: ["light", "medium", "dark"],
  ageRanges: ["18_24", "25_34"],
  ethnicities: ["black", "white_caucasian"],
  concerns: ["acne", "dark_marks", "dryness"],
  goals: ["clear_acne", "fade_dark_marks"],
  complexities: ["minimal", "moderate", "comprehensive"],
};

const completeProfile = {
  id: "profile-1",
  skinType: "oily",
  skinTone: "medium",
  ageRange: "25_34",
  ethnicity: "black",
  currentConcerns: ["acne"],
  knownSensitivities: ["Fragrance"],
  skinGoals: ["clear_acne"],
  countryCode: "SE",
  city: "Stockholm",
  routineComplexity: "moderate",
  createdAt: "2026-04-15T10:00:00.000Z",
  updatedAt: "2026-04-15T10:00:00.000Z",
};

describe("SkinProfilePage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockOptionsReturn = {
      data: mockOptions,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };
  });

  it("shows skeleton while loading", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    renderWithProviders(<SkinProfilePage />);
    // Skeleton renders animated pulse elements
    expect(screen.queryByText(/what best describes/i)).not.toBeInTheDocument();
  });

  it("shows the wizard when no profile exists (404)", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: jest.fn(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(
      screen.getByText(/what best describes your skin/i),
    ).toBeInTheDocument();
  });

  it("shows skin type chips on step 1", () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: jest.fn(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(screen.getByRole("radio", { name: /oily/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /dry/i })).toBeInTheDocument();
  });

  it("navigates to step 2 after selecting skin type and clicking continue", async () => {
    mockSkinProfileReturn = {
      data: null,
      isPending: false,
      isError: true,
      error: new ApiError("Not found", { status: 404 }),
      refetch: jest.fn(),
    };

    renderWithProviders(<SkinProfilePage />);

    await user.click(screen.getByRole("radio", { name: /oily/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByText(/what concerns you most/i),
    ).toBeInTheDocument();
  });

  it("shows the overview when a profile exists", () => {
    mockSkinProfileReturn = {
      data: completeProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    renderWithProviders(<SkinProfilePage />);
    expect(screen.getByText("Oily")).toBeInTheDocument();
    expect(screen.getByText("Fragrance")).toBeInTheDocument();
    expect(screen.getAllByText(/edit/i).length).toBeGreaterThan(0);
  });
});
