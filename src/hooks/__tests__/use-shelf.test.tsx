import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  useArchiveProduct,
  useArchiveProducts,
  useCreateProduct,
  useDeleteProducts,
  useMarkFinished,
  useMarkProductFinished,
  useResolveBarcodeMutation,
  useResolveUrl,
  useRestoreProduct,
  useRestoreProducts,
  useSearchCatalogueBestMatch,
  useSearchCatalogue,
  useShelfProducts,
  useShelfStats,
  useUpdateProduct,
} from '@/hooks/use-shelf';
import {
  DataProvenance,
  ProductCategory,
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
  type ShelfProductDraft,
  type ShelfProduct,
} from '@/types/shelf';

jest.mock('@/services/shelf.service', () => ({
  archiveProduct: jest.fn(),
  archiveProducts: jest.fn(),
  countProductsByStat: jest.fn(),
  createProduct: jest.fn(),
  listProducts: jest.fn(),
  markProductFinished: jest.fn(),
  markProductsFinished: jest.fn(),
  removeProducts: jest.fn(),
  resolveBarcode: jest.fn(),
  resolveUrl: jest.fn(),
  restoreProduct: jest.fn(),
  restoreProducts: jest.fn(),
  searchCatalogueBestMatch: jest.fn(),
  searchCatalogue: jest.fn(),
  updateProduct: jest.fn(),
}));

import * as shelfService from '@/services/shelf.service';

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

const PRODUCT_DRAFT: ShelfProductDraft = {
  identity: PRODUCT.identity,
  guidance: PRODUCT.guidance,
  manufacturer: PRODUCT.manufacturer,
  userFields: PRODUCT.userFields,
  status: PRODUCT.status,
  provenance: PRODUCT.provenance,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useShelfProducts', () => {
  it('stays idle until the user is authenticated', () => {
    const { result } = renderHookWithProviders(() =>
      useShelfProducts({
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        search: '',
        sort: ShelfSort.RecentlyAdded,
      }),
    );

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches and flattens paginated shelf products and stats when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (shelfService.listProducts as jest.Mock)
      .mockResolvedValueOnce({
        items: [PRODUCT],
        nextCursor: 'next-cursor',
      })
      .mockResolvedValueOnce({
        items: [{ ...PRODUCT, id: 'product-2' }],
        nextCursor: null,
      });
    (shelfService.countProductsByStat as jest.Mock).mockResolvedValue({
      [ShelfStatFilter.All]: 2,
    });

    const { result: products } = renderHookWithProviders(() =>
      useShelfProducts({
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        search: '',
        sort: ShelfSort.RecentlyAdded,
      }),
    );
    const { result: stats } = renderHookWithProviders(() => useShelfStats());

    await waitFor(() => {
      expect(products.current.isSuccess).toBe(true);
      expect(stats.current.isSuccess).toBe(true);
    });

    expect(products.current.data).toEqual([PRODUCT]);
    expect(products.current.hasNextPage).toBe(true);

    await act(async () => {
      await products.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(products.current.data).toHaveLength(2);
    });
    expect(stats.current.data?.[ShelfStatFilter.All]).toBe(2);
  });
});

