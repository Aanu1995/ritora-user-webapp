'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { QueryKey } from '@/constants/query-keys';
import { useAuthEnabled } from '@/hooks/use-auth-enabled';
import { normalizeLocale } from '@/i18n/config';
import * as ingredientsService from '@/services/ingredients.service';

const STALE_MS = 60_000;

enum IngredientsAnalysisQueryScope {
  FocusProduct = 'focus-product',
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
    queryKey: [
      QueryKey.IngredientsAnalysis,
      IngredientsAnalysisQueryScope.FocusProduct,
      productId,
      locale,
      withExplanations,
    ],
    queryFn: ({ signal }) => {
      if (!productId) {
        throw new Error('Product id is required');
      }

      return ingredientsService.analyzeProducts(
        { focusProductId: productId, language: locale, withExplanations },
        signal,
      );
    },
    enabled: isEnabled,
    staleTime: STALE_MS,
  });
}
