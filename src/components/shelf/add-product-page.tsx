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
  ProductFormBody,
  type ProductFormReviewFields,
  type ProductFormValue,
} from './product-form-body';
import { GuardedLink } from '@/components/app/guarded-link';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { COUNTRIES } from '@/constants/countries';
import { AppRoute } from '@/constants/app-routes';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
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
  DataProvenance,
  LookupConfidence,
  LookupWarningCode,
  type ResolvedLookup,
} from '@/types/shelf';

type ShelfFieldMeta = Partial<
  Record<
    string,
    {
      errors?: ReadonlyArray<FieldIssue>;
      isTouched?: boolean;
      isDirty?: boolean;
    }
  >
>;

function shouldShowFieldError(
  meta: ShelfFieldMeta[string] | undefined,
  showAllErrors: boolean,
): boolean {
  if (showAllErrors) {
    return true;
  }

  return Boolean(meta?.isTouched || meta?.isDirty);
}

function getFieldError(
  fieldMeta: ShelfFieldMeta,
  field: string,
  translate: (key: string) => string,
  showAllErrors: boolean,
): string | undefined {
  if (!shouldShowFieldError(fieldMeta[field], showAllErrors)) {
    return undefined;
  }

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

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

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

function normalizeCountryValue(
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

function buildReviewFields(
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
  const [reviewFields, setReviewFields] = useState<ProductFormReviewFields>(
    {},
  );
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    defaultValues: buildDefaultValues(),
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

  const clearLookupDraft = () => {
    form.reset(buildDefaultValues());
    setProvenance(DataProvenance.UserEntered);
    setReviewFields({});
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
      countryOfOrigin: normalizeCountryValue(
        resolvedManufacturer.countryOfOrigin ??
          resolvedManufacturer.countryOfManufacture ??
          form.getFieldValue('manufacturer').countryOfOrigin,
      ),
      countryOfManufacture: normalizeCountryValue(
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

    form.setFieldValue('identity', nextIdentity);
    form.setFieldValue('manufacturer', nextManufacturer);
    form.setFieldValue('guidance', nextGuidance);
    setProvenance(resolved.provenance);
    const nextReviewFields = buildReviewFields(resolved);

    setReviewFields(nextReviewFields);
    toast.success(tLookupImport('title'), {
      description:
        Object.keys(nextReviewFields).length > 0
          ? tLookupImport('reviewDescription')
          : tLookupImport('description'),
    });
  };

  const buildFieldErrors = (
    fieldMeta: ShelfFieldMeta,
    showAllErrors: boolean,
  ): ShelfFormFieldErrors => ({
    'identity.brand': getFieldError(
      fieldMeta,
      'identity.brand',
      t,
      showAllErrors,
    ),
    'identity.name': getFieldError(fieldMeta, 'identity.name', t, showAllErrors),
    'identity.description': getFieldError(
      fieldMeta,
      'identity.description',
      t,
      showAllErrors,
    ),
    'identity.benefits': getFieldError(
      fieldMeta,
      'identity.benefits',
      t,
      showAllErrors,
    ),
    'identity.suitedFor': getFieldError(
      fieldMeta,
      'identity.suitedFor',
      t,
      showAllErrors,
    ),
    'identity.inciIngredients': getFieldError(
      fieldMeta,
      'identity.inciIngredients',
      t,
      showAllErrors,
    ),
    'identity.sizeMl': getFieldError(
      fieldMeta,
      'identity.sizeMl',
      t,
      showAllErrors,
    ),
    'userFields.pricePaid': getFieldError(
      fieldMeta,
      'userFields.pricePaid',
      t,
      showAllErrors,
    ),
    'userFields.expiresAt': getFieldError(
      fieldMeta,
      'userFields.expiresAt',
      t,
      showAllErrors,
    ),
    'manufacturer.supportEmail': getFieldError(
      fieldMeta,
      'manufacturer.supportEmail',
      t,
      showAllErrors,
    ),
    'manufacturer.productUrl': getFieldError(
      fieldMeta,
      'manufacturer.productUrl',
      t,
      showAllErrors,
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
          const fieldErrors = buildFieldErrors(fieldMeta, showAllErrors);
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
                        <LoadingIndicator label={tDialog('confirm.submitting')} />
                      ) : (
                        tDialog('confirm.submit')
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-6">
                <QuickLookupCard
                  onResult={handleLookupResult}
                  onSearchStart={clearLookupDraft}
                />

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
