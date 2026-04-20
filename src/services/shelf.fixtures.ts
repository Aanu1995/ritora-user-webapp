/**
 * Seed data and barcode lookup fixtures for the mocked shelf service.
 *
 * These are shaped like what a real Open Beauty Facts response plus a few
 * manufacturer fields would yield. When the backend plan lands and replaces
 * the mock with real API calls, the caller contract stays identical; only
 * the service implementation changes.
 */

import {
  ApplicationMethod,
  CatalogueSource,
  type CatalogueSuggestion,
  DataProvenance,
  LookupConfidence,
  ProductCategory,
  Quantity,
  type ResolvedLookup,
  type ShelfProduct,
  ShelfStatus,
} from '@/types/shelf';

const nowIso = '2026-04-17T09:00:00.000Z';
const threeWeeksAgo = '2026-03-27T09:00:00.000Z';
const twoMonthsAgo = '2026-02-15T09:00:00.000Z';
const sixWeeksAgo = '2026-03-06T09:00:00.000Z';
const tenMonthsAgo = '2025-06-17T09:00:00.000Z';
const oneWeekAgo = '2026-04-10T09:00:00.000Z';

function toCatalogueSuggestion(product: ShelfProduct): CatalogueSuggestion {
  return {
    id: product.id,
    brand: product.identity.brand,
    name: product.identity.name,
    category: product.identity.category,
    imageUrls: product.identity.imageUrls,
    sizeMl: product.identity.sizeMl,
    barcode: product.identity.barcode,
    source: CatalogueSource.RitoraCatalogue,
    confidence: LookupConfidence.High,
    reviewRequired: false,
  };
}

function withResolvedDefaults(
  lookup: Omit<
    ResolvedLookup,
    'guidance' | 'source' | 'confidence' | 'reviewRequired' | 'warnings' | 'evidence'
  > &
    Partial<
      Pick<
        ResolvedLookup,
        'guidance' | 'source' | 'confidence' | 'reviewRequired' | 'warnings' | 'evidence'
      >
    >,
): ResolvedLookup {
  return {
    guidance: lookup.guidance ?? {},
    source: lookup.source ?? CatalogueSource.RitoraCatalogue,
    confidence: lookup.confidence ?? LookupConfidence.Medium,
    reviewRequired: lookup.reviewRequired ?? false,
    warnings: lookup.warnings ?? [],
    evidence: lookup.evidence ?? [],
    ...lookup,
  };
}

