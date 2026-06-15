"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { QuickLookupCard } from "./add-product/quick-lookup-card";
import { buildTemplateGuidance } from "./add-product/category-templates";
import {
  buildLookupReviewFields,
  normalizeLookupCountryValue,
} from "./add-product/lookup-result-import";
import {
  buildAddProductDefaultValues,
  firstSubmitErrorMessage,
  hasLookupValue,
  mergeLookupValues,
  stripDraftImageUrls,
  stripIdentityImageUrls,
} from "./add-product-page.utils";
import {
  ProductFormBody,
  type ProductFormReviewFields,
  type ProductFormValue,
} from "./product-form-body";
import { ProductPageHeader } from "./product-page-header";
import {
  buildShelfFieldErrors,
  type ShelfFieldMeta,
} from "./form/product-form-errors";
import { GuardedLink } from "@/components/app/guarded-link";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AppRoute } from "@/constants/app-routes";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useCreateProduct, useCreateProductWithImage } from "@/hooks/use-shelf";
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";
import { firstFieldError } from "@/lib/form-errors";
import {
  clearSubmitErrors,
  executeMutation,
} from "@/lib/form-submission";
import {
  navigateAfterShelfSave,
  readShelfReturnTo,
} from "@/lib/shelf-return-navigation";
import {
  getShelfGuidanceValidationErrors,
  shelfProductFormSchema,
  toShelfProductDraft,
} from "@/lib/shelf-form";
import { getShelfSubmitError } from "@/lib/shelf-submit-errors";
import {
  LookupConfidence,
  ProductIntroductionStatus,
  type ResolvedLookup,
} from "@/types/shelf";

