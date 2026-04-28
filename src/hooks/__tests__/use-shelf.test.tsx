import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  useArchiveProduct,
  useArchiveProducts,
  useCreateProduct,
  useDeleteProducts,
  useExtractProductFromImages,
  useMarkFinished,
  useMarkProductFinished,
  useRestoreProduct,
  useRestoreProducts,
  useShelfProducts,
  useShelfStats,
  useUpdateProduct,
} from '@/hooks/use-shelf';
import type { ShelfDateContext } from '@/hooks/use-shelf-time-zone';
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
  extractProductFromImages: jest.fn(),
  listProducts: jest.fn(),
  markProductFinished: jest.fn(),
  markProductsFinished: jest.fn(),
  removeProducts: jest.fn(),
  restoreProduct: jest.fn(),
  restoreProducts: jest.fn(),
  updateProduct: jest.fn(),
}));

import {
  archiveProduct,
  archiveProducts,
  countProductsByStat,
  createProduct,
  extractProductFromImages,
  listProducts,
  markProductFinished,
  markProductsFinished,
  removeProducts,
  restoreProduct,
  restoreProducts,
  updateProduct,
} from '@/services/shelf.service';

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
  provenance: DataProvenance.PhotoLookup,
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

const SHELF_DATE_CONTEXT: ShelfDateContext = {
  timeZone: 'Europe/Stockholm',
  todayDate: '2026-04-23',
};

describe('useShelfProducts', () => {
  it('stays idle until the user is authenticated', () => {
    const { result } = renderHookWithProviders(() =>
      useShelfProducts({
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        search: '',
        sort: ShelfSort.RecentlyAdded,
      }, SHELF_DATE_CONTEXT),
    );

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches and flattens paginated shelf products and stats when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (listProducts as jest.Mock)
      .mockResolvedValueOnce({
        items: [PRODUCT],
        nextCursor: 'next-cursor',
      })
      .mockResolvedValueOnce({
        items: [{ ...PRODUCT, id: 'product-2' }],
        nextCursor: null,
      });
    (countProductsByStat as jest.Mock).mockResolvedValue({
      [ShelfStatFilter.All]: 2,
    });

    const { result: products } = renderHookWithProviders(() =>
      useShelfProducts({
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        search: '',
        sort: ShelfSort.RecentlyAdded,
      }, SHELF_DATE_CONTEXT),
    );
    const { result: stats } = renderHookWithProviders(() =>
      useShelfStats(SHELF_DATE_CONTEXT),
    );

    await waitFor(() => {
      expect(products.current.isSuccess).toBe(true);
      expect(stats.current.isSuccess).toBe(true);
    });

    expect(
      (listProducts as jest.Mock).mock.calls[0]?.[2],
    ).toBeInstanceOf(AbortSignal);
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

  it('does not refetch non-date-sensitive shelf lists when the effective shelf day changes', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (listProducts as jest.Mock).mockResolvedValue({
      items: [PRODUCT],
      nextCursor: null,
    });

    const { result: products, rerender: rerenderProducts } =
      renderHookWithProviders(
        ({
          dateContext,
        }: {
          dateContext: ShelfDateContext;
        }) =>
          useShelfProducts(
            {
              stat: ShelfStatFilter.All,
              category: ShelfCategoryFilter.All,
              search: '',
              sort: ShelfSort.RecentlyAdded,
            },
            dateContext,
          ),
        {
          initialProps: { dateContext: SHELF_DATE_CONTEXT },
        },
      );

    await waitFor(() => {
      expect(products.current.isSuccess).toBe(true);
    });

    rerenderProducts({
      dateContext: {
        ...SHELF_DATE_CONTEXT,
        todayDate: '2026-04-24',
      },
    });

    await waitFor(() => {
      expect(listProducts).toHaveBeenCalledTimes(1);
    });
  });

  it('refetches date-sensitive shelf lists and stats when the effective shelf day changes', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (listProducts as jest.Mock)
      .mockResolvedValueOnce({
        items: [PRODUCT],
        nextCursor: null,
      })
      .mockResolvedValueOnce({
        items: [PRODUCT],
        nextCursor: null,
      });
    (countProductsByStat as jest.Mock)
      .mockResolvedValueOnce({ [ShelfStatFilter.All]: 1 })
      .mockResolvedValueOnce({ [ShelfStatFilter.All]: 1 });

    const { result: products, rerender: rerenderProducts } =
      renderHookWithProviders(
        ({
          dateContext,
        }: {
          dateContext: ShelfDateContext;
        }) =>
          useShelfProducts(
            {
              stat: ShelfStatFilter.Expired,
              category: ShelfCategoryFilter.All,
              search: '',
              sort: ShelfSort.RecentlyAdded,
            },
            dateContext,
          ),
        {
          initialProps: { dateContext: SHELF_DATE_CONTEXT },
        },
      );
    const { result: stats, rerender: rerenderStats } = renderHookWithProviders(
      ({ dateContext }: { dateContext: ShelfDateContext }) =>
        useShelfStats(dateContext),
      {
        initialProps: { dateContext: SHELF_DATE_CONTEXT },
      },
    );

    await waitFor(() => {
      expect(products.current.isSuccess).toBe(true);
      expect(stats.current.isSuccess).toBe(true);
    });

    rerenderProducts({
      dateContext: {
        ...SHELF_DATE_CONTEXT,
        todayDate: '2026-04-24',
      },
    });
    rerenderStats({
      dateContext: {
        ...SHELF_DATE_CONTEXT,
        todayDate: '2026-04-24',
      },
    });

    await waitFor(() => {
      expect(listProducts).toHaveBeenCalledTimes(2);
      expect(countProductsByStat).toHaveBeenCalledTimes(2);
    });
  });
});

