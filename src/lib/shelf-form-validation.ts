import {
  ApplicationMethod,
  PreferredTimeOfDay,
  ProductCategory,
  ProductIntroductionStatus,
  Quantity,
  ShelfFormValidationCode,
  type ShelfProductFormValue,
} from "@/types/shelf";
import { z } from "zod";
import {
  isValidDateString,
  normalizeStringList,
  trimOrNull,
} from "@/lib/shelf-form-text";
import { isSafeExternalUrl } from "@/lib/shelf-form-url";
import { parseUtcDate } from "@/lib/dayjs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_MAX_LENGTH = 280;
const CAUTION_MAX_LENGTH = 200;

const VALIDATION_MESSAGE = {
  brandRequired: "dialog.validation.brandRequired",
  nameRequired: "dialog.validation.nameRequired",
  descriptionRequired: "dialog.validation.descriptionRequired",
  benefitsRequired: "dialog.validation.benefitsRequired",
  suitedForRequired: "dialog.validation.suitedForRequired",
  sizeRequired: "dialog.validation.sizeRequired",
  sizeInvalid: "dialog.validation.sizeInvalid",
  stepsRequired: "dialog.validation.stepsRequired",
  priceInvalid: "dialog.validation.priceInvalid",
  periodAfterOpeningInvalid: "dialog.validation.periodAfterOpeningInvalid",
  supportEmailInvalid: "dialog.validation.supportEmailInvalid",
  productUrlInvalid: "dialog.validation.productUrlInvalid",
  expiresAtInvalid: "dialog.validation.expiresAtInvalid",
  waitMinutesInvalid: "dialog.validation.waitMinutesInvalid",
  stepsMax: "dialog.validation.stepsMax",
  cautionsMax: "dialog.validation.cautionsMax",
} as const;

const VALIDATION_CODE_BY_FIELD = {
  "identity.brand": ShelfFormValidationCode.BrandRequired,
  "identity.name": ShelfFormValidationCode.NameRequired,
  "identity.description": ShelfFormValidationCode.DescriptionRequired,
  "identity.benefits": ShelfFormValidationCode.BenefitsRequired,
  "identity.suitedFor": ShelfFormValidationCode.SuitedForRequired,
  "identity.sizeMl": ShelfFormValidationCode.SizeInvalid,
  "guidance.steps": ShelfFormValidationCode.GuidanceStepsRequired,
  "userFields.pricePaid": ShelfFormValidationCode.PriceInvalid,
  "manufacturer.supportEmail": ShelfFormValidationCode.SupportEmailInvalid,
  "manufacturer.productUrl": ShelfFormValidationCode.ProductUrlInvalid,
  "userFields.expiresAt": ShelfFormValidationCode.ExpiresAtInvalid,
} as const;

type ValidationFieldPath = keyof typeof VALIDATION_CODE_BY_FIELD;

export type ShelfFormFieldName = ValidationFieldPath;
export type ShelfFormFieldErrors = Partial<Record<ShelfFormFieldName, string>>;
export type ShelfGuidanceValidationErrors = {
  steps?: string;
  cautions?: string;
};

