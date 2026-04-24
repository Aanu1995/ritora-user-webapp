import { postRequest } from '@/lib/api';
import { ApiPath } from '@/constants/api-paths';
import type {
  AnalysisResult,
  AnalyzeProductsInput,
} from '@/types/ingredients';

export async function analyzeProducts(
  input: AnalyzeProductsInput,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const body =
    'focusProductId' in input
      ? {
          focusProductId: input.focusProductId,
          language: input.language,
          withExplanations: input.withExplanations ?? false,
        }
      : {
          productIds: input.productIds,
          language: input.language,
          withExplanations: input.withExplanations ?? false,
        };

  return postRequest<AnalysisResult>(ApiPath.IngredientsAnalyze, body, {
    signal,
  });
}
