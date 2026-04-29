'use client';

import { useForm, useStore } from '@tanstack/react-form';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductPageHeader } from '../product-page-header';
import { ProductFormBody, type ProductFormValue } from '../product-form-body';
import {
  buildShelfFieldErrors,
  type ShelfFieldMeta,
} from '../form/product-form-errors';
import { GuardedLink } from '@/components/app/guarded-link';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useFilePreviewSelection } from '@/hooks/use-file-preview-selection';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { useUpdateProduct, useUploadProductImage } from '@/hooks/use-shelf';
import { firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import {
  getShelfGuidanceValidationErrors,
  normalizeShelfProductForm,
  shelfProductFormSchema,
} from '@/lib/shelf-form';
import { getShelfSubmitError } from '@/lib/shelf-submit-errors';
import type { ShelfProduct } from '@/types/shelf';

type Props = {
  product: ShelfProduct;
};

function getDefaultValues(product: ShelfProduct): ProductFormValue {
  return {
    identity: product.identity,
    guidance: product.guidance,
    manufacturer: product.manufacturer,
    userFields: product.userFields,
  };
}

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
    clearSubmitErrors(form);
    form.setFieldValue('identity', (previous) =>
      withIdentityImageUrl(previous, imageUrl),
    );
  };

  const uploadPendingPhoto = async (): Promise<string | null> => {
    if (!selectedPhotoFile) {
      return null;
    }

    const result = await executeMutation(
      uploadProductImage.mutate,
      selectedPhotoFile,
    );

    if (result.error !== null) {
      throw result.error;
    }

    const uploaded = result.data;
    setUploadedPhoto(uploaded.imageUrl);
    clearSelectedPhoto();
    return uploaded.imageUrl;
  };

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const hasUnsavedChanges = (isFormDirty || hasSelectedPhoto) && !isSaved;

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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      noValidate
      className="relative"
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
            tShelf,
          );
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
              <ProductPageHeader
                leading={
                  <GuardedLink
                    href={`${AppRoute.Shelf}/${product.id}`}
                    restoreScrollTo={`${AppRoute.Shelf}/${product.id}`}
                    aria-label={tDetail('backLink')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </GuardedLink>
                }
                title={t('title')}
                subtitle={`${product.identity.brand} · ${product.identity.name}`}
                actions={
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
                }
              />

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
                  onIdentityChange={setIdentityValue}
                  onManufacturerChange={setManufacturerValue}
                  onUserFieldsChange={setUserFieldsValue}
                  onGuidanceChange={setGuidanceValue}
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
