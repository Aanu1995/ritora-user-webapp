jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
  NO_CLIENT_SIDE_REQUEST_TIMEOUT_MS: 0,
  postRequest: jest.fn(),
}));

import { postRequest } from '@/lib/api';
import {
  PRODUCT_COMPARE_REQUEST_TIMEOUT_MS,
  PRODUCT_CHECK_REQUEST_TIMEOUT_MS,
  analyzeProducts,
  checkProduct,
  compareProducts,
} from '@/services/ingredients.service';
import { ProductCategory } from '@/types/shelf';
import {
  ProductCheckSource,
  ProductCompareGoal,
  ProductCompareItemKind,
} from '@/types/ingredients';

afterEach(() => jest.clearAllMocks());

describe('ingredients.service', () => {
  it('does not apply a client-side timeout to synchronous product checks', () => {
    expect(PRODUCT_CHECK_REQUEST_TIMEOUT_MS).toBe(0);
  });

  it('keeps product-compare timeout long enough for AI-backed comparison', () => {
    expect(PRODUCT_COMPARE_REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(240_000);
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
        forceRefresh: false,
      },
      { signal: controller.signal },
    );
  });

  it('posts forced focus-product analysis requests when requested', async () => {
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

    await analyzeProducts({
      focusProductId: 'product-1',
      language: 'en',
      withExplanations: false,
      forceRefresh: true,
    });

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/analyze',
      {
        focusProductId: 'product-1',
        language: 'en',
        withExplanations: false,
        forceRefresh: true,
      },
      { signal: undefined },
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

  it('posts product-compare requests to the ephemeral compare endpoint', async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      comparison: { outcome: 'no_clear_winner' },
      items: [],
    });

    await compareProducts({
      goal: ProductCompareGoal.NewProductDecision,
      anchor: {
        kind: ProductCompareItemKind.CheckedProduct,
        product: {
          source: ProductCheckSource.IngredientPaste,
          brand: 'Ritora Lab',
          name: 'Barrier Serum',
          category: ProductCategory.Serum,
          inciIngredients: ['Niacinamide'],
        },
      },
      candidates: [
        {
          kind: ProductCompareItemKind.ShelfProduct,
          productId: 'product-1',
        },
      ],
      language: 'en',
    });

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/compare-products',
      {
        goal: ProductCompareGoal.NewProductDecision,
        anchor: {
          kind: ProductCompareItemKind.CheckedProduct,
          product: {
            source: ProductCheckSource.IngredientPaste,
            brand: 'Ritora Lab',
            name: 'Barrier Serum',
            category: ProductCategory.Serum,
            inciIngredients: ['Niacinamide'],
          },
        },
        candidates: [
          {
            kind: ProductCompareItemKind.ShelfProduct,
            productId: 'product-1',
          },
        ],
        language: 'en',
      },
      { timeout: PRODUCT_COMPARE_REQUEST_TIMEOUT_MS },
    );
  });
});
