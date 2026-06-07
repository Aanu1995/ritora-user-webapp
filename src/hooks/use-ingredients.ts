'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { QueryKey } from '@/constants/query-keys';
import { useAuthEnabled } from '@/hooks/use-auth-enabled';
import { normalizeLocale } from '@/i18n/config';
import {
  analyzeProducts,
  checkProduct,
  compareProducts,
} from '@/services/ingredients.service';
import type {
  AnalysisResult,
  ProductCheckInput,
  ProductCheckResponse,
  ProductCompareInput,
  ProductCompareResponse,
} from '@/types/ingredients';

const STALE_MS = 60_000;
const MISSING_PRODUCT_ID_ERROR = 'MISSING_PRODUCT_ID';

enum IngredientsAnalysisQueryScope {
  FocusProduct = 'focus-product',
}

function buildFocusProductAnalysisQueryKey(
  productId: string | null,
  locale: ReturnType<typeof normalizeLocale>,
  withExplanations: boolean,
) {
  return [
    QueryKey.IngredientsAnalysis,
    IngredientsAnalysisQueryScope.FocusProduct,
    productId,
    locale,
    withExplanations,
  ] as const;
}

/**
 * Focus-mode analysis for a single product — returns the educational
 * `actives[]` payload used on the Shelf product detail tab. No cross-shelf
 * comparison. No "conflicts vs everything else" list.
 */
export function useFocusProductAnalysis(
  productId: string | null,
  options?: { withExplanations?: boolean; enabled?: boolean },
) {
  const locale = normalizeLocale(useLocale());
  const withExplanations = options?.withExplanations ?? false;
  const callerEnabled = options?.enabled ?? true;
  const isEnabled = useAuthEnabled(callerEnabled && Boolean(productId));

  return useQuery({
    queryKey: buildFocusProductAnalysisQueryKey(
      productId,
      locale,
      withExplanations,
    ),
    queryFn: ({ signal }) => {
      if (!productId) {
        throw new Error(MISSING_PRODUCT_ID_ERROR);
      }

      return analyzeProducts(
        { focusProductId: productId, language: locale, withExplanations },
        signal,
      );
    },
    enabled: isEnabled,
    staleTime: STALE_MS,
  });
}

export function useRetryFocusProductAnalysis(
  productId: string | null,
  options?: { withExplanations?: boolean },
) {
  const queryClient = useQueryClient();
  const locale = normalizeLocale(useLocale());
  const withExplanations = options?.withExplanations ?? false;

  return useMutation<AnalysisResult, Error, void>({
    mutationKey: [
      QueryKey.IngredientsAnalysis,
      IngredientsAnalysisQueryScope.FocusProduct,
      'retry',
      productId,
      locale,
      withExplanations,
    ],
    mutationFn: () => {
      if (!productId) {
        throw new Error(MISSING_PRODUCT_ID_ERROR);
      }

      return analyzeProducts({
        focusProductId: productId,
        language: locale,
        withExplanations,
        forceRefresh: true,
      });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        buildFocusProductAnalysisQueryKey(
          productId,
          locale,
          withExplanations,
        ),
        result,
      );
    },
  });
}

export function useCheckProduct() {
  return useMutation<ProductCheckResponse, Error, ProductCheckInput>({
    mutationKey: [QueryKey.ProductCheck],
    mutationFn: (input) => checkProduct(input),
  });
}

export function useCompareProducts() {
  return useMutation<ProductCompareResponse, Error, ProductCompareInput>({
    mutationKey: [QueryKey.ProductCompare],
    mutationFn: (input) => compareProducts(input),
  });
}
