import {
  DataProvenance,
  type ManufacturerInfo,
  type CatalogueIdentity,
  ProductCategory,
  type ShelfProductDraft,
  type ShelfProductFormValue,
  ShelfFormValidationCode,
  ShelfStatus,
  type UserFields,
} from '@/types/shelf';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function createEmptyIdentity(): CatalogueIdentity {
  return {
    brand: '',
    name: '',
    category: ProductCategory.Other,
    barcode: null,
    imageUrls: [],
    sizeMl: null,
    description: null,
    benefits: [],
    suitedFor: [],
    inciIngredients: [],
    inciLastConfirmedAt: null,
  };
}

export function createEmptyManufacturer(): ManufacturerInfo {
  return {
    brand: '',
    parentCompany: null,
    countryOfOrigin: null,
    countryOfManufacture: null,
    supportEmail: null,
    productUrl: null,
    websiteUrl: null,
  };
}

export function createEmptyUserFields(): UserFields {
  return {
    openedAt: null,
    expiresAt: null,
    periodAfterOpeningMonths: 12,
    pricePaid: null,
    pricePaidCurrency: null,
    purchasedFrom: null,
    personalNotes: null,
    preferredTimeOfDay: null,
  };
}

function trimOrNull(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return HTTP_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateShelfProductForm(
  value: ShelfProductFormValue,
): ShelfFormValidationCode | null {
  if (!value.identity.brand.trim()) {
    return ShelfFormValidationCode.BrandRequired;
  }

  if (!value.identity.name.trim()) {
    return ShelfFormValidationCode.NameRequired;
  }

  if (value.identity.sizeMl != null && !Number.isFinite(value.identity.sizeMl)) {
    return ShelfFormValidationCode.SizeInvalid;
  }

  if (value.userFields.pricePaid != null && !Number.isFinite(value.userFields.pricePaid)) {
    return ShelfFormValidationCode.PriceInvalid;
  }

  const supportEmail = trimOrNull(value.manufacturer.supportEmail);
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    return ShelfFormValidationCode.SupportEmailInvalid;
  }

  const productUrl = trimOrNull(value.manufacturer.productUrl);
  if (productUrl && !isSafeExternalUrl(productUrl)) {
    return ShelfFormValidationCode.ProductUrlInvalid;
  }

  return null;
}

export function normalizeShelfProductForm(
  value: ShelfProductFormValue,
): ShelfProductFormValue {
  return {
    identity: {
      ...value.identity,
      brand: value.identity.brand.trim(),
      name: value.identity.name.trim(),
      sizeMl:
        value.identity.sizeMl == null || Number.isNaN(value.identity.sizeMl)
          ? null
          : value.identity.sizeMl,
      description: trimOrNull(value.identity.description),
      benefits: normalizeStringList(value.identity.benefits),
      suitedFor: normalizeStringList(value.identity.suitedFor),
      inciIngredients: normalizeStringList(value.identity.inciIngredients),
    },
    guidance: {
      ...value.guidance,
      steps: normalizeStringList(value.guidance.steps),
      cautions: normalizeStringList(value.guidance.cautions),
      waitMinutes:
        value.guidance.waitMinutes == null ||
        Number.isNaN(value.guidance.waitMinutes)
          ? null
          : value.guidance.waitMinutes,
    },
    manufacturer: {
      ...value.manufacturer,
      brand: value.manufacturer.brand.trim(),
      parentCompany: trimOrNull(value.manufacturer.parentCompany),
      countryOfOrigin: trimOrNull(value.manufacturer.countryOfOrigin),
      countryOfManufacture: trimOrNull(value.manufacturer.countryOfManufacture),
      supportEmail: trimOrNull(value.manufacturer.supportEmail),
      productUrl: trimOrNull(value.manufacturer.productUrl),
      websiteUrl: trimOrNull(value.manufacturer.websiteUrl),
    },
    userFields: {
      ...value.userFields,
      pricePaid:
        value.userFields.pricePaid == null || Number.isNaN(value.userFields.pricePaid)
          ? null
          : value.userFields.pricePaid,
      purchasedFrom: trimOrNull(value.userFields.purchasedFrom),
      personalNotes: trimOrNull(value.userFields.personalNotes),
    },
  };
}

export function toShelfProductDraft(
  value: ShelfProductFormValue,
  provenance: DataProvenance,
): ShelfProductDraft {
  const normalized = normalizeShelfProductForm(value);

  return {
    identity: normalized.identity,
    manufacturer: normalized.manufacturer,
    guidance: normalized.guidance,
    userFields: normalized.userFields,
    status: ShelfStatus.Active,
    provenance,
  };
}
