import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { ApiError } from '@/lib/api-error';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

const mockReplace = jest.fn();
const mockUseShelfProduct = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf/product-1',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProduct: (...args: unknown[]) => mockUseShelfProduct(...args),
  useArchiveProduct: () => ({ mutate: jest.fn(), isPending: false }),
  useRestoreProduct: () => ({ mutate: jest.fn(), isPending: false }),
  useMarkProductFinished: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteProduct: () => ({ mutate: jest.fn(), isPending: false }),
}));

import { ProductDetailPage } from '@/components/shelf/detail/product-detail-page';

const PRODUCT: ShelfProduct = {
  id: 'product-1',
  identity: {
    brand: 'CeraVe',
    name: 'Retinol Serum',
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
    openedAt: null,
    expiresAt: null,
    periodAfterOpeningMonths: 12,
    pricePaid: null,
    pricePaidCurrency: null,
    purchasedFrom: null,
    personalNotes: null,
    preferredTimeOfDay: null,
  },
  status: ShelfStatus.Active,
  provenance: DataProvenance.PhotoLookup,
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

beforeEach(() => {
  mockReplace.mockReset();
  mockUseShelfProduct.mockReset();
});

describe('ProductDetailPage', () => {
  it('renders the product-detail shaped skeleton while the product is loading', () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
    });

    const { container } = renderWithProviders(
      <ProductDetailPage productId="product-1" />,
    );

    expect(screen.getByTestId('product-detail-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('product-detail-skeleton-tabs')).toBeInTheDocument();
    expect(container.querySelector('.sticky.top-0')).toBeInTheDocument();
  });

  it('renders a retry panel when the query fails', () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      error: new ApiError('Server error', { status: 500 }),
      refetch: jest.fn(),
    });

    renderWithProviders(<ProductDetailPage productId="product-1" />);

    expect(
      screen.getByRole('heading', { name: /we couldn't load this product/i }),
    ).toBeInTheDocument();
  });

  it('redirects back to the shelf when the product is missing', async () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      error: new ApiError('Not found', { status: 404 }),
      refetch: jest.fn(),
    });

    renderWithProviders(<ProductDetailPage productId="product-1" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/shelf');
    });
  });

  it('renders the detail view when the product is available', () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: false,
      isError: false,
      data: PRODUCT,
    });

    renderWithProviders(<ProductDetailPage productId="product-1" />);

    expect(screen.getByRole('heading', { name: /retinol serum/i })).toBeInTheDocument();
  });
});
