import {
  __resetShelfStorage,
  countProductsByStat,
  createProduct,
  getProduct,
  listProducts,
  removeProduct,
  removeProducts,
  resolveBarcode,
  resolveUrl,
  searchCatalogue,
  setProductsStatus,
  updateProduct,
} from '@/services/shelf.service';
import {
  DataProvenance,
  ProductCategory,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
  type ShelfProductDraft,
} from '@/types/shelf';

function createDraft(overrides?: Partial<ShelfProductDraft>): ShelfProductDraft {
  return {
    identity: {
      brand: 'Ritora',
      name: 'Barrier Serum',
      category: ProductCategory.Serum,
      barcode: '1234567890123',
      imageUrls: [],
      sizeMl: 30,
      description: 'A calming serum.',
      benefits: ['calming'],
      suitedFor: ['sensitive'],
      inciIngredients: ['Aqua', 'Glycerin'],
      inciLastConfirmedAt: null,
    },
    guidance: {
      applicationMethod: null,
      quantity: null,
      steps: ['Apply gently.'],
      cautions: ['Avoid eyes.'],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'Ritora',
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
    },
    userFields: {
      openedAt: '2026-04-01T00:00:00.000Z',
      expiresAt: '2026-12-01T00:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: 24,
      pricePaidCurrency: 'SEK',
      purchasedFrom: 'Kicks',
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.UserEntered,
    ...overrides,
  };
}

beforeEach(() => {
  __resetShelfStorage();
});

describe('shelf.service', () => {
  it('lists seeded products with filters applied', async () => {
    const products = await listProducts({
      stat: ShelfStatFilter.All,
      category: 'all',
      search: 'retinol',
      sort: ShelfSort.Alphabetical,
    });

    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product) => product.identity.name.toLowerCase().includes('retinol') || product.identity.inciIngredients.join(' ').toLowerCase().includes('retinol'))).toBe(true);
  });

  it('counts products by stat buckets', async () => {
    const counts = await countProductsByStat();

    expect(counts[ShelfStatFilter.All]).toBeGreaterThan(0);
    expect(counts[ShelfStatFilter.Archived]).toBeGreaterThanOrEqual(0);
    expect(counts[ShelfStatFilter.InUse]).toBeGreaterThanOrEqual(0);
  });

  it('creates, reads, updates, and deletes a product', async () => {
    const created = await createProduct(createDraft());
    expect(created.id).toBeTruthy();

    const fetched = await getProduct(created.id);
    expect(fetched.identity.name).toBe('Barrier Serum');

    const updated = await updateProduct(created.id, {
      identity: { name: 'Barrier Serum Plus' },
      manufacturer: { supportEmail: 'hello@ritora.com' },
    });
    expect(updated.identity.name).toBe('Barrier Serum Plus');
    expect(updated.manufacturer.supportEmail).toBe('hello@ritora.com');

    await removeProduct(created.id);
    await expect(getProduct(created.id)).rejects.toThrow(/not found/i);
  });

  it('removes multiple products in one call', async () => {
    const first = await createProduct(createDraft({ identity: { ...createDraft().identity, name: 'First Serum' } }));
    const second = await createProduct(createDraft({ identity: { ...createDraft().identity, name: 'Second Serum' } }));

    await removeProducts([first.id, second.id]);

    await expect(getProduct(first.id)).rejects.toThrow(/not found/i);
    await expect(getProduct(second.id)).rejects.toThrow(/not found/i);
  });

  it('updates status for multiple products', async () => {
    const first = await createProduct(createDraft({ identity: { ...createDraft().identity, name: 'Archive Me' } }));
    const second = await createProduct(createDraft({ identity: { ...createDraft().identity, name: 'Archive Me Too' } }));

    await setProductsStatus([first.id, second.id], ShelfStatus.Archived);

    const archivedCounts = await countProductsByStat();
    expect(archivedCounts[ShelfStatFilter.Archived]).toBeGreaterThanOrEqual(2);
  });

  it('searches the catalogue and resolves barcode/url lookups', async () => {
    const searchResults = await searchCatalogue('cera');
    expect(searchResults.length).toBeGreaterThan(0);

    const barcodeResult = await resolveBarcode('3337875597227');
    expect(barcodeResult?.identity?.brand).toBeTruthy();

    const urlResult = await resolveUrl('https://www.cerave.com/skincare/serums/resurfacing-retinol-serum');
    expect(urlResult?.identity?.name).toBeTruthy();
  });
});
