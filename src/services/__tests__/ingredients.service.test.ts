jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { postRequest } from '@/lib/api';
import {
  PRODUCT_CHECK_REQUEST_TIMEOUT_MS,
  analyzeProducts,
  checkProduct,
} from '@/services/ingredients.service';
import { ProductCategory } from '@/types/shelf';
import { ProductCheckSource } from '@/types/ingredients';

afterEach(() => jest.clearAllMocks());

describe('ingredients.service', () => {
  it('keeps product-check timeout long enough for chained AI review calls', () => {
    expect(PRODUCT_CHECK_REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(120_000);
  });

  it('posts focus-product analysis requests with explanations', async () => {
    const controller = new AbortController();
    (postRequest as jest.Mock).mockResolvedValue({
      mode: 'focus',
      status: 'ok',
      confidence: 'high',
      safetyScore: null,
      actives: [],
      conflicts: [],
      overlaps: [],
      layeringOrder: [],
      productsMissingInci: [],
      engineVersion: 'v2',
      generatedAt: '2026-04-24T09:00:00.000Z',
    });

    await analyzeProducts(
      {
        focusProductId: 'product-1',
        language: 'sv',
        withExplanations: true,
      },
      controller.signal,
    );

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/analyze',
      {
        focusProductId: 'product-1',
        language: 'sv',
        withExplanations: true,
      },
      { signal: controller.signal },
    );
  });

  it('posts explicit productIds analysis requests', async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      mode: 'multi',
      status: 'ok',
      confidence: 'high',
      safetyScore: 78,
      actives: [],
      conflicts: [],
      overlaps: [],
      layeringOrder: [],
      productsMissingInci: [],
      engineVersion: 'v2',
      generatedAt: '2026-04-24T09:00:00.000Z',
    });

    await analyzeProducts({
      productIds: ['a', 'b'],
      language: 'en',
    });

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/analyze',
      {
        productIds: ['a', 'b'],
        language: 'en',
        withExplanations: false,
      },
      { signal: undefined },
    );
  });

  it('posts product-check requests to the ephemeral check endpoint', async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      analysis: {},
      verdict: { label: 'good_fit' },
    });

    await checkProduct({
      product: {
        source: ProductCheckSource.IngredientPaste,
        brand: 'Ritora Lab',
        name: 'Barrier Serum',
        category: ProductCategory.Serum,
        inciIngredients: ['Niacinamide'],
      },
      language: 'en',
    });

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/check-product',
      {
        product: {
          source: ProductCheckSource.IngredientPaste,
          brand: 'Ritora Lab',
          name: 'Barrier Serum',
          category: ProductCategory.Serum,
          inciIngredients: ['Niacinamide'],
        },
        language: 'en',
      },
      { timeout: PRODUCT_CHECK_REQUEST_TIMEOUT_MS },
    );
  });
});
