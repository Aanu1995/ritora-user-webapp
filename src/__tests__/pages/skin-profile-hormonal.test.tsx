import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import type {
  SkinProfile,
  SkinProfileInput,
  SkinProfileOptions,
} from "@/types/skin-profile";

type RefetchMock = jest.Mock<Promise<void>, []>;

type SkinProfileQueryMock = {
  data: SkinProfile | null;
  isPending: boolean;
  isError: boolean;
  refetch: RefetchMock;
};

type SkinProfileOptionsQueryMock = {
  data: SkinProfileOptions | null;
  isPending: boolean;
  isError: boolean;
  refetch: RefetchMock;
};

let mockSkinProfileReturn: SkinProfileQueryMock;
let mockOptionsReturn: SkinProfileOptionsQueryMock;
let mockRouterPush: jest.MockedFunction<(href: string) => void>;
let mockRouterReplace: jest.MockedFunction<(href: string) => void>;
let mockSearchParams: URLSearchParams;
let mockUpdateMutate: jest.MockedFunction<
  (
    variables: SkinProfileInput,
    options?: { onSuccess?: (profile: SkinProfile) => void },
  ) => void
>;

jest.mock("next/navigation", () => ({
  usePathname: () => "/skin-profile/hormonal",
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    refresh: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => mockSkinProfileReturn,
  useSkinProfileOptions: () => mockOptionsReturn,
  useUpdateSkinProfile: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useDeleteSkinProfileHormonalContext: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

import HormonalPage from "@/app/(app)/skin-profile/hormonal/page";
import {
  mockSkinProfile,
  mockSkinProfileOptions,
} from "@/test/skin-profile-fixtures";

const createRefetchMock = (): RefetchMock => jest.fn(() => Promise.resolve());

describe("HormonalPage", () => {
  beforeEach(() => {
    mockRouterPush = jest.fn();
    mockRouterReplace = jest.fn();
    mockSearchParams = new URLSearchParams();
    mockUpdateMutate = jest.fn((variables, options) => {
      options?.onSuccess?.({
        ...mockSkinProfile,
        ...variables,
      });
    });
    mockSkinProfileReturn = {
      data: { ...mockSkinProfile, hasHormonalContextConsent: true },
      isPending: false,
      isError: false,
      refetch: createRefetchMock(),
    };
    mockOptionsReturn = {
      data: mockSkinProfileOptions,
      isPending: false,
      isError: false,
      refetch: createRefetchMock(),
    };
  });

  it("renders the hormonal context form with a header save action", () => {
    renderWithProviders(<HormonalPage />);

    expect(
      screen.getByRole("heading", { name: /hormonal context/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/how predictable is your cycle pattern/i),
    ).toBeInTheDocument();
  });

  it("renders a section-shaped skeleton while loading", () => {
    mockOptionsReturn = {
      ...mockOptionsReturn,
      isPending: true,
    };

    renderWithProviders(<HormonalPage />);

    expect(screen.getByTestId("skin-profile-skeleton")).toHaveAttribute(
      "data-skeleton-mode",
      "section",
    );
  });

  it("returns to the source page after a successful save", async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams();
    mockSearchParams.set("returnTo", "/settings?tab=skin");

    renderWithProviders(<HormonalPage />);

    await user.click(screen.getByRole("button", { name: "Regular" }));
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockRouterReplace).toHaveBeenCalledWith("/settings?tab=skin");
  });
});