export const SHELF_SEED: ShelfProduct[] = [
  {
    id: 'seed-cerave-retinol',
    identity: {
      brand: 'CeraVe',
      name: 'Resurfacing Retinol Serum',
      category: ProductCategory.Serum,
      barcode: '3337875597227',
      imageUrls: [],
      sizeMl: 30,
      description:
        'A gentle nightly retinol serum that supports smoother texture and more even tone over time. Formulated with ceramides and licorice root extract to help the skin stay calm as it adjusts.',
      benefits: ['smoothing', 'clarifying', 'hydrating'],
      suitedFor: ['dry', 'combination', 'sensitive'],
      inciIngredients: [
        'Aqua',
        'Glycerin',
        'Butylene Glycol',
        'Dimethicone',
        'Niacinamide',
        'Tocopherol',
        'Ceramide NP',
        'Ceramide AP',
        'Ceramide EOP',
        'Phytosphingosine',
        'Cholesterol',
        'Sodium Lauroyl Lactylate',
        'Retinol',
        'Licorice Root Extract',
        'Carbomer',
        'Xanthan Gum',
        'Ethylhexylglycerin',
        'Phenoxyethanol',
      ],
      inciLastConfirmedAt: nowIso,
    },
    guidance: {
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.TwoToThreeDrops,
      steps: [
        'Cleanse and tone. Pat skin until just barely damp.',
        'Dispense two to three drops onto clean fingertips.',
        'Press gently over the face. Avoid the eye area and lips.',
        'Wait 60 seconds, then follow with moisturiser to seal.',
      ],
      cautions: [
        'Avoid the eye area and lips.',
        'Increases sun sensitivity. Use SPF during the day.',
        'Do not use with AHA, BHA, or benzoyl peroxide on the same night.',
      ],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'CeraVe',
      parentCompany: "L'Oréal",
      countryOfOrigin: 'US',
      countryOfManufacture: 'US',
      supportEmail: 'support@cerave.com',
      productUrl:
        'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
      websiteUrl: 'https://www.cerave.com',
    },
    userFields: {
      openedAt: threeWeeksAgo,
      expiresAt: '2027-02-14T09:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.Catalogue,
    createdAt: threeWeeksAgo,
    updatedAt: threeWeeksAgo,
  },
  {
    id: 'seed-la-roche-posay-cleanser',
    identity: {
      brand: 'La Roche-Posay',
      name: 'Toleriane Hydrating Cleanser',
      category: ProductCategory.Cleanser,
      barcode: '3337875545754',
      imageUrls: [],
      sizeMl: 200,
      description:
        'A soap-free cream cleanser that removes impurities and leaves the skin feeling comfortable, not tight. Suitable for daily morning and evening use.',
      benefits: ['hydrating', 'non-stripping'],
      suitedFor: ['normal', 'dry', 'sensitive'],
      inciIngredients: [
        'Aqua',
        'Glycerin',
        'Niacinamide',
        'Ceramide NP',
        'Panthenol',
        'Xanthan Gum',
      ],
      inciLastConfirmedAt: nowIso,
    },
    guidance: {
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.PeaSize,
      steps: [
        'Dispense a pea-sized amount onto damp fingertips.',
        'Massage gently onto damp skin in circular motions.',
        'Rinse thoroughly with lukewarm water.',
      ],
      cautions: ['Avoid the eye area.'],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'La Roche-Posay',
      parentCompany: "L'Oréal",
      countryOfOrigin: 'FR',
      countryOfManufacture: 'FR',
      supportEmail: 'contact@laroche-posay.com',
      productUrl: null,
      websiteUrl: 'https://www.laroche-posay.com',
    },
    userFields: {
      openedAt: twoMonthsAgo,
      expiresAt: '2027-02-15T09:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.Catalogue,
    createdAt: twoMonthsAgo,
    updatedAt: twoMonthsAgo,
  },
  {
    id: 'seed-joseon-spf',
    identity: {
      brand: 'Beauty of Joseon',
      name: 'Relief Sun: Rice + Probiotics SPF 50+',
      category: ProductCategory.SunProtection,
      barcode: '8809738320006',
      imageUrls: [],
      sizeMl: 50,
      description:
        'A lightweight daily sunscreen with rice extract and probiotic complex. Finishes invisibly and does not leave a white cast.',
      benefits: ['broad-spectrum', 'hydrating'],
      suitedFor: ['normal', 'combination', 'dry', 'oily'],
      inciIngredients: [
        'Aqua',
        'Ethylhexyl Methoxycinnamate',
        'Ethylhexyl Salicylate',
        'Propanediol',
        'Oryza Sativa Extract',
        'Glycerin',
        'Tocopherol',
      ],
      inciLastConfirmedAt: nowIso,
    },
    guidance: {
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.CoinSize,
      steps: [
        'Apply as the last step of your morning routine.',
        'Dispense a coin-sized amount and warm between fingertips.',
        'Press evenly across the face and neck.',
        'Reapply every two hours when in direct sun.',
      ],
      cautions: [
        'Reapply every two hours when in direct sun.',
        'Avoid contact with the eyes.',
      ],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'Beauty of Joseon',
      parentCompany: null,
      countryOfOrigin: 'KR',
      countryOfManufacture: 'KR',
      supportEmail: null,
      productUrl: 'https://beautyofjoseon.com/products/relief-sun',
      websiteUrl: 'https://beautyofjoseon.com',
    },
    userFields: {
      openedAt: null,
      expiresAt: null,
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.Catalogue,
    createdAt: oneWeekAgo,
    updatedAt: oneWeekAgo,
  },
  {
    id: 'seed-cetaphil-moisturiser',
    identity: {
      brand: 'Cetaphil',
      name: 'Moisturising Cream',
      category: ProductCategory.Moisturizer,
      barcode: '302993927501',
      imageUrls: [],
      sizeMl: 450,
      description: 'A rich cream for dry, sensitive skin.',
      benefits: ['rich', 'hydrating'],
      suitedFor: ['dry', 'sensitive'],
      inciIngredients: [
        'Aqua',
        'Petrolatum',
        'Glycerin',
        'Cetyl Alcohol',
        'Stearyl Alcohol',
      ],
      inciLastConfirmedAt: nowIso,
    },
    guidance: {
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.PeaSize,
      steps: [
        'Apply generously to dry or irritated areas as needed.',
        'Massage in until fully absorbed.',
      ],
      cautions: ['For external use only.'],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'Cetaphil',
      parentCompany: 'Galderma',
      countryOfOrigin: 'CA',
      countryOfManufacture: 'CA',
      supportEmail: null,
      productUrl: null,
      websiteUrl: 'https://www.cetaphil.com',
    },
    userFields: {
      openedAt: tenMonthsAgo,
      expiresAt: '2026-06-17T09:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.Catalogue,
    createdAt: tenMonthsAgo,
    updatedAt: tenMonthsAgo,
  },
  {
    id: 'seed-pyunkang-toner',
    identity: {
      brand: 'Pyunkang Yul',
      name: 'Essence Toner',
      category: ProductCategory.Toner,
      barcode: '8809486430552',
      imageUrls: [],
      sizeMl: 200,
      description: 'Minimalist hydrating toner with milk vetch root extract.',
      benefits: ['hydrating', 'calming'],
      suitedFor: ['normal', 'dry', 'sensitive'],
      inciIngredients: ['Astragalus Membranaceus Root Extract', 'Aqua', 'Glycerin'],
      inciLastConfirmedAt: nowIso,
    },
    guidance: {
      applicationMethod: ApplicationMethod.CottonPad,
      quantity: Quantity.AsNeeded,
      steps: [
        'After cleansing, saturate a cotton pad with toner.',
        'Sweep gently across the face and neck.',
        'Allow to absorb before the next step.',
      ],
      cautions: [],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'Pyunkang Yul',
      parentCompany: null,
      countryOfOrigin: 'KR',
      countryOfManufacture: 'KR',
      supportEmail: null,
      productUrl: null,
      websiteUrl: 'https://pyunkangyul.com',
    },
    userFields: {
      openedAt: oneWeekAgo,
      expiresAt: '2026-10-10T09:00:00.000Z',
      periodAfterOpeningMonths: 6,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.Catalogue,
    createdAt: oneWeekAgo,
    updatedAt: oneWeekAgo,
  },
  {
    id: 'seed-cosrx-essence',
    identity: {
      brand: 'COSRX',
      name: 'Advanced Snail 96 Mucin Power Essence',
      category: ProductCategory.Essence,
      barcode: '8809416470405',
      imageUrls: [],
      sizeMl: 100,
      description:
        'Lightweight essence with 96 percent snail secretion filtrate. Supports repair and hydration.',
      benefits: ['repairing', 'hydrating'],
      suitedFor: ['normal', 'combination', 'dry'],
      inciIngredients: [
        'Snail Secretion Filtrate',
        'Betaine',
        'Butylene Glycol',
        'Sodium Hyaluronate',
      ],
      inciLastConfirmedAt: nowIso,
    },
    guidance: {
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.AsNeeded,
      steps: [
        'Dispense two pumps onto clean fingertips.',
        'Pat gently across the face.',
        'Follow with serum or moisturiser.',
      ],
      cautions: ['Patch-test before first use if you have a shellfish allergy.'],
      waitMinutes: null,
    },
    manufacturer: {
      brand: 'COSRX',
      parentCompany: null,
      countryOfOrigin: 'KR',
      countryOfManufacture: 'KR',
      supportEmail: null,
      productUrl: null,
      websiteUrl: 'https://www.cosrx.com',
    },
    userFields: {
      openedAt: sixWeeksAgo,
      expiresAt: '2027-03-06T09:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.Catalogue,
    createdAt: sixWeeksAgo,
    updatedAt: sixWeeksAgo,
  },
];

export const CATALOGUE_SUGGESTIONS: CatalogueSuggestion[] = [
  ...SHELF_SEED.map((product) => toCatalogueSuggestion(product)),
  {
    id: 'external-niacinamide-zinc',
    brand: 'The Ordinary',
    name: 'Niacinamide 10% + Zinc 1%',
    category: ProductCategory.Serum,
    imageUrls: [],
    sizeMl: 30,
    barcode: '769915190533',
    source: CatalogueSource.OpenBeautyFacts,
    confidence: LookupConfidence.Low,
    reviewRequired: true,
  },
  {
    id: 'external-paulas-choice-bha',
    brand: 'Paula\u2019s Choice',
    name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
    category: ProductCategory.Exfoliant,
    imageUrls: [],
    sizeMl: 118,
    barcode: '655439019011',
    source: CatalogueSource.OpenBeautyFacts,
    confidence: LookupConfidence.Low,
    reviewRequired: true,
  },
  {
    id: 'external-kiehls-ultra-facial-cream',
    brand: 'Kiehl\u2019s',
    name: 'Ultra Facial Cream',
    category: ProductCategory.Moisturizer,
    imageUrls: [],
    sizeMl: 50,
    barcode: '3605970359034',
    source: CatalogueSource.OpenBeautyFacts,
    confidence: LookupConfidence.Low,
    reviewRequired: true,
  },
  {
    id: 'external-glossier-milky-jelly-cleanser',
    brand: 'Glossier',
    name: 'Milky Jelly Cleanser',
    category: ProductCategory.Cleanser,
    imageUrls: [],
    sizeMl: 177,
    barcode: '810006130010',
    source: CatalogueSource.OpenBeautyFacts,
    confidence: LookupConfidence.Low,
    reviewRequired: true,
  },
];

/**
 * A small barcode lookup table. In the backend v2 this is replaced by a real
 * fetch to `https://world.openbeautyfacts.org/api/v2/product/{barcode}.json`.
 */
export const BARCODE_LOOKUP: Record<string, ResolvedLookup> = {
  '3337875597227': withResolvedDefaults({
    identity: {
      brand: 'CeraVe',
      name: 'Resurfacing Retinol Serum',
      category: ProductCategory.Serum,
      barcode: '3337875597227',
      sizeMl: 30,
      description:
        'A gentle nightly retinol serum that supports smoother texture and more even tone over time. Formulated with ceramides and licorice root extract.',
      benefits: ['smoothing', 'clarifying'],
      suitedFor: ['dry', 'combination', 'sensitive'],
      inciIngredients: [
        'Aqua',
        'Glycerin',
        'Niacinamide',
        'Retinol',
        'Licorice Root Extract',
      ],
      imageUrls: [],
    },
    manufacturer: {
      brand: 'CeraVe',
      parentCompany: "L'Oréal",
      countryOfOrigin: 'US',
      countryOfManufacture: 'US',
      productUrl:
        'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
      websiteUrl: 'https://www.cerave.com',
      supportEmail: 'support@cerave.com',
    },
    provenance: DataProvenance.BarcodeLookup,
  }),
  '8809416470405': withResolvedDefaults({
    identity: {
      brand: 'COSRX',
      name: 'Advanced Snail 96 Mucin Power Essence',
      category: ProductCategory.Essence,
      barcode: '8809416470405',
      sizeMl: 100,
      inciIngredients: [
        'Snail Secretion Filtrate',
        'Betaine',
        'Butylene Glycol',
      ],
      imageUrls: [],
    },
    manufacturer: {
      brand: 'COSRX',
      countryOfOrigin: 'KR',
      websiteUrl: 'https://www.cosrx.com',
    },
    provenance: DataProvenance.BarcodeLookup,
  }),
};

/**
 * Simple URL lookup for manufacturer pages. v2 will be a real fetch.
 */
export const URL_LOOKUP: Record<string, ResolvedLookup> = {
  'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum':
    BARCODE_LOOKUP['3337875597227'],
};
