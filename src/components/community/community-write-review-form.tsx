"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { QueryKey } from "@/constants/query-keys";
import { useAllShelfProducts } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import { getApiErrorMessage } from "@/lib/api-error";
import { executeMutation } from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import { createCommunityReview } from "@/services/community.service";
import {
  communityReviewFormSchema,
  defaultCommunityReviewValues,
} from "./community-form-schemas";
import { reviewFormToInput } from "./community-form-payloads";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  CommunityReviewProductFieldGroup,
  type CommunityReviewFormFieldRenderer,
} from "./community-review-product-field-group";
import { CommunityReviewContextProductsField } from "./community-review-context-products-field";
import {
  CommunityDisclosureSelect,
  CommunityEditabilityNotice,
  CommunityFieldError,
  CommunitySelectField,
  CommunityTextareaField,
  Field,
  FormGrid,
  FormSection,
} from "./community-shared";
import {
  CommunityReviewSubmitControls,
  CommunityReviewSubmitError,
} from "./community-review-submit-controls";
import {
  communityReviewShelfFilters,
  type ProductFieldGroupConfig,
  type WriteReviewFormProps,
} from "./community-write-review-form-config";
import {
  ratingOptions,
  type ReviewSelectFieldName,
  type ReviewTextFieldName,
  type SelectOption,
} from "./community-review-form-utils";

