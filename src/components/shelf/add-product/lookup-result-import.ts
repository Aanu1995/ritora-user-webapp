import type { ProductFormReviewFields } from '../product-form-body';
import { COUNTRIES } from '@/constants/countries';
import { LookupWarningCode, type ResolvedLookup } from '@/types/shelf';

const COUNTRY_CODE_BY_NAME = COUNTRIES.reduce<Record<string, string>>(
  (index, country) => {
    index[country.name.trim().toLowerCase()] = country.code;
    return index;
  },
  {
    'south korea': 'KR',
    'korea south': 'KR',
    'korea, republic of': 'KR',
    'republic of korea': 'KR',
    'united states of america': 'US',
    usa: 'US',
    uk: 'GB',
    'great britain': 'GB',
    'united kingdom': 'GB',
    uae: 'AE',
    turkey: 'TR',
  },
);

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

export function normalizeLookupCountryValue(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase();
  if (COUNTRIES.some((country) => country.code === upper)) {
    return upper;
  }

  return COUNTRY_CODE_BY_NAME[trimmed.toLowerCase()] ?? trimmed;
}

export function buildLookupReviewFields(
  resolved: ResolvedLookup,
): ProductFormReviewFields {
  const resolvedIdentity = resolved.identity ?? {};
  const resolvedGuidance = resolved.guidance ?? {};
  const resolvedManufacturer = resolved.manufacturer ?? {};
  const warnings = resolved.warnings ?? [];
  const reviewFields: ProductFormReviewFields = {};
  const hasGenericReviewWarning = warnings.some((warning) =>
    [
      LookupWarningCode.ReviewRequired,
      LookupWarningCode.CommunityData,
      LookupWarningCode.AiNormalized,
      LookupWarningCode.PartialData,
    ].includes(warning),
  );

  if (hasGenericReviewWarning) {
    if (hasMeaningfulValue(resolvedIdentity.sizeMl)) {
      reviewFields['identity.sizeMl'] = true;
    }
    if (hasMeaningfulValue(resolvedIdentity.description)) {
      reviewFields['identity.description'] = true;
    }
    if (hasMeaningfulValue(resolvedIdentity.benefits)) {
      reviewFields['identity.benefits'] = true;
    }
    if (hasMeaningfulValue(resolvedIdentity.suitedFor)) {
      reviewFields['identity.suitedFor'] = true;
    }
    if (hasMeaningfulValue(resolvedManufacturer.parentCompany)) {
      reviewFields['manufacturer.parentCompany'] = true;
    }
    if (
      hasMeaningfulValue(resolvedManufacturer.countryOfManufacture) ||
      hasMeaningfulValue(resolvedManufacturer.countryOfOrigin)
    ) {
      reviewFields['manufacturer.countryOfManufacture'] = true;
    }
    if (hasMeaningfulValue(resolvedManufacturer.supportEmail)) {
      reviewFields['manufacturer.supportEmail'] = true;
    }
    if (hasMeaningfulValue(resolvedManufacturer.productUrl)) {
      reviewFields['manufacturer.productUrl'] = true;
    }
  }

  if (
    warnings.includes(LookupWarningCode.IngredientsUnverified) &&
    hasMeaningfulValue(resolvedIdentity.inciIngredients)
  ) {
    reviewFields['identity.inciIngredients'] = true;
  }

  if (
    warnings.includes(LookupWarningCode.GuidanceUnverified) &&
    (hasMeaningfulValue(resolvedGuidance.steps) ||
      hasMeaningfulValue(resolvedGuidance.cautions))
  ) {
    reviewFields.guidance = true;
  }

  return reviewFields;
}
