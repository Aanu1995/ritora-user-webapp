import { buildTemplateGuidance } from './add-product/category-templates';
import {
  createDefaultIntroductionStatus,
  createEmptyIdentity,
  createEmptyManufacturer,
  createEmptyUserFields,
} from '@/lib/shelf-form';
import type { SubmissionValidationResult } from '@/lib/form-submission';
import type {
  ProductFormValue,
} from '@/components/shelf/product-form-body';
import type {
  ShelfFormFieldName,
} from '@/lib/shelf-form';
import type { ShelfProductDraft } from '@/types/shelf';

export function buildAddProductDefaultValues(): ProductFormValue {
  const identity = createEmptyIdentity();

  return {
    identity,
    manufacturer: createEmptyManufacturer(),
    guidance: buildTemplateGuidance(identity.category, [], []),
    userFields: createEmptyUserFields(),
    introductionStatus: createDefaultIntroductionStatus(),
  };
}

export function hasLookupValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

export function mergeLookupValues<T extends object>(
  current: T,
  resolved: Partial<T>,
): T {
  const next = { ...current };

  for (const key of Object.keys(resolved) as Array<keyof T>) {
    const value = resolved[key];

    if (hasLookupValue(value)) {
      next[key] = value as T[typeof key];
    }
  }

  return next;
}

export function stripIdentityImageUrls<T extends { imageUrls?: string[] }>(
  identity: T,
): Omit<T, 'imageUrls'> {
  const next = { ...identity };
  delete next.imageUrls;

  return next;
}

export function stripDraftImageUrls(
  draft: ShelfProductDraft,
): ShelfProductDraft {
  return {
    ...draft,
    identity: {
      ...draft.identity,
      imageUrls: [],
    },
  };
}

export function firstSubmitErrorMessage(
  error: SubmissionValidationResult<ShelfFormFieldName>,
): string | undefined {
  if (error.form) {
    return error.form;
  }

  return Object.values(error.fields).find(
    (message): message is string =>
      typeof message === 'string' && message.length > 0,
  );
}