export function WriteReviewForm(props: WriteReviewFormProps = {}) {
  const tShare = useTranslations("community.share");
  const tToast = useTranslations("community.toasts");
  const tConfirm = useTranslations("community.confirm");
  const tForm = useTranslations("community.forms.review");
  const {
    defaultValues = defaultCommunityReviewValues,
    kind = "create",
    mutationFn = createCommunityReview,
    onDirtyChange,
    onSaved,
    resetOnSuccess = true,
    submitLabel = tShare("submitReview"),
    submittingLabel = tShare("submitting"),
    successMessage,
  } = props;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const needsConfirm = kind === "create";
  const options = useCommunityTranslatedOptions();
  const queryClient = useQueryClient();
  const dateContext = useShelfDateContext();
  const shelfProducts = useAllShelfProducts(
    communityReviewShelfFilters,
    dateContext,
  );
  const mutation = useMutation({
    mutationFn,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityReviews],
      });
      toast.success(
        successMessage?.(result) ??
          (result.moderationStatus === "published"
            ? tToast("reviewPublished")
            : tToast("reviewModerating")),
      );
    },
  });
  const form = useForm({
    defaultValues,
    validators: {
      onChange: communityReviewFormSchema,
      onSubmit: communityReviewFormSchema,
      onSubmitAsync: async ({ value, formApi }) => {
        const result = await executeMutation(
          mutation.mutate,
          reviewFormToInput(value),
        );

        if (result.error !== null) {
          return {
            form: getApiErrorMessage(result.error) ?? tForm("submitFailed"),
            fields: {},
          };
        }

        if (resetOnSuccess) formApi.reset();
        onDirtyChange?.(false);
        onSaved?.();
        return undefined;
      },
    },
    onSubmit: () => undefined,
  });
  const textField = (
    name: ReviewTextFieldName,
    label: string,
    hint: string,
    placeholder?: string,
    required = true,
  ) => (
    <form.Field name={name}>
      {(field) => {
        const invalid = field.state.meta.errors.length > 0;
        return (
          <Field hint={hint} label={label} required={required}>
            <Input
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder={placeholder}
              aria-invalid={invalid}
              className={cn(
                invalid && "border-danger focus-visible:ring-danger/30",
              )}
            />
            <CommunityFieldError errors={field.state.meta.errors} />
          </Field>
        );
      }}
    </form.Field>
  );

  const selectField = (
    name: ReviewSelectFieldName,
    label: string,
    hint: string,
    options: readonly SelectOption[],
    placeholder: string,
    required = true,
  ) => (
    <form.Field name={name}>
      {(field) => (
        <CommunitySelectField
          field={field}
          hint={hint}
          label={label}
          options={options}
          placeholder={placeholder}
          required={required}
        />
      )}
    </form.Field>
  );
  const productFieldGroup = ({ ...config }: ProductFieldGroupConfig) => (
    <CommunityReviewProductFieldGroup
      fieldRenderer={form.Field as CommunityReviewFormFieldRenderer}
      isLoadingProducts={
        shelfProducts.isLoading || shelfProducts.isFetchingNextPage
      }
      products={shelfProducts.data}
      {...config}
    />
  );
  const isFormDirty = useStore(form.store, (state) => state.isDirty);

  useEffect(() => {
    onDirtyChange?.(isFormDirty);
  }, [isFormDirty, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const handleConfirmedSubmit = () => {
    setConfirmOpen(false);
    void form.handleSubmit();
  };

  return (
    <form
      className="grid gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (needsConfirm) {
          setConfirmOpen(true);
          return;
        }
        void form.handleSubmit();
      }}
      noValidate
    >
      <h2 className="sr-only">{tForm("srTitle")}</h2>

      <FormSection title={tForm("productSection")}>
        <div className="grid gap-6">
          {productFieldGroup({
            brandName: "productBrand",
            categoryName: "productCategory",
            nameName: "productName",
            selectedName: "selectedShelfProductId",
          })}
          <form.Field name="disclosureType">
            {(field) => <CommunityDisclosureSelect field={field} />}
          </form.Field>
        </div>
      </FormSection>

      <FormSection
        title={tForm("ratingsSection")}
        description={tForm("ratingsDescription")}
      >
        <FormGrid>
          {selectField(
            "overallRating",
            tForm("overallLabel"),
            tForm("overallHint"),
            ratingOptions,
            tForm("overallPlaceholder"),
          )}
          {selectField(
            "effectivenessRating",
            tForm("effectivenessLabel"),
            tForm("effectivenessHint"),
            ratingOptions,
            tForm("effectivenessPlaceholder"),
          )}
          {selectField(
            "irritationRating",
            tForm("irritationLabel"),
            tForm("irritationHint"),
            ratingOptions,
            tForm("irritationPlaceholder"),
          )}
          {selectField(
            "skinResponse",
            tForm("skinResponseLabel"),
            tForm("skinResponseHint"),
            options.reviewSkinResponses,
            tForm("skinResponsePlaceholder"),
          )}
          {selectField(
            "textureRating",
            tForm("textureLabel"),
            tForm("textureHint"),
            ratingOptions,
            tForm("optionalPlaceholder"),
            false,
          )}
          {selectField(
            "valueRating",
            tForm("valueLabel"),
            tForm("valueHint"),
            ratingOptions,
            tForm("optionalPlaceholder"),
            false,
          )}
        </FormGrid>
      </FormSection>

      <FormSection
        title={tForm("usageSection")}
        description={tForm("usageDescription")}
      >
        <FormGrid>
          {selectField(
            "usageDuration",
            tForm("usageDurationLabel"),
            tForm("usageDurationHint"),
            options.reviewUsageDurations,
            tForm("usageDurationPlaceholder"),
          )}
          {selectField(
            "frequency",
            tForm("frequencyLabel"),
            tForm("frequencyHint"),
            options.reviewFrequencies,
            tForm("frequencyPlaceholder"),
          )}
          {selectField(
            "routineSlot",
            tForm("routineSlotLabel"),
            tForm("routineSlotHint"),
            options.reviewRoutineSlots,
            tForm("routineSlotPlaceholder"),
          )}
          {selectField(
            "repurchase",
            tForm("repurchaseLabel"),
            tForm("repurchaseHint"),
            options.reviewRepurchases,
            tForm("repurchasePlaceholder"),
          )}
        </FormGrid>
      </FormSection>

      <FormSection
        title={tForm("pairedSection")}
        description={tForm("pairedDescription")}
      >
        <div className="grid gap-6">
          <form.Field name="routineContextUsage">
            {(routineContextUsageField) => (
              <form.Field name="routineContext">
                {(routineContextField) => (
                  <CommunityReviewContextProductsField
                    contextErrors={routineContextField.state.meta.errors}
                    contextUsageErrors={
                      routineContextUsageField.state.meta.errors
                    }
                    contextUsageValue={routineContextUsageField.state.value}
                    isLoadingProducts={
                      shelfProducts.isLoading || shelfProducts.isFetchingNextPage
                    }
                    onContextChange={routineContextField.handleChange}
                    onContextUsageChange={routineContextUsageField.handleChange}
                    products={shelfProducts.data}
                    value={routineContextField.state.value}
                  />
                )}
              </form.Field>
            )}
          </form.Field>
          {textField(
            "outcomes",
            tForm("outcomesLabel"),
            tForm("outcomesHint"),
            tForm("outcomesPlaceholder"),
          )}
        </div>
      </FormSection>

      <FormSection
        title={tForm("bodySection")}
        description={tForm("bodyDescription")}
      >
        <form.Field name="body">
          {(field) => (
            <CommunityTextareaField
              field={field}
              hint={tForm("bodyHint")}
              label={tForm("bodyLabel")}
              placeholder={tForm("bodyPlaceholder")}
              maxLength={1200}
            />
          )}
        </form.Field>
      </FormSection>

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(submitError) => (
          <CommunityReviewSubmitError submitError={submitError} />
        )}
      </form.Subscribe>

      {needsConfirm ? <CommunityEditabilityNotice kind="review" /> : null}

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => {
          const busy = isSubmitting || mutation.isPending;
          return (
            <CommunityReviewSubmitControls
              busy={busy}
              canSubmit={canSubmit}
              cancelLabel={tConfirm("keepEditing")}
              confirmBody={tConfirm("reviewBody")}
              confirmLabel={submitLabel}
              confirmOpen={confirmOpen}
              confirmTitle={tConfirm("reviewTitle")}
              needsConfirm={needsConfirm}
              onConfirm={handleConfirmedSubmit}
              onConfirmOpenChange={setConfirmOpen}
              submitLabel={submitLabel}
              submittingLabel={submittingLabel}
            />
          );
        }}
      </form.Subscribe>
    </form>
  );
}
