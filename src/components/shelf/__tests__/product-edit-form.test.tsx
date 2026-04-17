import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

const mockPush = jest.fn();
const mockMutate = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf/product-1/edit',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/use-shelf', () => ({
  useUpdateProduct: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

import { ProductEditForm } from '@/components/shelf/edit/product-edit-form';

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
  mockPush.mockReset();
  mockMutate.mockReset();
});

describe('ProductEditForm', () => {
  it('shows validation feedback instead of silently failing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductEditForm product={PRODUCT} />);

    await user.clear(screen.getByLabelText(/product name/i));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /product name is required/i,
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('saves and redirects to the detail page', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderWithProviders(<ProductEditForm product={PRODUCT} />);

    await user.clear(screen.getByLabelText(/product name/i));
    await user.type(screen.getByLabelText(/product name/i), 'Updated Serum');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-1');
    });
  });
});
