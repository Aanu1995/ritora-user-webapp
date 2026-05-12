import {
  computeExpiresAt,
  deriveShelfLife,
  formatOpenedToken,
  formatRemainingToken,
} from '@/lib/shelf-life';
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
    provenance: DataProvenance.PhotoLookup,
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

  it('derives non-active shelf states before expiry math', () => {
    expect(
      deriveShelfLife({ ...createProduct(), status: ShelfStatus.Archived }),
    ).toMatchObject({ state: 'archived', remainingFraction: null });
    expect(
      deriveShelfLife({ ...createProduct(), status: ShelfStatus.FinishedUp }),
    ).toMatchObject({ state: 'finished', remainingFraction: null });
    expect(
      deriveShelfLife({
        ...createProduct(),
        userFields: { ...createProduct().userFields, openedAt: null },
      }),
    ).toMatchObject({ state: 'unopened', remainingFraction: 1 });
  });

  it('uses explicit expiry first, then PAO, and handles missing expiry', () => {
    const product = createProduct();
    expect(computeExpiresAt(product)).toBe('2026-04-02T00:00:00.000Z');

    expect(
      computeExpiresAt({
        ...product,
        userFields: {
          ...product.userFields,
          expiresAt: null,
          periodAfterOpeningMonths: 6,
        },
      }),
    ).toBe('2026-10-01T00:00:00.000Z');

    expect(
      deriveShelfLife({
        ...product,
        userFields: {
          ...product.userFields,
          expiresAt: null,
          periodAfterOpeningMonths: null,
        },
      }),
    ).toMatchObject({ state: 'fresh', remainingFraction: null });
  });

  it('formats remaining and opened tokens across duration bands', () => {
    expect(formatRemainingToken({ state: 'unopened', remainingDays: null, remainingFraction: 1 })).toBe('Unopened');
    expect(formatRemainingToken({ state: 'archived', remainingDays: null, remainingFraction: null })).toBe('Archived');
    expect(formatRemainingToken({ state: 'finished', remainingDays: null, remainingFraction: null })).toBe('Finished');
    expect(formatRemainingToken({ state: 'expired', remainingDays: -2, remainingFraction: 0 })).toBe('Expired');
    expect(formatRemainingToken({ state: 'fresh', remainingDays: null, remainingFraction: null })).toBe('');
    expect(formatRemainingToken({ state: 'fresh', remainingDays: 0, remainingFraction: 0.1 })).toBe('1d');
    expect(formatRemainingToken({ state: 'fresh', remainingDays: 21, remainingFraction: 0.4 })).toBe('3w');
    expect(formatRemainingToken({ state: 'fresh', remainingDays: 180, remainingFraction: 0.4 })).toBe('6mo');
    expect(formatRemainingToken({ state: 'fresh', remainingDays: 730, remainingFraction: 0.4 })).toBe('2y');

    const product = createProduct();
    expect(
      formatOpenedToken(
        { ...product, userFields: { ...product.userFields, openedAt: null } },
        { now: new Date('2026-04-02T12:00:00.000Z') },
      ),
    ).toBeNull();
    expect(formatOpenedToken(product, { now: new Date('2026-04-10T00:00:00.000Z') })).toBe('9d');
    expect(formatOpenedToken(product, { now: new Date('2026-05-01T00:00:00.000Z') })).toBe('4w');
    expect(formatOpenedToken(product, { now: new Date('2026-10-01T00:00:00.000Z') })).toBe('6mo');
    expect(formatOpenedToken(product, { now: new Date('2028-04-01T00:00:00.000Z') })).toBe('2y');
  });
});
