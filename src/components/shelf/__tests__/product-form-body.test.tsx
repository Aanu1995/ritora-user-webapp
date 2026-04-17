import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ProductFormBody, type ProductFormValue } from '@/components/shelf/product-form-body';
import {
  ApplicationMethod,
  PreferredTimeOfDay,
  ProductCategory,
  Quantity,
} from '@/types/shelf';

const VALUE: ProductFormValue = {
  identity: {
    brand: 'CeraVe',
    name: 'Retinol Serum',
    category: ProductCategory.Serum,
    barcode: null,
    imageUrls: [],
    sizeMl: 30,
    description: 'Night serum',
    benefits: ['smoothing'],
    suitedFor: ['dry'],
    inciIngredients: ['Aqua'],
    inciLastConfirmedAt: null,
  },
  guidance: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.TwoToThreeDrops,
    steps: ['Pat gently.'],
    cautions: ['Avoid eyes.'],
    waitMinutes: 5,
  },
  manufacturer: {
    brand: 'CeraVe',
    parentCompany: 'L’Oreal',
    countryOfOrigin: null,
    countryOfManufacture: 'US',
    supportEmail: 'support@cerave.com',
    productUrl: 'https://example.com/product',
    websiteUrl: null,
  },
  userFields: {
    openedAt: '2026-04-01T00:00:00.000Z',
    expiresAt: null,
    periodAfterOpeningMonths: 12,
    pricePaid: 24,
    pricePaidCurrency: 'SEK',
    purchasedFrom: 'Kicks',
    personalNotes: 'Feels good',
    preferredTimeOfDay: PreferredTimeOfDay.Evening,
  },
};

describe('ProductFormBody', () => {
  it('renders source badges and lets the user edit writable sections', async () => {
    const user = userEvent.setup();
    const onIdentityChange = jest.fn();
    const onManufacturerChange = jest.fn();
    const onUserFieldsChange = jest.fn();
    const onGuidanceChange = jest.fn();

    renderWithProviders(
      <ProductFormBody
        value={VALUE}
        onIdentityChange={onIdentityChange}
        onManufacturerChange={onManufacturerChange}
        onUserFieldsChange={onUserFieldsChange}
        onGuidanceChange={onGuidanceChange}
        identityReadOnly
        identitySourceLabel="From barcode"
      />,
    );

    expect(screen.getAllByText(/from barcode/i).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText(/your notes/i), ' now');
    expect(onUserFieldsChange).toHaveBeenCalled();
  });
});
