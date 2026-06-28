import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from "@/types/shelf";
import { ApplicationProductPicker } from "../application-product-picker";

const mockUseShelfProducts = jest.fn();

jest.mock("@/hooks/use-shelf", () => ({
  useShelfProducts: (...args: unknown[]) => mockUseShelfProducts(...args),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({
    timeZone: "Europe/Stockholm",
    todayDate: "2026-06-28",
  }),
}));

function createProduct(id: number): ShelfProduct {
  return {
    id: `product-${id}`,
    identity: {
      brand: `Brand ${id}`,
      name: `Shelf Product ${id}`,
      category: ProductCategory.Moisturizer,
      barcode: null,
      imageUrls: [],
      sizeMl: null,
      description: null,
      benefits: [],
      suitedFor: [],
      inciIngredients: [],
      inciLastConfirmedAt: null,
    },
    guidance: {
      applicationMethod: null,
      quantity: null,
      steps: [],
      cautions: [],
      waitMinutes: null,
    },
    manufacturer: {
      brand: `Brand ${id}`,
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
    },
    userFields: {
      openedAt: null,
      expiresAt: null,
      periodAfterOpeningMonths: null,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.PhotoLookup,
    createdAt: "2026-06-28T00:00:00.000Z",
    updatedAt: "2026-06-28T00:00:00.000Z",
  };
}

describe("ApplicationProductPicker", () => {
  beforeEach(() => {
    mockUseShelfProducts.mockReset();
    mockUseShelfProducts.mockReturnValue({
      data: Array.from({ length: 10 }, (_item, index) =>
        createProduct(index + 1),
      ),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchNextPageError: false,
      isFetchingNextPage: false,
      isLoading: false,
    });
  });

  it("shows every loaded shelf product instead of capping the list at eight", () => {
    renderWithProviders(
      <ApplicationProductPicker disabled={false} onSelect={jest.fn()} />,
    );

    expect(screen.getByText("Shelf Product 1")).toBeInTheDocument();
    expect(screen.getByText("Shelf Product 10")).toBeInTheDocument();
  });

  it("loads the next shelf page when more products are available", async () => {
    const fetchNextPage = jest.fn();
    mockUseShelfProducts.mockReturnValue({
      data: [createProduct(1)],
      fetchNextPage,
      hasNextPage: true,
      isFetchNextPageError: false,
      isFetchingNextPage: false,
      isLoading: false,
    });

    renderWithProviders(
      <ApplicationProductPicker disabled={false} onSelect={jest.fn()} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /load more products/i }),
    );

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
