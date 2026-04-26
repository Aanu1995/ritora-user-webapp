import {
  ProductCategory,
  type ShelfProduct,
  ShelfCategoryFilter,
} from '@/types/shelf';
import { StepLabel } from '@/types/schedule';

const STEP_LABEL_TO_PRODUCT_CATEGORY: Partial<Record<StepLabel, ProductCategory>> = {
  [StepLabel.Cleanser]: ProductCategory.Cleanser,
  [StepLabel.Toner]: ProductCategory.Toner,
  [StepLabel.Essence]: ProductCategory.Essence,
  [StepLabel.Serum]: ProductCategory.Serum,
  [StepLabel.Moisturizer]: ProductCategory.Moisturizer,
  [StepLabel.SunProtection]: ProductCategory.SunProtection,
  [StepLabel.Mask]: ProductCategory.Mask,
  [StepLabel.Exfoliant]: ProductCategory.Exfoliant,
  [StepLabel.EyeCare]: ProductCategory.EyeCare,
  [StepLabel.LipCare]: ProductCategory.LipCare,
  [StepLabel.Treatment]: ProductCategory.Treatment,
};

export function resolveProductPickerCategory(
  stepLabel: StepLabel | null,
): ProductCategory | null {
  if (!stepLabel) {
    return null;
  }

  return STEP_LABEL_TO_PRODUCT_CATEGORY[stepLabel] ?? null;
}

export function resolveProductPickerQueryCategory(
  stepLabel: StepLabel | null,
): ProductCategory | ShelfCategoryFilter.All {
  return resolveProductPickerCategory(stepLabel) ?? ShelfCategoryFilter.All;
}

export function filterSelectableProducts(
  products: ShelfProduct[],
  category: ProductCategory | null,
): ShelfProduct[] {
  return products.filter((product) => {
    if (product.status === 'archived') {
      return false;
    }

    if (!category) {
      return true;
    }

    return product.identity.category === category;
  });
}
