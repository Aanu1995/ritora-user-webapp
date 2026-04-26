import { deriveShelfLife, formatOpenedToken } from '@/lib/shelf-life';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

function createProduct(): ShelfProduct {
  return {
    id: 'product-1',
    identity: {
      brand: 'CeraVe',
      name: 'SA Cleanser',
      category: ProductCategory.Cleanser,
      barcode: null,
      imageUrls: [],
      sizeMl: 236,
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
      openedAt: '2026-04-01T00:00:00.000Z',
      expiresAt: '2026-04-02T00:00:00.000Z',
      periodAfterOpeningMonths: null,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.UserEntered,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  };
}

describe('shelf-life', () => {
  it('keeps opened and expiry calculations anchored to the effective timezone', () => {
    const product = createProduct();
    const options = {
      timeZone: 'America/New_York',
      now: new Date('2026-04-02T03:00:00.000Z'),
    };

    expect(formatOpenedToken(product, options)).toBe('today');

    expect(deriveShelfLife(product, options)).toMatchObject({
      remainingDays: 1,
    });
  });
});