export function AddProductPage() {
  const t = useTranslations("shelf");
  const tDialog = useTranslations("shelf.dialog");
  const tLookupImport = useTranslations("shelf.dialog.lookupImport");
  const tLookupReview = useTranslations("shelf.dialog.lookupReview");
  const router = useRouter();
  const pathname = usePathname() ?? `${AppRoute.Shelf}/new`;
  const searchParams = useSearchParams();
  const returnToHref = readShelfReturnTo(searchParams, pathname);
  const backHref = returnToHref ?? AppRoute.Shelf;
  const createProduct = useCreateProduct();
  const createProductWithImage = useCreateProductWithImage();
  const capabilities = useUserCapabilities();
  const isLookupDisabled =
    isCapabilityDisabled(capabilities.imageUpload) ||
    isCapabilityDisabled(capabilities.productExtraction) ||
    isCapabilityDisabled(capabilities.aiGeneration);
  const createdProductIdRef = useRef<string | null>(null);
  const hasPhotoExtractionRef = useRef(false);
  const [reviewFields, setReviewFields] = useState<ProductFormReviewFields>({});
  const [isSaved, setIsSaved] = useState(false);
  const [productPhotoFile, setProductPhotoFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: buildAddProductDefaultValues(),
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

        if (!hasPhotoExtractionRef.current) {
          const message = tLookupImport("requiredError");
          toast.error(message);
          return message;
        }

        const draft = stripDraftImageUrls(toShelfProductDraft(value));
        if (isLookupDisabled) {
          return undefined;
        }

        const result = productPhotoFile
          ? await executeMutation(createProductWithImage.mutate, {
              draft,
              file: productPhotoFile,
            })
          : await executeMutation(createProduct.mutate, draft);

        if (result.error !== null) {
          const submitError = getShelfSubmitError(result.error, t);
          toast.error(
            firstSubmitErrorMessage(submitError) ?? t("dialog.genericError"),
          );
          return submitError;
        }

        createdProductIdRef.current = result.data.id;
        return undefined;
      },
    },
    onSubmit: () => {
      if (!createdProductIdRef.current) {
        return;
      }

      toast.success(tDialog("confirm.successToast"));
      setIsSaved(true);
      navigateAfterShelfSave({
        router,
        releaseGuard,
        fallbackHref: AppRoute.Shelf,
        returnToHref,
      });
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const hasUnsavedChanges = isFormDirty && !isSaved;

  const { releaseGuard } = useUnsavedChangesGuard({ hasUnsavedChanges });

  const leading = (
    <GuardedLink
      href={backHref}
      restoreScrollTo={backHref}
      aria-label={t("detail.backLink")}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-accent-soft"
    >
      <ArrowLeft className="h-4 w-4" />
    </GuardedLink>
  );

  const setIdentityValue = (nextIdentity: ProductFormValue["identity"]) => {
    clearSubmitErrors(form);
    form.setFieldValue("identity", nextIdentity);
    form.setFieldValue("identity.brand", nextIdentity.brand);
    form.setFieldValue("identity.name", nextIdentity.name);
    form.setFieldValue("identity.category", nextIdentity.category);
    form.setFieldValue("identity.description", nextIdentity.description);
    form.setFieldValue("identity.benefits", nextIdentity.benefits);
    form.setFieldValue("identity.suitedFor", nextIdentity.suitedFor);
    form.setFieldValue(
      "identity.inciIngredients",
      nextIdentity.inciIngredients,
    );
    form.setFieldValue("identity.sizeMl", nextIdentity.sizeMl);
  };

  const setManufacturerValue = (
    nextManufacturer: ProductFormValue["manufacturer"],
  ) => {
    clearSubmitErrors(form);
    form.setFieldValue("manufacturer", nextManufacturer);
  };

  const setUserFieldsValue = (
    nextUserFields: ProductFormValue["userFields"],
  ) => {
    clearSubmitErrors(form);
    form.setFieldValue("userFields", nextUserFields);
  };

  const setGuidanceValue = (nextGuidance: ProductFormValue["guidance"]) => {
    clearSubmitErrors(form);
    form.setFieldValue("guidance", nextGuidance);
    form.setFieldValue("guidance.steps", nextGuidance.steps);
    form.setFieldValue("guidance.cautions", nextGuidance.cautions);
  };

  const setIntroductionStatusValue = (
    nextStatus: ProductIntroductionStatus,
  ) => {
    clearSubmitErrors(form);
    form.setFieldValue("introductionStatus", nextStatus);
  };

  const handleLookupResult = (resolved: ResolvedLookup) => {
    if (resolved.confidence === LookupConfidence.Low) {
      setReviewFields({});
      hasPhotoExtractionRef.current = false;
      toast.error(tLookupReview("lowConfidenceError"));
      return;
    }

    const resolvedIdentity = stripIdentityImageUrls(resolved.identity ?? {});
    const resolvedManufacturer = resolved.manufacturer ?? {};
    const resolvedGuidance = resolved.guidance ?? {};
    const nextIdentity = mergeLookupValues(
      form.getFieldValue("identity"),
      resolvedIdentity,
    );
    const mergedManufacturer = mergeLookupValues(
      form.getFieldValue("manufacturer"),
      resolvedManufacturer,
    );
    const nextManufacturer = {
      ...mergedManufacturer,
      countryOfOrigin: normalizeLookupCountryValue(
        resolvedManufacturer.countryOfOrigin ??
          resolvedManufacturer.countryOfManufacture ??
          mergedManufacturer.countryOfOrigin,
      ),
      countryOfManufacture: normalizeLookupCountryValue(
        resolvedManufacturer.countryOfManufacture ??
          resolvedManufacturer.countryOfOrigin ??
          mergedManufacturer.countryOfManufacture,
      ),
    };
    const currentGuidance = form.getFieldValue("guidance");
    const hasResolvedGuidance =
      Object.values(resolvedGuidance).some(hasLookupValue);
    const nextGuidance = hasResolvedGuidance
      ? mergeLookupValues(currentGuidance, resolvedGuidance)
      : currentGuidance.steps.length > 0
        ? currentGuidance
        : buildTemplateGuidance(nextIdentity.category, [], []);

    setIdentityValue(nextIdentity);
    setManufacturerValue(nextManufacturer);
    setGuidanceValue(nextGuidance);
    hasPhotoExtractionRef.current = true;
    const nextReviewFields = buildLookupReviewFields(resolved);

    setReviewFields(nextReviewFields);
    toast.success(tLookupImport("title"), {
      description:
        Object.keys(nextReviewFields).length > 0
          ? tLookupImport("reviewDescription")
          : tLookupImport("description"),
    });
  };

  const handlePhotosChange = () => {
    hasPhotoExtractionRef.current = false;
    setReviewFields({});
    clearSubmitErrors(form);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isLookupDisabled) {
          return;
        }
        void form.handleSubmit();
      }}
      noValidate
      className="relative"
    >
      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          fieldMeta: state.fieldMeta as ShelfFieldMeta,
          isSubmitting: state.isSubmitting,
          submissionAttempts: state.submissionAttempts,
        })}
      >
        {({ values, fieldMeta, isSubmitting, submissionAttempts }) => {
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
          return (
            <>
              <ProductPageHeader
                leading={leading}
                title={tDialog("title")}
                subtitle={tDialog("subtitle")}
                actions={
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || isLookupDisabled}
                  >
                    {isSubmitting ? (
                      <LoadingIndicator label={tDialog("confirm.submitting")} />
                    ) : (
                      tDialog("confirm.submit")
                    )}
                  </Button>
                }
              />

              <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-6">
                <QuickLookupCard
                  disabled={isLookupDisabled}
                  onPhotosChange={handlePhotosChange}
                  onProductPhotoChange={setProductPhotoFile}
                  onResult={handleLookupResult}
                />

                <ProductFormBody
                  value={values}
                  onIdentityChange={setIdentityValue}
                  onManufacturerChange={setManufacturerValue}
                  onUserFieldsChange={setUserFieldsValue}
                  onGuidanceChange={setGuidanceValue}
                  onIntroductionStatusChange={setIntroductionStatusValue}
                  fieldErrors={fieldErrors}
                  guidanceErrors={guidanceErrors}
                  reviewFields={reviewFields}
                  showIntroductionStatus
                />
              </div>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
