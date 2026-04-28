jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postMultipartRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import {
  deleteRequest,
  getRequest,
  patchRequest,
  postMultipartRequest,
  postRequest,
} from '@/lib/api';
import {
  archiveProduct,
  archiveProducts,
  countProductsByStat,
  createProduct,
  extractProductFromImages,
  listProducts,
  markProductFinished,
  markProductsFinished,
  removeProduct,
  removeProducts,
  restoreProduct,
  restoreProducts,
  updateProduct,
  uploadProductImage,
} from '@/services/shelf.service';
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
    (getRequest as jest.Mock).mockResolvedValue({
      items: [],
      nextCursor: 'next-cursor',
    });
    const controller = new AbortController();

    const result = await listProducts(
      {
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        search: 'retinol',
        sort: ShelfSort.RecentlyAdded,
      },
      'cursor-1',
      controller.signal,
    );

    expect(getRequest).toHaveBeenCalledWith('/inventory/products', {
      params: {
        stat: 'all',
        category: 'all',
        search: 'retinol',
        sort: 'recently-added',
        cursor: 'cursor-1',
      },
      signal: controller.signal,
    });
    expect(result.nextCursor).toBe('next-cursor');
  });

  it('fetches inventory stats', async () => {
    (getRequest as jest.Mock).mockResolvedValue({ all: 2 });

    const result = await countProductsByStat();

    expect(getRequest).toHaveBeenCalledWith('/inventory/products/stats');
    expect(result.all).toBe(2);
  });

  it('creates, updates, and deletes products through inventory endpoints', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ id: 'product-1' });
    (patchRequest as jest.Mock).mockResolvedValue({ id: 'product-1' });
    (deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await createProduct({
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
    await updateProduct('product-1', {
      identity: { name: 'Updated' },
    });
    await removeProduct('product-1');

    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products',
      expect.any(Object),
    );
    expect(patchRequest).toHaveBeenCalledWith('/inventory/products/product-1', {
      identity: { name: 'Updated' },
    });
    expect(deleteRequest).toHaveBeenCalledWith('/inventory/products/product-1');
  });

  it('uploads a product image through the dedicated inventory endpoint', async () => {
    const imageFile = new File(['photo'], 'product.jpg', {
      type: 'image/jpeg',
    });
    (postMultipartRequest as jest.Mock).mockResolvedValue({
      imageUrl: 'https://cdn.example.com/product-images/processed/photo.webp',
    });

    const result = await uploadProductImage(imageFile);

    expect(postMultipartRequest).toHaveBeenCalledWith(
      '/inventory/products/upload-image',
      expect.any(FormData),
      expect.objectContaining({ timeout: 30000 }),
    );

    const body = (postMultipartRequest as jest.Mock).mock.calls[0]?.[1] as FormData;
    expect(body.get('image')).toBe(imageFile);
    expect(result.imageUrl).toBe(
      'https://cdn.example.com/product-images/processed/photo.webp',
    );
  });

  it('uses explicit archive, restore, finish, and bulk delete endpoints', async () => {
    (postRequest as jest.Mock).mockResolvedValue(undefined);

    await archiveProduct('product-1');
    await restoreProduct('product-1');
    await markProductFinished('product-1');
    await archiveProducts(['product-1']);
    await restoreProducts(['product-1']);
    await markProductsFinished(['product-1']);
    await removeProducts(['product-1', 'product-2']);

    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products/product-1/archive',
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products/product-1/restore',
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products/product-1/mark-finished',
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk/archive',
      { ids: ['product-1'] },
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk/restore',
      { ids: ['product-1'] },
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/inventory/products/bulk/mark-finished',
      { ids: ['product-1'] },
    );
    expect(postRequest).toHaveBeenCalledWith(
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
    (postMultipartRequest as jest.Mock).mockResolvedValue(null);

    await extractProductFromImages({
      images: [productImage, ingredientImage, directionsImage],
      heroImageIndex: 2,
    });

    expect(postMultipartRequest).toHaveBeenCalledWith(
      '/catalogue/products/extract-from-images',
      expect.any(FormData),
      expect.objectContaining({ timeout: 75000 }),
    );

    const body = (postMultipartRequest as jest.Mock).mock.calls[0]?.[1] as FormData;
    expect(body.getAll('images')).toEqual([
      productImage,
      ingredientImage,
      directionsImage,
    ]);
    expect(body.get('heroImageIndex')).toBe('2');
  });
});
