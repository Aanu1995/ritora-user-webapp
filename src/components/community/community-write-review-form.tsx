"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { QueryKey } from "@/constants/query-keys";
import { useShelfProducts } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import { createCommunityReview } from "@/services/community.service";
import type { CreateCommunityReviewInput } from "@/types/community";
import { ShelfCategoryFilter, ShelfSort, ShelfStatFilter } from "@/types/shelf";
import {
  communityReviewFormSchema,
  defaultCommunityReviewValues,
  type CommunityReviewFormValues,
} from "./community-form-schemas";
import { reviewFormToInput } from "./community-form-payloads";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  CommunityReviewProductFieldGroup,
  type CommunityReviewFormFieldRenderer,
  type CommunityReviewProductFieldGroupProps,
} from "./community-review-product-field-group";
import {
  CommunityDisclosureSelect,
  CommunityEditabilityNotice,
  CommunityFieldError,
  CommunitySelectField,
  CommunityTextareaField,
  Field,
  FormGrid,
  FormSection,
  InlineSpinner,
} from "./community-shared";
import {
  ratingOptions,
  type ReviewSelectFieldName,
  type ReviewTextFieldName,
  type SelectOption,
} from "./community-review-form-utils";

const communityShelfFilters = {
  category: ShelfCategoryFilter.All,
  search: "",
  sort: ShelfSort.Alphabetical,
  stat: ShelfStatFilter.All,
};

type ProductFieldGroupConfig = Omit<
  CommunityReviewProductFieldGroupProps,
  "fieldRenderer" | "isLoadingProducts" | "products"
>;

type CommunityReviewMutationResult = { moderationStatus: string };

type WriteReviewFormProps = {
  defaultValues?: CommunityReviewFormValues;
  /**
   * "create" (default) shows the pre-submit editability notice and routes
   * the submit click through a confirmation dialog. "edit" skips both —
   * the parent edit form already gives the user context.
   */
  kind?: "create" | "edit";
  mutationFn?: (
    input: CreateCommunityReviewInput,
  ) => Promise<CommunityReviewMutationResult>;
  onSaved?: () => void;
  resetOnSuccess?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: (review: CommunityReviewMutationResult) => string;
};

export function WriteReviewForm(props: WriteReviewFormProps = {}) {
  const tShare = useTranslations("community.share");
  const tToast = useTranslations("community.toasts");
  const tConfirm = useTranslations("community.confirm");
  const tForm = useTranslations("community.forms.review");
  const {
    defaultValues = defaultCommunityReviewValues,
    kind = "create",
    mutationFn = createCommunityReview,
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
  const shelfProducts = useShelfProducts(communityShelfFilters, dateContext);
  const mutation = useMutation({
    mutationFn,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      toast.success(
        successMessage?.(result) ??
          (result.moderationStatus === "published"
            ? tToast("reviewPublished")
            : tToast("reviewModerating")),
      );
      onSaved?.();
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
            form:
              getApiErrorMessage(result.error) ??
              tForm("submitFailed"),
            fields: {},
          };
        }

        if (resetOnSuccess) formApi.reset();
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
  const productFieldGroup = ({
    ...config
  }: ProductFieldGroupConfig) => (
    <CommunityReviewProductFieldGroup
      fieldRenderer={form.Field as CommunityReviewFormFieldRenderer}
      isLoadingProducts={shelfProducts.isLoading}
      products={shelfProducts.data}
      {...config}
    />
  );

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
          {productFieldGroup({
            brandHint: tForm("pairedBrandHint"),
            brandName: "contextProductBrand",
            brandPlaceholder: tForm("pairedBrandPlaceholder"),
            brandRequired: false,
            categoryHint: tForm("pairedCategoryHint"),
            categoryName: "contextCategory",
            categoryLabel: tForm("pairedCategoryLabel"),
            linkedMessage: tForm("pairedLinkedMessage"),
            manualHeading: tForm("pairedManualHeading"),
            nameName: "contextProductName",
            productHint: tForm("pairedProductHint"),
            productLabel: tForm("pairedProductLabel"),
            productPlaceholder: tForm("pairedProductPlaceholder"),
            selectedName: "selectedContextShelfProductId",
            selectHint: tForm("pairedSelectHint"),
            selectLabel: tForm("pairedSelectLabel"),
          })}
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
        {(submitError) => {
          const message = readSubmissionErrorMessage(submitError);
          return message ? (
            <p
              className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {message}
            </p>
          ) : null;
        }}
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
            <>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  type="submit"
                  disabled={!canSubmit || busy}
                >
                  {busy ? <InlineSpinner /> : <Check className="h-4 w-4" />}
                  {busy ? submittingLabel : submitLabel}
                </Button>
              </div>
              {needsConfirm ? (
                <ConfirmDialog
                  open={confirmOpen}
                  onOpenChange={setConfirmOpen}
                  title={tConfirm("reviewTitle")}
                  description={tConfirm("reviewBody")}
                  confirmLabel={submitLabel}
                  cancelLabel={tConfirm("keepEditing")}
                  onConfirm={handleConfirmedSubmit}
                  isPending={busy}
                  tone={ConfirmDialogTone.Warning}
                />
              ) : null}
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
