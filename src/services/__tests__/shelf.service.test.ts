jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postMultipartRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import * as api from '@/lib/api';
import * as shelfService from '@/services/shelf.service';
import {
  DataProvenance,
  ProductCategory,
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
} from '@/types/shelf';

afterEach(() => jest.clearAllMocks());

describe('shelf.service', () => {
  it('lists inventory products with pagination params', async () => {
    (api.getRequest as jest.Mock).mockResolvedValue({
      items: [],
      nextCursor: 'next-cursor',
    });

    const result = await shelfService.listProducts(
      {
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        search: 'retinol',
        sort: ShelfSort.RecentlyAdded,
      },
      'cursor-1',
    );

    expect(api.getRequest).toHaveBeenCalledWith('/inventory/products', {
      params: {
        stat: 'all',
        category: 'all',
        search: 'retinol',
        sort: 'recently-added',
        cursor: 'cursor-1',
      },
    });
    expect(result.nextCursor).toBe('next-cursor');
  });

  it('fetches inventory stats', async () => {
    (api.getRequest as jest.Mock).mockResolvedValue({ all: 2 });

    const result = await shelfService.countProductsByStat();

    expect(api.getRequest).toHaveBeenCalledWith('/inventory/products/stats');
    expect(result.all).toBe(2);
  });

  it('creates, updates, and deletes products through inventory endpoints', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue({ id: 'product-1' });
    (api.patchRequest as jest.Mock).mockResolvedValue({ id: 'product-1' });
    (api.deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await shelfService.createProduct({
      identity: {
        brand: 'CeraVe',
        name: 'Serum',
        category: ProductCategory.Serum,
        barcode: null,
        imageUrls: [],
        sizeMl: 30,
        description: 'Desc',
        benefits: ['smooth'],
        suitedFor: ['dry'],
        inciIngredients: ['Aqua'],
        inciLastConfirmedAt: null,
      },
      guidance: {
        applicationMethod: null,
        quantity: null,
        steps: ['Apply'],
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
    });
    await shelfService.updateProduct('product-1', {
      identity: { name: 'Updated' },
    });
    await shelfService.removeProduct('product-1');

    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products',
      expect.any(Object),
    );
    expect(api.patchRequest).toHaveBeenCalledWith('/inventory/products/product-1', {
      identity: { name: 'Updated' },
    });
    expect(api.deleteRequest).toHaveBeenCalledWith('/inventory/products/product-1');
  });

  it('uploads a product image through the dedicated inventory endpoint', async () => {
    const imageFile = new File(['photo'], 'product.jpg', {
      type: 'image/jpeg',
    });
    (api.postMultipartRequest as jest.Mock).mockResolvedValue({
      imageUrl: 'https://cdn.example.com/product-images/processed/photo.webp',
    });

    const result = await shelfService.uploadProductImage(imageFile);

    expect(api.postMultipartRequest).toHaveBeenCalledWith(
      '/inventory/products/upload-image',
      expect.any(FormData),
      expect.objectContaining({ timeout: 30000 }),
    );

    const body = (api.postMultipartRequest as jest.Mock).mock.calls[0]?.[1] as FormData;
    expect(body.get('image')).toBe(imageFile);
    expect(result.imageUrl).toBe(
      'https://cdn.example.com/product-images/processed/photo.webp',
    );
  });

  it('uses explicit archive, restore, finish, and bulk delete endpoints', async () => {
    (api.postRequest as jest.Mock).mockResolvedValue(undefined);

    await shelfService.archiveProduct('product-1');
    await shelfService.restoreProduct('product-1');
    await shelfService.markProductFinished('product-1');
    await shelfService.archiveProducts(['product-1']);
    await shelfService.restoreProducts(['product-1']);
    await shelfService.markProductsFinished(['product-1']);
    await shelfService.removeProducts(['product-1', 'product-2']);

    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/product-1/archive',
    );
    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/product-1/restore',
    );
    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/product-1/mark-finished',
    );
    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk/archive',
      { ids: ['product-1'] },
    );
    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk/restore',
      { ids: ['product-1'] },
    );
    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk/mark-finished',
      { ids: ['product-1'] },
    );
    expect(api.postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk-delete',
      { ids: ['product-1', 'product-2'] },
    );
  });

  it('uploads ordered photos plus the selected hero image index', async () => {
    const productImage = new File(['product'], 'product.jpg', {
      type: 'image/jpeg',
    });
    const ingredientImage = new File(['ingredients'], 'ingredients.jpg', {
      type: 'image/jpeg',
    });
    const directionsImage = new File(['directions'], 'directions.jpg', {
      type: 'image/jpeg',
    });
    (api.postMultipartRequest as jest.Mock).mockResolvedValue(null);

    await shelfService.extractProductFromImages({
      images: [productImage, ingredientImage, directionsImage],
      heroImageIndex: 2,
    });

    expect(api.postMultipartRequest).toHaveBeenCalledWith(
      '/catalogue/products/extract-from-images',
      expect.any(FormData),
      expect.objectContaining({ timeout: 75000 }),
    );

    const body = (api.postMultipartRequest as jest.Mock).mock.calls[0]?.[1] as FormData;
    expect(body.getAll('images')).toEqual([
      productImage,
      ingredientImage,
      directionsImage,
    ]);
    expect(body.get('heroImageIndex')).toBe('2');
  });
});
