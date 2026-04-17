'use client';

import { useForm } from '@tanstack/react-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { QuickLookupCard } from './add-product/quick-lookup-card';
import { buildTemplateGuidance } from './add-product/category-templates';
import { ProductFormBody, type ProductFormValue } from './product-form-body';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useCreateProduct } from '@/hooks/use-shelf';
import { type FieldIssue, firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import {
  createEmptyIdentity,
  createEmptyManufacturer,
  createEmptyUserFields,
  getShelfGuidanceValidationErrors,
  type ShelfFormFieldErrors,
  shelfProductFormSchema,
  toShelfProductDraft,
} from '@/lib/shelf-form';
import { getShelfSubmitError } from '@/lib/shelf-submit-errors';
import {
  type ApplicationGuidance,
  type CatalogueIdentity,
  DataProvenance,
  type ManufacturerInfo,
  type ShelfProductPartial,
} from '@/types/shelf';

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

function buildDefaultValues(): ProductFormValue {
  const identity = createEmptyIdentity();

  return {
    identity,
    manufacturer: createEmptyManufacturer(),
    guidance: buildTemplateGuidance(identity.category, [], []),
    userFields: createEmptyUserFields(),
  };
}

function getIdentitySourceLabel(
  provenance: DataProvenance,
  translate: (key: string) => string,
): string {
  if (provenance === DataProvenance.UrlFetch) {
    return translate('confirm.fromUrl');
  }

  return translate('confirm.fromSource');
}

export function AddProductPage() {
  const t = useTranslations('shelf');
  const tDialog = useTranslations('shelf.dialog');
  const router = useRouter();
  const createProduct = useCreateProduct();
  const createdProductIdRef = useRef<string | null>(null);
  const [provenance, setProvenance] = useState<DataProvenance>(
    DataProvenance.UserEntered,
  );
  const [identitySource, setIdentitySource] = useState<string | null>(null);

  const form = useForm({
    defaultValues: buildDefaultValues(),
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: shelfProductFormSchema,
      onSubmit: shelfProductFormSchema,
      onSubmitAsync: async ({ value }) => {
        createdProductIdRef.current = null;

        const result = await executeMutation(
          createProduct.mutate,
          toShelfProductDraft(value, provenance),
        );

        if (result.error !== null) {
          return getShelfSubmitError(result.error, t);
        }

        createdProductIdRef.current = result.data.id;
        return undefined;
      },
    },
    onSubmit: () => {
      if (!createdProductIdRef.current) {
        return;
      }

      toast.success(tDialog('confirm.successToast'));
      router.push(`${AppRoute.Shelf}/${createdProductIdRef.current}`);
    },
  });

  const handleLookupResult = (
    partial: ShelfProductPartial,
    nextProvenance: DataProvenance,
  ) => {
    const nextIdentity: CatalogueIdentity = {
      ...form.getFieldValue('identity'),
      ...(partial.identity ?? {}),
    };
    const nextManufacturer: ManufacturerInfo = {
      ...form.getFieldValue('manufacturer'),
      ...(partial.manufacturer ?? {}),
    };
    const currentGuidance = form.getFieldValue('guidance');
    const nextGuidance: ApplicationGuidance =
      partial.guidance != null
        ? { ...currentGuidance, ...partial.guidance }
        : currentGuidance.steps.length > 0
          ? currentGuidance
          : buildTemplateGuidance(nextIdentity.category, [], []);

    form.setFieldValue('identity', nextIdentity);
    form.setFieldValue('manufacturer', nextManufacturer);
    form.setFieldValue('guidance', nextGuidance);
    setProvenance(nextProvenance);
    setIdentitySource(getIdentitySourceLabel(nextProvenance, tDialog));
  };

  const buildFieldErrors = (
    fieldMeta: ShelfFieldMeta,
  ): ShelfFormFieldErrors => ({
    'identity.brand': getFieldError(fieldMeta, 'identity.brand', t),
    'identity.name': getFieldError(fieldMeta, 'identity.name', t),
    'identity.description': getFieldError(
      fieldMeta,
      'identity.description',
      t,
    ),
    'identity.benefits': getFieldError(fieldMeta, 'identity.benefits', t),
    'identity.suitedFor': getFieldError(fieldMeta, 'identity.suitedFor', t),
    'identity.inciIngredients': getFieldError(
      fieldMeta,
      'identity.inciIngredients',
      t,
    ),
    'identity.sizeMl': getFieldError(fieldMeta, 'identity.sizeMl', t),
    'userFields.openedAt': getFieldError(fieldMeta, 'userFields.openedAt', t),
    'userFields.pricePaid': getFieldError(fieldMeta, 'userFields.pricePaid', t),
    'userFields.expiresAt': getFieldError(fieldMeta, 'userFields.expiresAt', t),
    'manufacturer.supportEmail': getFieldError(
      fieldMeta,
      'manufacturer.supportEmail',
      t,
    ),
    'manufacturer.productUrl': getFieldError(
      fieldMeta,
      'manufacturer.productUrl',
      t,
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
              t,
            ),
            cautions: firstFieldError(
              rawGuidanceErrors.cautions ? [rawGuidanceErrors.cautions] : [],
              t,
            ),
          };
          const formError = readSubmissionErrorMessage(submitError);

          return (
            <>
              <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center gap-3">
                  <Link
                    href={AppRoute.Shelf}
                    aria-label={t('detail.backLink')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {tDialog('title')}
                    </h1>
                    <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                      {tDialog('subtitle')}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Button type="submit" size="sm" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <LoadingIndicator label={tDialog('confirm.submitting')} />
                      ) : (
                        tDialog('confirm.submit')
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-6">
                <QuickLookupCard onResult={handleLookupResult} />

                {formError ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
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
                  identitySourceLabel={identitySource ?? undefined}
                />
              </div>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
