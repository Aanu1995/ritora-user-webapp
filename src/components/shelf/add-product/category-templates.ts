/**
 * Category-specific seed values for the How-to-use editor inside the
 * Confirm step. These ONLY pre-fill product-level data: application
 * method, quantity, ordered steps, and cautions. They never seed
 * routine data (AM / PM / frequency / layer step) — that lives in the
 * Suggestion feature, not the shelf.
 *
 * Step strings and cautions are translated by reading from the
 * `shelf.templates.{category}` namespace at fill time, so each language
 * gets its own copy. This module returns only the structural seeds.
 */

import {
  ApplicationMethod,
  type ApplicationGuidance,
  ProductCategory,
  Quantity,
} from '@/types/shelf';

type Seed = {
  applicationMethod: ApplicationMethod;
  quantity: Quantity;
};

const SEEDS: Record<ProductCategory, Seed> = {
  [ProductCategory.Cleanser]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.PeaSize,
  },
  [ProductCategory.Toner]: {
    applicationMethod: ApplicationMethod.CottonPad,
    quantity: Quantity.AsNeeded,
  },
  [ProductCategory.Essence]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.PumpTwo,
  },
  [ProductCategory.Serum]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.TwoToThreeDrops,
  },
  [ProductCategory.Moisturizer]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.PeaSize,
  },
  [ProductCategory.SunProtection]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.CoinSize,
  },
  [ProductCategory.Mask]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.Generous,
  },
  [ProductCategory.Exfoliant]: {
    applicationMethod: ApplicationMethod.CottonPad,
    quantity: Quantity.AsNeeded,
  },
  [ProductCategory.EyeCare]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.OneDrop,
  },
  [ProductCategory.LipCare]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.AsNeeded,
  },
  [ProductCategory.Treatment]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.AsNeeded,
  },
  [ProductCategory.Other]: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.AsNeeded,
  },
};

export function buildTemplateGuidance(
  category: ProductCategory,
  steps: string[],
  cautions: string[],
): ApplicationGuidance {
  const seed = SEEDS[category];
  return {
    applicationMethod: seed.applicationMethod,
    quantity: seed.quantity,
    steps,
    cautions,
    waitMinutes: null,
  };
}
