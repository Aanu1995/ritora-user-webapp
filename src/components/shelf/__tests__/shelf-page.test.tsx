import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

const mockProducts: ShelfProduct[] = [
  {
    id: 'p1',
    identity: {
      brand: 'CeraVe',
      name: 'Resurfacing Retinol Serum',
      category: ProductCategory.Serum,
      barcode: null,
      imageUrls: [],
      sizeMl: 30,
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
      brand: 'CeraVe',
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
    },
    userFields: {
      openedAt: '2026-03-27T00:00:00.000Z',
      expiresAt: '2027-02-14T00:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.UserEntered,
    createdAt: '2026-03-27T00:00:00.000Z',
    updatedAt: '2026-03-27T00:00:00.000Z',
  },
];

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf',
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseShelfProducts = jest.fn();
const mockUseShelfStats = jest.fn();
const mockFetchNextPage = jest.fn();

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProducts: () => mockUseShelfProducts(),
  useShelfStats: () => mockUseShelfStats(),
  useArchiveProducts: () => ({ archive: jest.fn(), isPending: false }),
  useMarkFinished: () => ({ markFinished: jest.fn(), isPending: false }),
  useDeleteProducts: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateProduct: () => ({ mutate: jest.fn(), isPending: false }),
  useResolveUrl: () => ({ mutate: jest.fn(), isPending: false }),
  useSearchCatalogue: () => ({ data: [], isFetching: false }),
}));

import { ShelfPage } from '@/components/shelf/shelf-page';

beforeEach(() => {
  mockUseShelfProducts.mockReset();
  mockUseShelfStats.mockReset();
  mockFetchNextPage.mockReset();
});

describe('ShelfPage', () => {
  it('renders the empty state when there are no products and not loading', () => {
    mockUseShelfProducts.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: {},
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(
      screen.getByRole('heading', { name: /your shelf is empty/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add your first product/i }),
    ).toBeInTheDocument();
  });

  it('renders the loading skeleton while products are pending', () => {
    mockUseShelfProducts.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument();
  });

  it('renders the product grid when products are present', () => {
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1, 'in-use': 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(
      screen.getByText(/resurfacing retinol/i),
    ).toBeInTheDocument();
  });

  it('does not include morning/evening counts in any subtitle text', () => {
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(screen.queryByText(/morning routine/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/evening routine/i)).not.toBeInTheDocument();
  });

  it('shows load more when another inventory page exists', async () => {
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    screen.getByRole('button', { name: /load more/i }).click();

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('renders a retry state when the shelf request fails without cached data', () => {
    mockUseShelfProducts.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: jest.fn(),
    });
    mockUseShelfStats.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(
      screen.getByRole('heading', { name: /we couldn't load your shelf/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