describe('shelf mutations', () => {
  it('creates and updates products through the service layer', async () => {
    (shelfService.createProduct as jest.Mock).mockResolvedValue(PRODUCT);
    (shelfService.updateProduct as jest.Mock).mockResolvedValue({
      ...PRODUCT,
      identity: { ...PRODUCT.identity, name: 'Updated Serum' },
    });

    const { result: createResult } = renderHookWithProviders(() => useCreateProduct());
    const { result: updateResult } = renderHookWithProviders(() => useUpdateProduct());

    await act(async () => {
      await createResult.current.mutateAsync(PRODUCT_DRAFT);
      await updateResult.current.mutateAsync({
        id: PRODUCT.id,
        patch: { identity: { name: 'Updated Serum' } },
      });
    });

    expect(shelfService.createProduct).toHaveBeenCalled();
    expect(shelfService.updateProduct).toHaveBeenCalledWith(PRODUCT.id, {
      identity: { name: 'Updated Serum' },
    });
  });

  it('archives, restores, finishes, and batch deletes products', async () => {
    (shelfService.archiveProducts as jest.Mock).mockResolvedValue(undefined);
    (shelfService.restoreProducts as jest.Mock).mockResolvedValue(undefined);
    (shelfService.markProductsFinished as jest.Mock).mockResolvedValue(undefined);
    (shelfService.removeProducts as jest.Mock).mockResolvedValue(undefined);

    const { result: archiveResult } = renderHookWithProviders(() =>
      useArchiveProducts(),
    );
    const { result: restoreResult } = renderHookWithProviders(() =>
      useRestoreProducts(),
    );
    const { result: finishResult } = renderHookWithProviders(() =>
      useMarkFinished(),
    );
    const { result: deleteResult } = renderHookWithProviders(() =>
      useDeleteProducts(),
    );

    await act(async () => {
      await archiveResult.current.mutateAsync(['product-1']);
      await restoreResult.current.mutateAsync(['product-1']);
      await finishResult.current.mutateAsync(['product-1']);
      await deleteResult.current.mutateAsync(['product-1', 'product-2']);
    });

    expect(shelfService.archiveProducts).toHaveBeenCalledWith(['product-1']);
    expect(shelfService.restoreProducts).toHaveBeenCalledWith(['product-1']);
    expect(shelfService.markProductsFinished).toHaveBeenCalledWith(['product-1']);
    expect(shelfService.removeProducts).toHaveBeenCalledWith([
      'product-1',
      'product-2',
    ]);
  });

  it('uses explicit single-product archive, restore, and finish endpoints', async () => {
    (shelfService.archiveProduct as jest.Mock).mockResolvedValue({
      ...PRODUCT,
      status: ShelfStatus.Archived,
    });
    (shelfService.restoreProduct as jest.Mock).mockResolvedValue(PRODUCT);
    (shelfService.markProductFinished as jest.Mock).mockResolvedValue({
      ...PRODUCT,
      status: ShelfStatus.FinishedUp,
    });

    const { result: archiveResult } = renderHookWithProviders(() =>
      useArchiveProduct(),
    );
    const { result: restoreResult } = renderHookWithProviders(() =>
      useRestoreProduct(),
    );
    const { result: finishResult } = renderHookWithProviders(() =>
      useMarkProductFinished(),
    );

    await act(async () => {
      await archiveResult.current.mutateAsync('product-1');
      await restoreResult.current.mutateAsync('product-1');
      await finishResult.current.mutateAsync('product-1');
    });

    expect(shelfService.archiveProduct).toHaveBeenCalledWith('product-1');
    expect(shelfService.restoreProduct).toHaveBeenCalledWith('product-1');
    expect(shelfService.markProductFinished).toHaveBeenCalledWith('product-1');
  });

  it('searches catalogue pages and resolves URL lookups', async () => {
    (shelfService.searchCatalogue as jest.Mock)
      .mockResolvedValueOnce({
        items: [
          {
            brand: 'CeraVe',
            name: 'Retinol Serum',
            category: ProductCategory.Serum,
            barcode: '123',
            imageUrls: [],
            sizeMl: 30,
          },
        ],
        nextCursor: 'search-next',
      })
      .mockResolvedValueOnce({
        items: [
          {
            brand: 'CeraVe',
            name: 'Retinol Serum Mini',
            category: ProductCategory.Serum,
            barcode: null,
            imageUrls: [],
            sizeMl: 15,
          },
        ],
        nextCursor: null,
      });
    (shelfService.resolveUrl as jest.Mock).mockResolvedValue({
      identity: { brand: 'CeraVe', name: 'Retinol Serum' },
    });

    const { result: searchResult } = renderHookWithProviders(() =>
      useSearchCatalogue('ret'),
    );
    const { result: resolveResult } = renderHookWithProviders(() => useResolveUrl());

    await waitFor(() => {
      expect(searchResult.current.isSuccess).toBe(true);
    });

    expect(searchResult.current.data).toHaveLength(1);

    await act(async () => {
      await searchResult.current.fetchNextPage();
      await resolveResult.current.mutateAsync(
        'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
      );
    });

    await waitFor(() => {
      expect(searchResult.current.data).toHaveLength(2);
    });
    expect(shelfService.searchCatalogue).toHaveBeenNthCalledWith(1, 'ret', null);
    expect(shelfService.searchCatalogue).toHaveBeenNthCalledWith(
      2,
      'ret',
      'search-next',
    );
    expect(shelfService.resolveUrl).toHaveBeenCalledWith(
      'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
    );
  });

  it('searches for a best-match lookup in one mutation call', async () => {
    (shelfService.searchCatalogueBestMatch as jest.Mock).mockResolvedValue({
      identity: { brand: 'CeraVe', name: 'Retinol Serum' },
      manufacturer: { brand: 'CeraVe' },
      provenance: DataProvenance.Catalogue,
    });

    const { result } = renderHookWithProviders(() =>
      useSearchCatalogueBestMatch(),
    );

    await act(async () => {
      await result.current.mutateAsync('cerave retinol serum');
    });

    expect(shelfService.searchCatalogueBestMatch).toHaveBeenCalledWith(
      'cerave retinol serum',
    );
  });

  it('resolves barcode lookups through the mutation hook', async () => {
    (shelfService.resolveBarcode as jest.Mock).mockResolvedValue({
      identity: {
        brand: 'CeraVe',
        name: 'Retinol Serum',
      },
      manufacturer: {
        brand: 'CeraVe',
      },
      provenance: DataProvenance.BarcodeLookup,
    });

    const { result } = renderHookWithProviders(() => useResolveBarcodeMutation());

    await act(async () => {
      await result.current.mutateAsync('3337875597227');
    });

    expect(shelfService.resolveBarcode).toHaveBeenCalledWith('3337875597227');
  });
});
