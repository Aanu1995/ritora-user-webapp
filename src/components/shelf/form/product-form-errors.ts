import { firstFieldError, type FieldIssue } from '@/lib/form-errors';
import {
  getShelfFormFieldValidationErrors,
  type ShelfFormFieldErrors,
  type ShelfFormFieldName,
} from '@/lib/shelf-form';
import type { ShelfProductFormValue } from '@/types/shelf';

export type ShelfFieldMeta = Partial<
  Record<
    string,
    {
      errors?: ReadonlyArray<FieldIssue>;
      isTouched?: boolean;
      isDirty?: boolean;
    }
  >
>;

const FIELD_ERROR_KEYS: ReadonlyArray<ShelfFormFieldName> = [
  'identity.brand',
  'identity.name',
  'identity.description',
  'identity.benefits',
  'identity.suitedFor',
  'identity.sizeMl',
  'userFields.pricePaid',
  'userFields.expiresAt',
  'manufacturer.supportEmail',
  'manufacturer.productUrl',
];

type Translator = (key: string) => string;

function shouldShowFieldError(
  meta: ShelfFieldMeta[string] | undefined,
  showAllErrors: boolean,
): boolean {
  if (showAllErrors) {
    return true;
  }

  return Boolean(meta?.isTouched || meta?.isDirty);
}

function getMetaFieldError(
  fieldMeta: ShelfFieldMeta,
  field: ShelfFormFieldName,
  translate: Translator,
  showAllErrors: boolean,
): string | undefined {
  if (!shouldShowFieldError(fieldMeta[field], showAllErrors)) {
    return undefined;
  }

  return firstFieldError(fieldMeta[field]?.errors, translate);
}

function translateCurrentFieldErrors(
  value: ShelfProductFormValue,
  translate: Translator,
): ShelfFormFieldErrors {
  const currentErrors = getShelfFormFieldValidationErrors(value);

  return Object.fromEntries(
    FIELD_ERROR_KEYS.map((field) => [
      field,
      firstFieldError(
        currentErrors[field] ? [currentErrors[field]] : [],
        translate,
      ),
    ]),
  ) as ShelfFormFieldErrors;
}

export function buildShelfFieldErrors(
  fieldMeta: ShelfFieldMeta,
  value: ShelfProductFormValue,
  showAllErrors: boolean,
  translate: Translator,
): ShelfFormFieldErrors {
  if (showAllErrors) {
    return translateCurrentFieldErrors(value, translate);
  }

  return Object.fromEntries(
    FIELD_ERROR_KEYS.map((field) => [
      field,
      getMetaFieldError(fieldMeta, field, translate, showAllErrors),
    ]),
  ) as ShelfFormFieldErrors;
}
