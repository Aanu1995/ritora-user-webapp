import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ProductList } from '@/components/shelf/product-list';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

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

describe('ProductList', () => {
  it('opens a product row and toggles selection separately', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    const onToggleSelect = jest.fn();

    renderWithProviders(
      <ProductList
        products={[PRODUCT]}
        timeZone="Europe/Stockholm"
        selectedIds={new Set<string>()}
        onOpen={onOpen}
        onToggleSelect={onToggleSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cerave, retinol serum/i }));
    expect(onOpen).toHaveBeenCalledWith(PRODUCT.id);

    await user.click(screen.getByRole('checkbox', { name: /select cerave, retinol serum/i }));
    expect(onToggleSelect).toHaveBeenCalledWith(PRODUCT.id);
  });
});