describe('shelf mutations', () => {
  it('creates and updates products through the service layer', async () => {
    (createProduct as jest.Mock).mockResolvedValue(PRODUCT);
    (updateProduct as jest.Mock).mockResolvedValue({
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

    expect(createProduct).toHaveBeenCalled();
    expect(updateProduct).toHaveBeenCalledWith(PRODUCT.id, {
      identity: { name: 'Updated Serum' },
    });
  });

  it('archives, restores, finishes, and batch deletes products', async () => {
    (archiveProducts as jest.Mock).mockResolvedValue(undefined);
    (restoreProducts as jest.Mock).mockResolvedValue(undefined);
    (markProductsFinished as jest.Mock).mockResolvedValue(undefined);
    (removeProducts as jest.Mock).mockResolvedValue(undefined);

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

    expect(archiveProducts).toHaveBeenCalledWith(['product-1']);
    expect(restoreProducts).toHaveBeenCalledWith(['product-1']);
    expect(markProductsFinished).toHaveBeenCalledWith(['product-1']);
    expect(removeProducts).toHaveBeenCalledWith([
      'product-1',
      'product-2',
    ]);
  });

  it('uses explicit single-product archive, restore, and finish endpoints', async () => {
    (archiveProduct as jest.Mock).mockResolvedValue({
      ...PRODUCT,
      status: ShelfStatus.Archived,
    });
    (restoreProduct as jest.Mock).mockResolvedValue(PRODUCT);
    (markProductFinished as jest.Mock).mockResolvedValue({
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

    expect(archiveProduct).toHaveBeenCalledWith('product-1');
    expect(restoreProduct).toHaveBeenCalledWith('product-1');
    expect(markProductFinished).toHaveBeenCalledWith('product-1');
  });

  it('extracts product details from uploaded photos', async () => {
    (extractProductFromImages as jest.Mock).mockResolvedValue({
      identity: {
        brand: 'CeraVe',
        name: 'Retinol Serum',
      },
      manufacturer: {
        brand: 'CeraVe',
      },
      provenance: DataProvenance.PhotoLookup,
    });

    const { result } = renderHookWithProviders(() =>
      useExtractProductFromImages(),
    );
    const productImage = new File(['product'], 'product.jpg', {
      type: 'image/jpeg',
    });
    const labelImage = new File(['label'], 'label.jpg', {
      type: 'image/jpeg',
    });

    await act(async () => {
      await result.current.mutateAsync({
        images: [productImage, labelImage],
        heroImageIndex: 0,
      });
    });

    expect(extractProductFromImages).toHaveBeenCalledWith({
      images: [productImage, labelImage],
      heroImageIndex: 0,
    });
  });
});
