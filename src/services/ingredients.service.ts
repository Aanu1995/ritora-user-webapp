import { postRequest } from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  AnalysisResult,
  AnalyzeProductsInput,
  ProductCheckInput,
  ProductCheckResponse,
} from "@/types/ingredients";

export const PRODUCT_CHECK_REQUEST_TIMEOUT_MS = 120000;

export async function analyzeProducts(
  input: AnalyzeProductsInput,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const body =
    "focusProductId" in input
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

export async function checkProduct(
  input: ProductCheckInput,
): Promise<ProductCheckResponse> {
  return postRequest<ProductCheckResponse>(
    ApiPath.IngredientsCheckProduct,
    {
      product: input.product,
      language: input.language,
    },
    { timeout: PRODUCT_CHECK_REQUEST_TIMEOUT_MS },
  );
}
