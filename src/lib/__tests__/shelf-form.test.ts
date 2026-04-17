import {
  createEmptyIdentity,
  createEmptyManufacturer,
  createEmptyUserFields,
  isSafeExternalUrl,
  normalizeShelfProductForm,
  toShelfProductDraft,
  validateShelfProductForm,
} from '@/lib/shelf-form';
import {
  ApplicationMethod,
  DataProvenance,
  ProductCategory,
  Quantity,
  ShelfFormValidationCode,
  ShelfStatus,
  type ShelfProductFormValue,
} from '@/types/shelf';

function createValue(overrides?: Partial<ShelfProductFormValue>): ShelfProductFormValue {
  return {
    identity: {
      ...createEmptyIdentity(),
      brand: '  CeraVe  ',
      name: '  Retinol Serum  ',
      category: ProductCategory.Serum,
      sizeMl: 30,
      description: '  Smooth overnight serum.  ',
      benefits: [' calming ', 'hydrating'],
      suitedFor: [' dry ', 'sensitive'],
      inciIngredients: [' Aqua ', 'Niacinamide '],
    },
    guidance: {
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.TwoToThreeDrops,
      steps: [' Cleanse first. ', ' Pat gently. '],
      cautions: [' Avoid eyes. '],
      waitMinutes: 5,
    },
    manufacturer: {
      ...createEmptyManufacturer(),
      brand: '  CeraVe  ',
      parentCompany: '  L’Oreal  ',
      supportEmail: ' support@cerave.com ',
      productUrl: 'https://www.cerave.com/products/retinol',
    },
    userFields: {
      ...createEmptyUserFields(),
      pricePaid: 24,
      purchasedFrom: '  Apotek  ',
      personalNotes: '  Feels calming.  ',
    },
    ...overrides,
  };
}

describe('shelf-form', () => {
  it('creates empty defaults for identity, manufacturer, and user fields', () => {
    expect(createEmptyIdentity()).toMatchObject({
      brand: '',
      name: '',
      category: ProductCategory.Other,
      imageUrls: [],
    });
    expect(createEmptyManufacturer()).toMatchObject({
      brand: '',
      parentCompany: null,
      productUrl: null,
    });
    expect(createEmptyUserFields()).toMatchObject({
      openedAt: null,
      expiresAt: null,
      periodAfterOpeningMonths: 12,
      preferredTimeOfDay: null,
    });
  });

  it('validates required brand and name', () => {
    expect(
      validateShelfProductForm(createValue({ identity: { ...createEmptyIdentity(), brand: ' ', name: 'Serum', category: ProductCategory.Serum, imageUrls: [], barcode: null, sizeMl: null, description: null, benefits: [], suitedFor: [], inciIngredients: [], inciLastConfirmedAt: null } })),
    ).toBe(ShelfFormValidationCode.BrandRequired);

    expect(
      validateShelfProductForm(createValue({ identity: { ...createEmptyIdentity(), brand: 'CeraVe', name: ' ', category: ProductCategory.Serum, imageUrls: [], barcode: null, sizeMl: null, description: null, benefits: [], suitedFor: [], inciIngredients: [], inciLastConfirmedAt: null } })),
    ).toBe(ShelfFormValidationCode.NameRequired);
  });

  it('validates numeric and structured fields', () => {
    expect(
      validateShelfProductForm(
        createValue({ identity: { ...createValue().identity, sizeMl: Number.NaN } }),
      ),
    ).toBe(ShelfFormValidationCode.SizeInvalid);

    expect(
      validateShelfProductForm(
        createValue({ userFields: { ...createValue().userFields, pricePaid: Number.NaN } }),
      ),
    ).toBe(ShelfFormValidationCode.PriceInvalid);

    expect(
      validateShelfProductForm(
        createValue({
          manufacturer: {
            ...createValue().manufacturer,
            supportEmail: 'not-an-email',
          },
        }),
      ),
    ).toBe(ShelfFormValidationCode.SupportEmailInvalid);

    expect(
      validateShelfProductForm(
        createValue({
          manufacturer: {
            ...createValue().manufacturer,
            supportEmail: null,
            productUrl: 'ftp://example.com/product',
          },
        }),
      ),
    ).toBe(ShelfFormValidationCode.ProductUrlInvalid);
  });

  it('normalizes trimmed strings and list values', () => {
    const normalized = normalizeShelfProductForm(createValue());

    expect(normalized.identity.brand).toBe('CeraVe');
    expect(normalized.identity.name).toBe('Retinol Serum');
    expect(normalized.identity.description).toBe('Smooth overnight serum.');
    expect(normalized.identity.benefits).toEqual(['calming', 'hydrating']);
    expect(normalized.identity.inciIngredients).toEqual(['Aqua', 'Niacinamide']);
    expect(normalized.guidance.steps).toEqual(['Cleanse first.', 'Pat gently.']);
    expect(normalized.guidance.cautions).toEqual(['Avoid eyes.']);
    expect(normalized.manufacturer.parentCompany).toBe('L’Oreal');
    expect(normalized.manufacturer.supportEmail).toBe('support@cerave.com');
    expect(normalized.userFields.purchasedFrom).toBe('Apotek');
    expect(normalized.userFields.personalNotes).toBe('Feels calming.');
  });

  it('builds a normalized draft with active status and provenance', () => {
    const draft = toShelfProductDraft(createValue(), DataProvenance.UrlFetch);

    expect(draft.status).toBe(ShelfStatus.Active);
    expect(draft.provenance).toBe(DataProvenance.UrlFetch);
    expect(draft.identity.brand).toBe('CeraVe');
    expect(draft.manufacturer.productUrl).toBe(
      'https://www.cerave.com/products/retinol',
    );
  });

  it('only allows http and https product links', () => {
    expect(isSafeExternalUrl('https://ritora.com/product')).toBe(true);
    expect(isSafeExternalUrl('http://ritora.com/product')).toBe(true);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('notaurl')).toBe(false);
  });
});
