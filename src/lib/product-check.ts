import {
  ProductCategory,
  type ResolvedLookup,
} from '@/types/shelf';
import {
  ProductCheckSource,
  type ProductCheckProductInput,
} from '@/types/ingredients';

const INGREDIENT_SEPARATOR_PATTERN = /[\n,;]+/;
const PRODUCT_CATEGORY_VALUES: ReadonlySet<string> = new Set(
  Object.values(ProductCategory),
);

export function parseIngredientPaste(value: string): string[] {
  const seen = new Set<string>();

  return value
    .split(INGREDIENT_SEPARATOR_PATTERN)
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

export function buildPhotoProductCheckInput(
  resolved: ResolvedLookup,
): ProductCheckProductInput {
  const brand = textOrNull(
    resolved.identity.brand ?? resolved.manufacturer.brand,
  );
  const name = textOrNull(resolved.identity.name);

  return {
    source: ProductCheckSource.PhotoExtraction,
    brand,
    name,
    category: resolved.identity.category ?? ProductCategory.Other,
    inciIngredients: resolved.identity.inciIngredients ?? [],
    lookupConfidence: resolved.confidence,
    lookupWarnings: resolved.warnings,
    reviewRequired: resolved.reviewRequired,
  };
}

export function isProductCheckInputComplete(
  input: ProductCheckProductInput,
): boolean {
  const hasRequiredProductData =
    input.source === ProductCheckSource.PhotoExtraction ||
    (hasText(input.brand) && hasText(input.name));

  return (
    hasRequiredProductData &&
    PRODUCT_CATEGORY_VALUES.has(input.category) &&
    hasListValue(input.inciIngredients)
  );
}

function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasListValue(values: string[]): boolean {
  return values.some((value) => hasText(value));
}
