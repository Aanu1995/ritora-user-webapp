import { waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  useCheckProduct,
  useCompareProducts,
  useFocusProductAnalysis,
  useRetryFocusProductAnalysis,
} from '@/hooks/use-ingredients';
import { ProductCategory } from '@/types/shelf';
import {
  ProductCheckSource,
  ProductCompareGoal,
  ProductCompareItemKind,
} from '@/types/ingredients';

jest.mock('@/services/ingredients.service', () => ({
  analyzeProducts: jest.fn(),
  checkProduct: jest.fn(),
  compareProducts: jest.fn(),
}));

import {
  analyzeProducts,
  checkProduct,
  compareProducts,
} from '@/services/ingredients.service';

const ANALYSIS_RESULT = {
  mode: 'focus' as const,
  status: 'ok' as const,
  confidence: 'high' as const,
  safetyScore: null,
  actives: [],
  conflicts: [],
  overlaps: [],
  layeringOrder: [],
  productsMissingInci: [],
  engineVersion: 'v2',
  generatedAt: '2026-04-24T09:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useFocusProductAnalysis', () => {
  it('stays idle until the user is authenticated', () => {
    const { result } = renderHookWithProviders(() =>
      useFocusProductAnalysis('product-1', { withExplanations: false }),
    );

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('requests focus-product analysis when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (analyzeProducts as jest.Mock).mockResolvedValue(
      ANALYSIS_RESULT,
    );

    const { result } = renderHookWithProviders(() =>
      useFocusProductAnalysis('product-1', { withExplanations: false }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(analyzeProducts).toHaveBeenCalledWith(
      {
        focusProductId: 'product-1',
        language: 'en',
        withExplanations: false,
      },
      expect.any(AbortSignal),
    );
  });
});

describe('useRetryFocusProductAnalysis', () => {
  it('forces a fresh focus-product analysis and updates the query cache', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (analyzeProducts as jest.Mock).mockResolvedValue(ANALYSIS_RESULT);

    const { result } = renderHookWithProviders(() =>
      useRetryFocusProductAnalysis('product-1', { withExplanations: false }),
    );

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(analyzeProducts).toHaveBeenCalledWith({
      focusProductId: 'product-1',
      language: 'en',
      withExplanations: false,
      forceRefresh: true,
    });
  });
});

describe('useCheckProduct', () => {
  it('runs an authenticated product-check mutation', async () => {
    (checkProduct as jest.Mock).mockResolvedValue({
      analysis: ANALYSIS_RESULT,
      verdict: { label: 'good_fit' },
    });

    const { result } = renderHookWithProviders(() => useCheckProduct());

    result.current.mutate({
      product: {
        source: ProductCheckSource.IngredientPaste,
        brand: 'Ritora Lab',
        name: 'Barrier Serum',
        category: ProductCategory.Serum,
        inciIngredients: ['Niacinamide'],
      },
      language: 'en',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(checkProduct).toHaveBeenCalledWith({
      product: {
        source: ProductCheckSource.IngredientPaste,
        brand: 'Ritora Lab',
        name: 'Barrier Serum',
        category: ProductCategory.Serum,
        inciIngredients: ['Niacinamide'],
      },
      language: 'en',
    });
  });
});

describe('useCompareProducts', () => {
  it('runs an authenticated product-compare mutation', async () => {
    (compareProducts as jest.Mock).mockResolvedValue({
      goal: ProductCompareGoal.NewProductDecision,
      comparison: { outcome: 'no_clear_winner' },
      items: [],
    });

    const { result } = renderHookWithProviders(() => useCompareProducts());

    result.current.mutate({
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

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(compareProducts).toHaveBeenCalledWith({
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
  });
});
