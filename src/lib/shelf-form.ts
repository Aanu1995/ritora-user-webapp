import {
  DataProvenance,
  type ManufacturerInfo,
  type CatalogueIdentity,
  ProductCategory,
  type ShelfProductDraft,
  type ShelfProductFormValue,
  ShelfStatus,
  type UserFields,
} from "@/types/shelf";
import { addMonthsToIsoString } from "@/lib/dayjs";
import {
  isValidDateString,
  normalizeStringList,
  trimOrNull,
} from "@/lib/shelf-form-text";
import { isSafeExternalUrl, isSafeProductImageUrl } from "@/lib/shelf-form-url";

export { isSafeExternalUrl, isSafeProductImageUrl };
export {
  getShelfFormFieldValidationErrors,
  getShelfGuidanceValidationErrors,
  shelfProductFormSchema,
  validateShelfProductForm,
  type ShelfFormFieldErrors,
  type ShelfFormFieldName,
  type ShelfGuidanceValidationErrors,
} from "@/lib/shelf-form-validation";

export function createEmptyIdentity(): CatalogueIdentity {
  return {
    brand: "",
    name: "",
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
    brand: "",
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

export function normalizeShelfProductForm(
  value: ShelfProductFormValue,
): ShelfProductFormValue {
  const openedAt = trimOrNull(value.userFields.openedAt);
  const expiresAt = trimOrNull(value.userFields.expiresAt);
  const periodAfterOpeningMonths = normalizeOptionalNumber(
    value.userFields.periodAfterOpeningMonths,
  );

  return {
    identity: normalizeIdentity(value.identity),
    guidance: {
      ...value.guidance,
      steps: normalizeStringList(value.guidance.steps),
      cautions: normalizeStringList(value.guidance.cautions),
      waitMinutes: normalizeOptionalNumber(value.guidance.waitMinutes),
    },
    manufacturer: normalizeManufacturer(value.manufacturer),
    userFields: {
      ...value.userFields,
      openedAt,
      expiresAt: deriveExpiresAt(openedAt, expiresAt, periodAfterOpeningMonths),
      periodAfterOpeningMonths,
      pricePaid: normalizeOptionalNumber(value.userFields.pricePaid),
      purchasedFrom: trimOrNull(value.userFields.purchasedFrom),
      personalNotes: trimOrNull(value.userFields.personalNotes),
    },
  };
}

export function toShelfProductDraft(
  value: ShelfProductFormValue,
): ShelfProductDraft {
  const normalized = normalizeShelfProductForm(value);

  return {
    identity: normalized.identity,
    manufacturer: normalized.manufacturer,
    guidance: normalized.guidance,
    userFields: normalized.userFields,
    status: ShelfStatus.Active,
    provenance: DataProvenance.PhotoLookup,
  };
}

function normalizeIdentity(
  identity: ShelfProductFormValue["identity"],
): ShelfProductFormValue["identity"] {
  return {
    ...identity,
    brand: identity.brand.trim(),
    name: identity.name.trim(),
    imageUrls: identity.imageUrls.filter(isSafeProductImageUrl),
    sizeMl: normalizeOptionalNumber(identity.sizeMl),
    description: trimOrNull(identity.description),
    benefits: normalizeStringList(identity.benefits),
    suitedFor: normalizeStringList(identity.suitedFor),
    inciIngredients: normalizeStringList(identity.inciIngredients),
  };
}

function normalizeManufacturer(
  manufacturer: ShelfProductFormValue["manufacturer"],
): ShelfProductFormValue["manufacturer"] {
  const websiteUrl = trimOrNull(manufacturer.websiteUrl);

  return {
    ...manufacturer,
    brand: manufacturer.brand.trim(),
    parentCompany: trimOrNull(manufacturer.parentCompany),
    countryOfOrigin: trimOrNull(manufacturer.countryOfOrigin),
    countryOfManufacture: trimOrNull(manufacturer.countryOfManufacture),
    supportEmail: trimOrNull(manufacturer.supportEmail),
    productUrl: trimOrNull(manufacturer.productUrl),
    websiteUrl: websiteUrl && isSafeExternalUrl(websiteUrl) ? websiteUrl : null,
  };
}

function normalizeOptionalNumber(value: number | null): number | null {
  return value == null || Number.isNaN(value) ? null : value;
}

function deriveExpiresAt(
  openedAt: string | null,
  expiresAt: string | null,
  periodAfterOpeningMonths: number | null,
): string | null {
  if (expiresAt) {
    return expiresAt;
  }

  if (
    !openedAt ||
    periodAfterOpeningMonths == null ||
    periodAfterOpeningMonths <= 0 ||
    !isValidDateString(openedAt)
  ) {
    return null;
  }

  return addMonthsToIsoString(openedAt, periodAfterOpeningMonths);
}
