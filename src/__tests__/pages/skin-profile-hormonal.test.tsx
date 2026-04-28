import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import type { SkinProfile, SkinProfileOptions } from "@/types/skin-profile";

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

jest.mock("next/navigation", () => ({
  usePathname: () => "/skin-profile/hormonal",
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useSkinProfile: () => mockSkinProfileReturn,
  useSkinProfileOptions: () => mockOptionsReturn,
  useUpdateSkinProfile: () => ({ mutate: jest.fn(), isPending: false }),
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
});
