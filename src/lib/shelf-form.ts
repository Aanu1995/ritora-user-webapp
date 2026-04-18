import {
  ApplicationMethod,
  DataProvenance,
  type ManufacturerInfo,
  type CatalogueIdentity,
  PreferredTimeOfDay,
  ProductCategory,
  Quantity,
  type ShelfProductDraft,
  type ShelfProductFormValue,
  ShelfFormValidationCode,
  ShelfStatus,
  type UserFields,
} from '@/types/shelf';
import { z } from 'zod';
import {
  addMonthsToIsoString,
  parseUtcDate,
} from '@/lib/dayjs';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATION_MESSAGE = {
  brandRequired: 'dialog.validation.brandRequired',
  nameRequired: 'dialog.validation.nameRequired',
  descriptionRequired: 'dialog.validation.descriptionRequired',
  benefitsRequired: 'dialog.validation.benefitsRequired',
  suitedForRequired: 'dialog.validation.suitedForRequired',
  ingredientsRequired: 'dialog.validation.ingredientsRequired',
  sizeRequired: 'dialog.validation.sizeRequired',
  sizeInvalid: 'dialog.validation.sizeInvalid',
  stepsRequired: 'dialog.validation.stepsRequired',
  priceInvalid: 'dialog.validation.priceInvalid',
  periodAfterOpeningInvalid: 'dialog.validation.periodAfterOpeningInvalid',
  supportEmailInvalid: 'dialog.validation.supportEmailInvalid',
  productUrlInvalid: 'dialog.validation.productUrlInvalid',
  expiresAtInvalid: 'dialog.validation.expiresAtInvalid',
  waitMinutesInvalid: 'dialog.validation.waitMinutesInvalid',
  stepsMax: 'dialog.validation.stepsMax',
  cautionsMax: 'dialog.validation.cautionsMax',
} as const;

const VALIDATION_CODE_BY_FIELD = {
  'identity.brand': ShelfFormValidationCode.BrandRequired,
  'identity.name': ShelfFormValidationCode.NameRequired,
  'identity.description': ShelfFormValidationCode.DescriptionRequired,
  'identity.benefits': ShelfFormValidationCode.BenefitsRequired,
  'identity.suitedFor': ShelfFormValidationCode.SuitedForRequired,
  'identity.inciIngredients': ShelfFormValidationCode.IngredientsRequired,
  'identity.sizeMl': ShelfFormValidationCode.SizeInvalid,
  'guidance.steps': ShelfFormValidationCode.GuidanceStepsRequired,
  'userFields.pricePaid': ShelfFormValidationCode.PriceInvalid,
  'manufacturer.supportEmail': ShelfFormValidationCode.SupportEmailInvalid,
  'manufacturer.productUrl': ShelfFormValidationCode.ProductUrlInvalid,
  'userFields.expiresAt': ShelfFormValidationCode.ExpiresAtInvalid,
} as const;

const STEP_MAX_LENGTH = 280;
const CAUTION_MAX_LENGTH = 200;

type ValidationFieldPath = keyof typeof VALIDATION_CODE_BY_FIELD;

export type ShelfFormFieldName = ValidationFieldPath;
export type ShelfFormFieldErrors = Partial<Record<ShelfFormFieldName, string>>;
export type ShelfGuidanceValidationErrors = {
  steps?: string;
  cautions?: string;
};

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

function isValidDateString(value: string | null): boolean {
  return Boolean(parseUtcDate(value));
}

function createOptionalNumberSchema(
  message: string,
  minimum?: number,
  inclusive = true,
) {
  return z.custom<number | null>(
    (value) => {
      if (value === null) {
        return true;
      }

      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return false;
      }

      if (minimum == null) {
        return true;
      }

      return inclusive ? value >= minimum : value > minimum;
    },
    { message },
  );
}

