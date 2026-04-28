'use client';

import { useForm, useStore } from '@tanstack/react-form';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { QuickLookupCard } from './add-product/quick-lookup-card';
import { buildTemplateGuidance } from './add-product/category-templates';
import {
  buildLookupReviewFields,
  normalizeLookupCountryValue,
} from './add-product/lookup-result-import';
import {
  ProductFormBody,
  type ProductFormReviewFields,
  type ProductFormValue,
} from './product-form-body';
import {
  buildShelfFieldErrors,
  type ShelfFieldMeta,
} from './form/product-form-errors';
import { GuardedLink } from '@/components/app/guarded-link';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { useCreateProduct } from '@/hooks/use-shelf';
import { firstFieldError } from '@/lib/form-errors';
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
  shelfProductFormSchema,
  toShelfProductDraft,
} from '@/lib/shelf-form';
import { getShelfSubmitError } from '@/lib/shelf-submit-errors';
import {
  DataProvenance,
  LookupConfidence,
  type ResolvedLookup,
} from '@/types/shelf';

function buildDefaultValues(): ProductFormValue {
  const identity = createEmptyIdentity();

  return {
    identity,
    manufacturer: createEmptyManufacturer(),
    guidance: buildTemplateGuidance(identity.category, [], []),
    userFields: createEmptyUserFields(),
  };
}

export function AddProductPage() {
  const t = useTranslations('shelf');
  const tDialog = useTranslations('shelf.dialog');
  const tLookupImport = useTranslations('shelf.dialog.lookupImport');
  const tLookupReview = useTranslations('shelf.dialog.lookupReview');
  const router = useRouter();
  const createProduct = useCreateProduct();
  const createdProductIdRef = useRef<string | null>(null);
  const [provenance, setProvenance] = useState<DataProvenance>(
    DataProvenance.UserEntered,
  );
  const [reviewFields, setReviewFields] = useState<ProductFormReviewFields>({});
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    defaultValues: buildDefaultValues(),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onBlur: shelfProductFormSchema,
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
      setIsSaved(true);
      releaseGuard();
      router.push(`${AppRoute.Shelf}/${createdProductIdRef.current}`);
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const hasUnsavedChanges = isFormDirty && !isSaved;

  const { releaseGuard } = useUnsavedChangesGuard({ hasUnsavedChanges });

  const setIdentityValue = (nextIdentity: ProductFormValue['identity']) => {
    clearSubmitErrors(form);
    form.setFieldValue('identity', nextIdentity);
    form.setFieldValue('identity.brand', nextIdentity.brand);
    form.setFieldValue('identity.name', nextIdentity.name);
    form.setFieldValue('identity.category', nextIdentity.category);
    form.setFieldValue('identity.description', nextIdentity.description);
    form.setFieldValue('identity.benefits', nextIdentity.benefits);
    form.setFieldValue('identity.suitedFor', nextIdentity.suitedFor);
    form.setFieldValue(
      'identity.inciIngredients',
      nextIdentity.inciIngredients,
    );
    form.setFieldValue('identity.sizeMl', nextIdentity.sizeMl);
  };

  const setManufacturerValue = (
    nextManufacturer: ProductFormValue['manufacturer'],
  ) => {
    clearSubmitErrors(form);
    form.setFieldValue('manufacturer', nextManufacturer);
  };

  const setUserFieldsValue = (
    nextUserFields: ProductFormValue['userFields'],
  ) => {
    clearSubmitErrors(form);
    form.setFieldValue('userFields', nextUserFields);
  };

  const setGuidanceValue = (nextGuidance: ProductFormValue['guidance']) => {
    clearSubmitErrors(form);
    form.setFieldValue('guidance', nextGuidance);
    form.setFieldValue('guidance.steps', nextGuidance.steps);
    form.setFieldValue('guidance.cautions', nextGuidance.cautions);
  };

  const handleLookupResult = (resolved: ResolvedLookup) => {
    if (resolved.confidence === LookupConfidence.Low) {
      setReviewFields({});
      toast.error(tLookupReview('lowConfidenceError'));
      return;
    }

    const resolvedIdentity = resolved.identity ?? {};
    const resolvedManufacturer = resolved.manufacturer ?? {};
    const resolvedGuidance = resolved.guidance ?? {};
    const nextIdentity = {
      ...form.getFieldValue('identity'),
      ...resolvedIdentity,
    };
    const nextManufacturer = {
      ...form.getFieldValue('manufacturer'),
      ...resolvedManufacturer,
      countryOfOrigin: normalizeLookupCountryValue(
        resolvedManufacturer.countryOfOrigin ??
          resolvedManufacturer.countryOfManufacture ??
          form.getFieldValue('manufacturer').countryOfOrigin,
      ),
      countryOfManufacture: normalizeLookupCountryValue(
        resolvedManufacturer.countryOfManufacture ??
          resolvedManufacturer.countryOfOrigin ??
          form.getFieldValue('manufacturer').countryOfManufacture,
      ),
    };
    const currentGuidance = form.getFieldValue('guidance');
    const nextGuidance =
      Object.keys(resolvedGuidance).length > 0
        ? { ...currentGuidance, ...resolvedGuidance }
        : currentGuidance.steps.length > 0
          ? currentGuidance
          : buildTemplateGuidance(nextIdentity.category, [], []);

    setIdentityValue(nextIdentity);
    setManufacturerValue(nextManufacturer);
    setGuidanceValue(nextGuidance);
    setProvenance(resolved.provenance);
    const nextReviewFields = buildLookupReviewFields(resolved);

    setReviewFields(nextReviewFields);
    toast.success(tLookupImport('title'), {
      description:
        Object.keys(nextReviewFields).length > 0
          ? tLookupImport('reviewDescription')
          : tLookupImport('description'),
    });
  };

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
          submissionAttempts: state.submissionAttempts,
        })}
      >
        {({
          values,
          fieldMeta,
          submitError,
          isSubmitting,
          submissionAttempts,
        }) => {
          const showAllErrors = submissionAttempts > 0;
          const fieldErrors = buildShelfFieldErrors(
            fieldMeta,
            values,
            showAllErrors,
            t,
          );
          const rawGuidanceErrors = getShelfGuidanceValidationErrors(values);
          const guidanceErrors = {
            steps: firstFieldError(
              showAllErrors && rawGuidanceErrors.steps
                ? [rawGuidanceErrors.steps]
                : [],
              t,
            ),
            cautions: firstFieldError(
              showAllErrors && rawGuidanceErrors.cautions
                ? [rawGuidanceErrors.cautions]
                : [],
              t,
            ),
          };
          const formError = readSubmissionErrorMessage(submitError);

          return (
            <>
              <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center gap-3">
                  <GuardedLink
                    href={AppRoute.Shelf}
                    restoreScrollTo={AppRoute.Shelf}
                    aria-label={t('detail.backLink')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </GuardedLink>
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
                        <LoadingIndicator
                          label={tDialog('confirm.submitting')}
                        />
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
                  onIdentityChange={setIdentityValue}
                  onManufacturerChange={setManufacturerValue}
                  onUserFieldsChange={setUserFieldsValue}
                  onGuidanceChange={setGuidanceValue}
                  fieldErrors={fieldErrors}
                  guidanceErrors={guidanceErrors}
                  reviewFields={reviewFields}
                />
              </div>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
