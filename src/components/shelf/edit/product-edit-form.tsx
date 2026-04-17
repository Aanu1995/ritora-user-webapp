'use client';

import { useForm } from '@tanstack/react-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ProductFormBody, type ProductFormValue } from '../product-form-body';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useUpdateProduct } from '@/hooks/use-shelf';
import { type FieldIssue, firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import {
  getShelfGuidanceValidationErrors,
  normalizeShelfProductForm,
  type ShelfFormFieldErrors,
  shelfProductFormSchema,
} from '@/lib/shelf-form';
import { getShelfSubmitError } from '@/lib/shelf-submit-errors';
import type { ShelfProduct } from '@/types/shelf';

type Props = {
  product: ShelfProduct;
};

type ShelfFieldMeta = Partial<
  Record<string, { errors?: ReadonlyArray<FieldIssue> }>
>;

function getFieldError(
  fieldMeta: ShelfFieldMeta,
  field: string,
  translate: (key: string) => string,
): string | undefined {
  return firstFieldError(fieldMeta[field]?.errors, translate);
}

function getDefaultValues(product: ShelfProduct): ProductFormValue {
  return {
    identity: product.identity,
    guidance: product.guidance,
    manufacturer: product.manufacturer,
    userFields: product.userFields,
  };
}

export function ProductEditForm({ product }: Props) {
  const t = useTranslations('shelf.edit');
  const tDetail = useTranslations('shelf.detail');
  const tShelf = useTranslations('shelf');
  const router = useRouter();
  const updateProduct = useUpdateProduct();

  const form = useForm({
    defaultValues: getDefaultValues(product),
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: shelfProductFormSchema,
      onSubmit: shelfProductFormSchema,
      onSubmitAsync: async ({ value }) => {
        const normalized = normalizeShelfProductForm(value);
        const result = await executeMutation(updateProduct.mutate, {
          id: product.id,
          patch: {
            identity: normalized.identity,
            manufacturer: normalized.manufacturer,
            guidance: normalized.guidance,
            userFields: normalized.userFields,
          },
        });

        if (result.error !== null) {
          return getShelfSubmitError(result.error, tShelf);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      toast.success(t('successToast'));
      router.push(`${AppRoute.Shelf}/${product.id}`);
    },
  });

  const buildFieldErrors = (
    fieldMeta: ShelfFieldMeta,
  ): ShelfFormFieldErrors => ({
    'identity.brand': getFieldError(fieldMeta, 'identity.brand', tShelf),
    'identity.name': getFieldError(fieldMeta, 'identity.name', tShelf),
    'identity.description': getFieldError(
      fieldMeta,
      'identity.description',
      tShelf,
    ),
    'identity.benefits': getFieldError(fieldMeta, 'identity.benefits', tShelf),
    'identity.suitedFor': getFieldError(
      fieldMeta,
      'identity.suitedFor',
      tShelf,
    ),
    'identity.inciIngredients': getFieldError(
      fieldMeta,
      'identity.inciIngredients',
      tShelf,
    ),
    'identity.sizeMl': getFieldError(fieldMeta, 'identity.sizeMl', tShelf),
    'userFields.openedAt': getFieldError(
      fieldMeta,
      'userFields.openedAt',
      tShelf,
    ),
    'userFields.pricePaid': getFieldError(
      fieldMeta,
      'userFields.pricePaid',
      tShelf,
    ),
    'userFields.expiresAt': getFieldError(
      fieldMeta,
      'userFields.expiresAt',
      tShelf,
    ),
    'manufacturer.supportEmail': getFieldError(
      fieldMeta,
      'manufacturer.supportEmail',
      tShelf,
    ),
    'manufacturer.productUrl': getFieldError(
      fieldMeta,
      'manufacturer.productUrl',
      tShelf,
    ),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      noValidate
      className="relative pb-16"
    >
      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          fieldMeta: state.fieldMeta as ShelfFieldMeta,
          submitError: state.errorMap.onSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ values, fieldMeta, submitError, isSubmitting }) => {
          const fieldErrors = buildFieldErrors(fieldMeta);
          const rawGuidanceErrors = getShelfGuidanceValidationErrors(values);
          const guidanceErrors = {
            steps: firstFieldError(
              rawGuidanceErrors.steps ? [rawGuidanceErrors.steps] : [],
              tShelf,
            ),
            cautions: firstFieldError(
              rawGuidanceErrors.cautions ? [rawGuidanceErrors.cautions] : [],
              tShelf,
            ),
          };
          const formError = readSubmissionErrorMessage(submitError);

          return (
            <>
              <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center gap-3">
                  <Link
                    href={`${AppRoute.Shelf}/${product.id}`}
                    aria-label={tDetail('backLink')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {t('title')}
                    </h1>
                    <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                      {product.identity.brand} · {product.identity.name}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Button type="submit" size="sm" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <LoadingIndicator label={t('saving')} />
                      ) : (
                        <>
                          <span className="sm:hidden">{t('saveShort')}</span>
                          <span className="hidden sm:inline">{t('save')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-5xl">
                {formError ? (
                  <div
                    role="alert"
                    className="mb-4 rounded-2xl border border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
                  >
                    {formError}
                  </div>
                ) : null}

                <ProductFormBody
                  value={values}
                  onIdentityChange={(nextIdentity) =>
                    form.setFieldValue('identity', nextIdentity)
                  }
                  onManufacturerChange={(nextManufacturer) =>
                    form.setFieldValue('manufacturer', nextManufacturer)
                  }
                  onUserFieldsChange={(nextUserFields) =>
                    form.setFieldValue('userFields', nextUserFields)
                  }
                  onGuidanceChange={(nextGuidance) =>
                    form.setFieldValue('guidance', nextGuidance)
                  }
                  fieldErrors={fieldErrors}
                  guidanceErrors={guidanceErrors}
                />
              </div>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
