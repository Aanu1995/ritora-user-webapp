'use client';

import { useForm, useStore } from '@tanstack/react-form';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductFormBody, type ProductFormValue } from '../product-form-body';
import { GuardedLink } from '@/components/app/guarded-link';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useFilePreviewSelection } from '@/hooks/use-file-preview-selection';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { useUpdateProduct, useUploadProductImage } from '@/hooks/use-shelf';
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

function getDefaultValues(product: ShelfProduct): ProductFormValue {
  return {
    identity: product.identity,
    guidance: product.guidance,
    manufacturer: product.manufacturer,
    userFields: product.userFields,
  };
}

const FIELD_ERROR_KEYS: ReadonlyArray<keyof ShelfFormFieldErrors> = [
  'identity.brand',
  'identity.name',
  'identity.description',
  'identity.benefits',
  'identity.suitedFor',
  'identity.inciIngredients',
  'identity.sizeMl',
  'userFields.pricePaid',
  'userFields.expiresAt',
  'manufacturer.supportEmail',
  'manufacturer.productUrl',
];

function withUploadedImageUrl<T extends { identity: { imageUrls: string[] } }>(
  value: T,
  imageUrl: string,
): T {
  return {
    ...value,
    identity: {
      ...value.identity,
      imageUrls: [imageUrl],
    },
  };
}

function withIdentityImageUrl<T extends { imageUrls: string[] }>(
  value: T,
  imageUrl: string,
): T {
  return {
    ...value,
    imageUrls: [imageUrl],
  };
}

export function ProductEditForm({ product }: Props) {
  const t = useTranslations('shelf.edit');
  const tDetail = useTranslations('shelf.detail');
  const tShelf = useTranslations('shelf');
  const router = useRouter();
  const updateProduct = useUpdateProduct();
  const uploadProductImage = useUploadProductImage();
  const [isSaved, setIsSaved] = useState(false);
  const {
    selectedFile: selectedPhotoFile,
    previewUrl: selectedPhotoPreviewUrl,
    hasSelection: hasSelectedPhoto,
    selectFile: handlePhotoSelection,
    clearSelection: clearSelectedPhoto,
  } = useFilePreviewSelection();

  const form = useForm({
    defaultValues: getDefaultValues(product),
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onBlur: shelfProductFormSchema,
      onSubmit: shelfProductFormSchema,
      onSubmitAsync: async ({ value }) => {
        let normalized = normalizeShelfProductForm(value);

        try {
          const uploadedImageUrl = await uploadPendingPhoto();
          if (uploadedImageUrl) {
            normalized = withUploadedImageUrl(normalized, uploadedImageUrl);
          }
        } catch {
          return t('photo.uploadFailed');
        }

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
      setIsSaved(true);
      releaseGuard();
      router.push(`${AppRoute.Shelf}/${product.id}`);
    },
  });

  const setUploadedPhoto = (imageUrl: string) => {
    form.setFieldValue('identity', (previous) =>
      withIdentityImageUrl(previous, imageUrl),
    );
  };

  const uploadPendingPhoto = async (): Promise<string | null> => {
    if (!selectedPhotoFile) {
      return null;
    }

    const uploaded = await uploadProductImage.mutateAsync(selectedPhotoFile);
    setUploadedPhoto(uploaded.imageUrl);
    clearSelectedPhoto();
    return uploaded.imageUrl;
  };

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const hasUnsavedChanges = (isFormDirty || hasSelectedPhoto) && !isSaved;

  const { releaseGuard } = useUnsavedChangesGuard({ hasUnsavedChanges });

  const uploadSelectedPhoto = async () => {
    if (!hasSelectedPhoto) {
      return;
    }

    try {
      await uploadPendingPhoto();
      toast.success(t('photo.uploadSuccess'));
    } catch {
      toast.error(t('photo.uploadFailed'));
    }
  };

  const buildFieldErrors = (
    fieldMeta: ShelfFieldMeta,
    showAllErrors: boolean,
  ): ShelfFormFieldErrors =>
    Object.fromEntries(
      FIELD_ERROR_KEYS.map((field) => [
        field,
        getFieldError(fieldMeta, field, tShelf, showAllErrors),
      ]),
    ) as ShelfFormFieldErrors;

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
              tShelf,
            ),
            cautions: firstFieldError(
              showAllErrors && rawGuidanceErrors.cautions
                ? [rawGuidanceErrors.cautions]
                : [],
              tShelf,
            ),
          };
          const formError = readSubmissionErrorMessage(submitError);

          return (
            <>
              <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center gap-3">
                  <GuardedLink
                    href={`${AppRoute.Shelf}/${product.id}`}
                    aria-label={tDetail('backLink')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </GuardedLink>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {t('title')}
                    </h1>
                    <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                      {product.identity.brand} · {product.identity.name}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting || uploadProductImage.isPending}
                    >
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
                  photoUpload={{
                    previewUrl: selectedPhotoPreviewUrl,
                    isPendingSelection: Boolean(selectedPhotoFile),
                    isUploading: uploadProductImage.isPending,
                    onSelectFile: handlePhotoSelection,
                    onUpload: () => {
                      void uploadSelectedPhoto();
                    },
                    onClearSelection: clearSelectedPhoto,
                    text: {
                      chooseLabel: t('photo.choose'),
                      replaceLabel: t('photo.replace'),
                      chooseDifferentLabel: t('photo.chooseDifferent'),
                      uploadLabel: t('photo.upload'),
                      uploadingLabel: t('photo.uploading'),
                      clearLabel: t('photo.clear'),
                      inputLabel: t('photo.inputLabel'),
                      helperText: t('photo.helper'),
                      emptyHint: t('photo.emptyHint'),
                      selectedHint: t('photo.selectedHint'),
                      uploadedHint: t('photo.uploadedHint'),
                    },
                  }}
                />
              </div>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
