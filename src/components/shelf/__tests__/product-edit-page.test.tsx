import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
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
  usePathname: () => '/shelf/product-1/edit',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProduct: (...args: unknown[]) => mockUseShelfProduct(...args),
}));

jest.mock('@/components/shelf/edit/product-edit-form', () => ({
  ProductEditForm: ({ product }: { product: { identity: { name: string } } }) => (
    <div>Editing {product.identity.name}</div>
  ),
}));

import { ProductEditPage } from '@/components/shelf/edit/product-edit-page';

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
  provenance: DataProvenance.UserEntered,
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

beforeEach(() => {
  mockReplace.mockReset();
  mockUseShelfProduct.mockReset();
});

describe('ProductEditPage', () => {
  it('renders a skeleton while loading', () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
    });

    const { container } = renderWithProviders(<ProductEditPage productId="product-1" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders a retry state on error', () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: jest.fn(),
    });

    renderWithProviders(<ProductEditPage productId="product-1" />);
    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it('renders the edit form when the product is available', () => {
    mockUseShelfProduct.mockReturnValue({
      isPending: false,
      isError: false,
      data: PRODUCT,
    });

    renderWithProviders(<ProductEditPage productId="product-1" />);
    expect(screen.getByText(/editing retinol serum/i)).toBeInTheDocument();
  });
});
