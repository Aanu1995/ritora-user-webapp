import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  useArchiveProducts,
  useCreateProduct,
  useDeleteProducts,
  useMarkFinished,
  useResolveUrl,
  useRestoreProducts,
  useShelfProducts,
  useShelfStats,
  useUpdateProduct,
} from '@/hooks/use-shelf';
import {
  DataProvenance,
  ProductCategory,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
  type ShelfProductDraft,
  type ShelfProduct,
} from '@/types/shelf';

jest.mock('@/services/shelf.service', () => ({
  listProducts: jest.fn(),
  countProductsByStat: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  removeProducts: jest.fn(),
  removeProduct: jest.fn(),
  setProductsStatus: jest.fn(),
  resolveUrl: jest.fn(),
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
        category: 'all',
        search: '',
        sort: ShelfSort.RecentlyAdded,
      }),
    );

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches products and stats when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (shelfService.listProducts as jest.Mock).mockResolvedValue([PRODUCT]);
    (shelfService.countProductsByStat as jest.Mock).mockResolvedValue({
      [ShelfStatFilter.All]: 1,
    });

    const { result: products } = renderHookWithProviders(() =>
      useShelfProducts({
        stat: ShelfStatFilter.All,
        category: 'all',
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
    expect(stats.current.data?.[ShelfStatFilter.All]).toBe(1);
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

  it('archives, restores, marks finished, and batch deletes products', async () => {
    (shelfService.setProductsStatus as jest.Mock).mockResolvedValue(undefined);
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
      archiveResult.current.archive(['product-1']);
      restoreResult.current.restore(['product-1']);
      finishResult.current.markFinished(['product-1']);
      await deleteResult.current.mutateAsync(['product-1', 'product-2']);
    });

    expect(shelfService.setProductsStatus).toHaveBeenCalledWith(
      ['product-1'],
      ShelfStatus.Archived,
    );
    expect(shelfService.setProductsStatus).toHaveBeenCalledWith(
      ['product-1'],
      ShelfStatus.Active,
    );
    expect(shelfService.setProductsStatus).toHaveBeenCalledWith(
      ['product-1'],
      ShelfStatus.FinishedUp,
    );
    expect(shelfService.removeProducts).toHaveBeenCalledWith([
      'product-1',
      'product-2',
    ]);
  });

  it('resolves URL lookups', async () => {
    (shelfService.resolveUrl as jest.Mock).mockResolvedValue({
      identity: { brand: 'CeraVe', name: 'Retinol Serum' },
    });

    const { result } = renderHookWithProviders(() => useResolveUrl());

    await act(async () => {
      await result.current.mutateAsync(
        'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
      );
    });

    expect(shelfService.resolveUrl).toHaveBeenCalledWith(
      'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
    );
  });
});