export const shelfProductFormSchema = z
  .object({
    identity: z.object({
      brand: z.string().trim().min(1, VALIDATION_MESSAGE.brandRequired),
      name: z.string().trim().min(1, VALIDATION_MESSAGE.nameRequired),
      category: z.nativeEnum(ProductCategory),
      barcode: nullableStringSchema(),
      imageUrls: z.array(z.string()),
      sizeMl: optionalNumberSchema(VALIDATION_MESSAGE.sizeInvalid, 0, false),
      description: nullableStringSchema(),
      benefits: z.array(z.string()),
      suitedFor: z.array(z.string()),
      inciIngredients: z.array(z.string()),
      inciLastConfirmedAt: nullableStringSchema(),
    }),
    guidance: z.object({
      applicationMethod: z.nativeEnum(ApplicationMethod).nullable(),
      quantity: z.nativeEnum(Quantity).nullable(),
      steps: z.array(
        z.string().max(STEP_MAX_LENGTH, VALIDATION_MESSAGE.stepsMax),
      ),
      cautions: z.array(
        z.string().max(CAUTION_MAX_LENGTH, VALIDATION_MESSAGE.cautionsMax),
      ),
      waitMinutes: optionalNumberSchema(
        VALIDATION_MESSAGE.waitMinutesInvalid,
        0,
        true,
      ),
    }),
    manufacturer: z.object({
      brand: z.string(),
      parentCompany: nullableStringSchema(),
      countryOfOrigin: nullableStringSchema(),
      countryOfManufacture: nullableStringSchema(),
      supportEmail: supportEmailSchema(),
      productUrl: productUrlSchema(),
      websiteUrl: nullableStringSchema(),
    }),
    userFields: z.object({
      openedAt: nullableStringSchema(),
      expiresAt: nullableStringSchema(),
      periodAfterOpeningMonths: optionalNumberSchema(
        VALIDATION_MESSAGE.periodAfterOpeningInvalid,
        0,
        false,
      ),
      pricePaid: optionalNumberSchema(VALIDATION_MESSAGE.priceInvalid, 0, true),
      pricePaidCurrency: nullableStringSchema(),
      purchasedFrom: nullableStringSchema(),
      personalNotes: nullableStringSchema(),
      preferredTimeOfDay: z.nativeEnum(PreferredTimeOfDay).nullable(),
    }),
    introductionStatus: z.nativeEnum(ProductIntroductionStatus),
  })
  .superRefine((value, ctx) => {
    addRequiredIssue(
      ctx,
      ["identity", "description"],
      value.identity.description,
    );
    addRequiredListIssue(
      ctx,
      ["identity", "benefits"],
      value.identity.benefits,
    );
    addRequiredListIssue(
      ctx,
      ["identity", "suitedFor"],
      value.identity.suitedFor,
    );
    addRequiredListIssue(ctx, ["guidance", "steps"], value.guidance.steps);

    if (value.identity.sizeMl === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identity", "sizeMl"],
        message: VALIDATION_MESSAGE.sizeRequired,
      });
    }

    if (
      !canCompareExpiry(value.userFields.openedAt, value.userFields.expiresAt)
    ) {
      return;
    }

    const openedAt = parseUtcDate(value.userFields.openedAt);
    const expiresAt = parseUtcDate(value.userFields.expiresAt);
    if (openedAt && expiresAt && expiresAt.isBefore(openedAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["userFields", "expiresAt"],
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

  return (
    result.error.issues
      .map((issue) => validationCodeForIssue(issue))
      .find((code) => code != null) ?? null
  );
}

export function getShelfGuidanceValidationErrors(
  value: ShelfProductFormValue,
): ShelfGuidanceValidationErrors {
  const result = shelfProductFormSchema.safeParse(value);

  if (result.success) {
    return {};
  }

  const stepIssue = result.error.issues.find(
    (issue) => issue.path[0] === "guidance" && issue.path[1] === "steps",
  );
  const cautionIssue = result.error.issues.find(
    (issue) => issue.path[0] === "guidance" && issue.path[1] === "cautions",
  );

  return {
    steps: stepIssue?.message,
    cautions: cautionIssue?.message,
  };
}

export function getShelfFormFieldValidationErrors(
  value: ShelfProductFormValue,
): ShelfFormFieldErrors {
  const result = shelfProductFormSchema.safeParse(value);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<ShelfFormFieldErrors>((errors, issue) => {
    const path = issue.path.join(".") as ShelfFormFieldName;

    if (path in VALIDATION_CODE_BY_FIELD && !errors[path]) {
      errors[path] = issue.message;
    }

    return errors;
  }, {});
}

function optionalNumberSchema(
  message: string,
  minimum?: number,
  inclusive = true,
) {
  return z.custom<number | null>(
    (value) => {
      if (value === null) return true;
      if (typeof value !== "number" || !Number.isFinite(value)) return false;
      if (minimum == null) return true;
      return inclusive ? value >= minimum : value > minimum;
    },
    { message },
  );
}

function nullableStringSchema() {
  return z.custom<string | null>(
    (value) => value === null || typeof value === "string",
  );
}

function supportEmailSchema() {
  return z
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
    });
}

function productUrlSchema() {
  return z
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
    });
}

function addRequiredIssue(
  ctx: z.RefinementCtx,
  path: Array<string>,
  value: string | null,
): void {
  if (trimOrNull(value) !== null) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message: requiredMessageForPath(path),
  });
}

function addRequiredListIssue(
  ctx: z.RefinementCtx,
  path: Array<string>,
  values: string[],
): void {
  if (normalizeStringList(values).length > 0) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message: requiredMessageForPath(path),
  });
}

function requiredMessageForPath(path: Array<string>): string {
  switch (path.join(".")) {
    case "identity.description":
      return VALIDATION_MESSAGE.descriptionRequired;
    case "identity.benefits":
      return VALIDATION_MESSAGE.benefitsRequired;
    case "identity.suitedFor":
      return VALIDATION_MESSAGE.suitedForRequired;
    case "guidance.steps":
      return VALIDATION_MESSAGE.stepsRequired;
    default:
      return VALIDATION_MESSAGE.descriptionRequired;
  }
}

function canCompareExpiry(
  openedAt: string | null,
  expiresAt: string | null,
): boolean {
  return (
    typeof openedAt === "string" &&
    typeof expiresAt === "string" &&
    isValidDateString(expiresAt)
  );
}

function validationCodeForIssue(
  issue: z.ZodIssue,
): ShelfFormValidationCode | undefined {
  const path = issue.path.join(".") as ValidationFieldPath;
  if (path === "identity.sizeMl") {
    return issue.message === VALIDATION_MESSAGE.sizeRequired
      ? ShelfFormValidationCode.SizeRequired
      : ShelfFormValidationCode.SizeInvalid;
  }

  if (path === "guidance.steps") {
    return ShelfFormValidationCode.GuidanceStepsRequired;
  }

  return VALIDATION_CODE_BY_FIELD[path];
}