function createNullableStringSchema() {
  return z.custom<string | null>(
    (value) => value === null || typeof value === 'string',
  );
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return HTTP_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export const shelfProductFormSchema = z
  .object({
    identity: z.object({
      brand: z
        .string()
        .trim()
        .min(1, VALIDATION_MESSAGE.brandRequired),
      name: z
        .string()
        .trim()
        .min(1, VALIDATION_MESSAGE.nameRequired),
      category: z.nativeEnum(ProductCategory),
      barcode: createNullableStringSchema(),
      imageUrls: z.array(z.string()),
      sizeMl: createOptionalNumberSchema(VALIDATION_MESSAGE.sizeInvalid, 0, false),
      description: createNullableStringSchema(),
      benefits: z.array(z.string()),
      suitedFor: z.array(z.string()),
      inciIngredients: z.array(z.string()),
      inciLastConfirmedAt: createNullableStringSchema(),
    }),
    guidance: z.object({
      applicationMethod: z.nativeEnum(ApplicationMethod).nullable(),
      quantity: z.nativeEnum(Quantity).nullable(),
      steps: z.array(z.string().max(STEP_MAX_LENGTH, VALIDATION_MESSAGE.stepsMax)),
      cautions: z.array(
        z.string().max(CAUTION_MAX_LENGTH, VALIDATION_MESSAGE.cautionsMax),
      ),
      waitMinutes: createOptionalNumberSchema(
        VALIDATION_MESSAGE.waitMinutesInvalid,
        0,
        true,
      ),
    }),
    manufacturer: z.object({
      brand: z.string(),
      parentCompany: createNullableStringSchema(),
      countryOfOrigin: createNullableStringSchema(),
      countryOfManufacture: createNullableStringSchema(),
      supportEmail: z
        .string()
        .nullable()
        .superRefine((value, ctx) => {
          const email = trimOrNull(value);

          if (email && !EMAIL_PATTERN.test(email)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: VALIDATION_MESSAGE.supportEmailInvalid,
            });
          }
        }),
      productUrl: z
        .string()
        .nullable()
        .superRefine((value, ctx) => {
          const productUrl = trimOrNull(value);

          if (productUrl && !isSafeExternalUrl(productUrl)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: VALIDATION_MESSAGE.productUrlInvalid,
            });
          }
        }),
      websiteUrl: createNullableStringSchema(),
    }),
    userFields: z.object({
      openedAt: createNullableStringSchema(),
      expiresAt: createNullableStringSchema(),
      periodAfterOpeningMonths: createOptionalNumberSchema(
        VALIDATION_MESSAGE.periodAfterOpeningInvalid,
        0,
        false,
      ),
      pricePaid: createOptionalNumberSchema(VALIDATION_MESSAGE.priceInvalid, 0, true),
      pricePaidCurrency: createNullableStringSchema(),
      purchasedFrom: createNullableStringSchema(),
      personalNotes: createNullableStringSchema(),
      preferredTimeOfDay: z.nativeEnum(PreferredTimeOfDay).nullable(),
    }),
  })
  .superRefine((value, ctx) => {
    const {
      sizeMl,
      description,
      benefits,
      suitedFor,
      inciIngredients,
    } = value.identity;
    const { openedAt, expiresAt } = value.userFields;
    const trimmedDescription = trimOrNull(description);
    const normalizedBenefits = normalizeStringList(benefits);
    const normalizedSuitedFor = normalizeStringList(suitedFor);
    const normalizedIngredients = normalizeStringList(inciIngredients);
    const trimmedSteps = normalizeStringList(value.guidance.steps);

    if (trimmedDescription === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identity', 'description'],
        message: VALIDATION_MESSAGE.descriptionRequired,
      });
    }

    if (normalizedBenefits.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identity', 'benefits'],
        message: VALIDATION_MESSAGE.benefitsRequired,
      });
    }

    if (normalizedSuitedFor.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identity', 'suitedFor'],
        message: VALIDATION_MESSAGE.suitedForRequired,
      });
    }

    if (normalizedIngredients.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identity', 'inciIngredients'],
        message: VALIDATION_MESSAGE.ingredientsRequired,
      });
    }

    if (sizeMl === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identity', 'sizeMl'],
        message: VALIDATION_MESSAGE.sizeRequired,
      });
    }

    if (trimmedSteps.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guidance', 'steps'],
        message: VALIDATION_MESSAGE.stepsRequired,
      });
    }

    const hasExpiresAt = isValidDateString(expiresAt);

    if (
      typeof openedAt !== 'string' ||
      typeof expiresAt !== 'string' ||
      !hasExpiresAt
    ) {
      return;
    }

    const parsedOpenedAt = parseUtcDate(openedAt);
    const parsedExpiresAt = parseUtcDate(expiresAt);

    if (
      parsedOpenedAt &&
      parsedExpiresAt &&
      parsedExpiresAt.isBefore(parsedOpenedAt)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userFields', 'expiresAt'],
        message: VALIDATION_MESSAGE.expiresAtInvalid,
      });
    }
  });

export function validateShelfProductForm(
  value: ShelfProductFormValue,
): ShelfFormValidationCode | null {
  const result = shelfProductFormSchema.safeParse(value);

  if (result.success) {
    return null;
  }

  const firstMatchingCode = result.error.issues
    .map((issue) => {
      const path = issue.path.join('.') as ValidationFieldPath;
      if (path === 'identity.sizeMl') {
        return issue.message === VALIDATION_MESSAGE.sizeRequired
          ? ShelfFormValidationCode.SizeRequired
          : ShelfFormValidationCode.SizeInvalid;
      }

      if (path === 'guidance.steps') {
        return ShelfFormValidationCode.GuidanceStepsRequired;
      }

      return VALIDATION_CODE_BY_FIELD[path];
    })
    .find((code) => code != null);

  return firstMatchingCode ?? null;
}

export function getShelfGuidanceValidationErrors(
  value: ShelfProductFormValue,
): ShelfGuidanceValidationErrors {
  const result = shelfProductFormSchema.safeParse(value);

  if (result.success) {
    return {};
  }

  const stepIssue = result.error.issues.find(
    (issue) => issue.path[0] === 'guidance' && issue.path[1] === 'steps',
  );
  const cautionIssue = result.error.issues.find(
    (issue) => issue.path[0] === 'guidance' && issue.path[1] === 'cautions',
  );

  return {
    steps: stepIssue?.message,
    cautions: cautionIssue?.message,
  };
}

export function normalizeShelfProductForm(
  value: ShelfProductFormValue,
): ShelfProductFormValue {
  const normalizedOpenedAt = trimOrNull(value.userFields.openedAt);
  const normalizedExpiresAt = trimOrNull(value.userFields.expiresAt);
  const normalizedPao =
    value.userFields.periodAfterOpeningMonths == null ||
    Number.isNaN(value.userFields.periodAfterOpeningMonths)
      ? null
      : value.userFields.periodAfterOpeningMonths;
  const derivedExpiresAt =
    normalizedExpiresAt ??
    (normalizedOpenedAt &&
    normalizedPao != null &&
    normalizedPao > 0 &&
    isValidDateString(normalizedOpenedAt)
      ? addMonthsToIsoString(normalizedOpenedAt, normalizedPao)
      : null);

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
      openedAt: normalizedOpenedAt,
      expiresAt: derivedExpiresAt,
      periodAfterOpeningMonths: normalizedPao,
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
