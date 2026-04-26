import { waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useFocusProductAnalysis } from '@/hooks/use-ingredients';

jest.mock('@/services/ingredients.service', () => ({
  analyzeProducts: jest.fn(),
}));

import * as ingredientsService from '@/services/ingredients.service';

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
    (ingredientsService.analyzeProducts as jest.Mock).mockResolvedValue(
      ANALYSIS_RESULT,
    );

    const { result } = renderHookWithProviders(() =>
      useFocusProductAnalysis('product-1', { withExplanations: false }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(ingredientsService.analyzeProducts).toHaveBeenCalledWith(
      {
        focusProductId: 'product-1',
        language: 'en',
        withExplanations: false,
      },
      expect.any(AbortSignal),
    );
  });
});
