"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { QueryKey } from "@/constants/query-keys";
import { useShelfProducts } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import { getApiErrorMessage } from "@/lib/api-error";
import { executeMutation } from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import { createCommunityRoutine } from "@/services/community.service";
import { CommunityCheckboxGroup } from "./community-checkbox-group";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  communityRoutineFormSchema,
  defaultCommunityRoutineValues,
} from "./community-form-schemas";
import { routineFormToInput } from "./community-form-payloads";
import {
  communityPlaybookShelfFilters,
  type PlaybookArrayFieldName,
  type PlaybookSelectFieldName,
  type PlaybookSelectOptions,
  type PlaybookTextFieldName,
  type PublishRoutineFormProps,
} from "./community-playbook-form-config";
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
import { CommunityPlaybookStepsField } from "./community-playbook-steps-field";
import {
  CommunityPlaybookSubmitControls,
  CommunityPlaybookSubmitError,
} from "./community-playbook-submit-controls";

export function PublishRoutineForm(props: PublishRoutineFormProps = {}) {
  const tShare = useTranslations("community.share");
  const tToast = useTranslations("community.toasts");
  const tConfirm = useTranslations("community.confirm");
  const tForm = useTranslations("community.forms.playbook");
  const {
    defaultValues = defaultCommunityRoutineValues,
    kind = "create",
    mutationFn = createCommunityRoutine,
    onDirtyChange,
    onSaved,
    resetOnSuccess = true,
    submitLabel = tShare("sharePlaybook"),
    submittingLabel = tShare("scanning"),
    successMessage,
  } = props;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const needsConfirm = kind === "create";
  const options = useCommunityTranslatedOptions();
  const queryClient = useQueryClient();
  const dateContext = useShelfDateContext();
  const shelfProducts = useShelfProducts(
    communityPlaybookShelfFilters,
    dateContext,
  );
  const mutation = useMutation({
    mutationFn,
    onSuccess: (routine) => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      toast.success(
        successMessage?.(routine) ??
          (routine.moderationStatus === "published"
            ? tToast("playbookPublished")
            : tToast("playbookModerating")),
      );
    },
  });
  const form = useForm({
    defaultValues,
    validators: {
      onChange: communityRoutineFormSchema,
      onSubmit: communityRoutineFormSchema,
      onSubmitAsync: async ({ value, formApi }) => {
        const result = await executeMutation(
          mutation.mutate,
          routineFormToInput(value),
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
    name: PlaybookTextFieldName,
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
    name: PlaybookSelectFieldName,
    label: string,
    hint: string,
    options: PlaybookSelectOptions,
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

  const checkGroup = (
    name: PlaybookArrayFieldName,
    label: string,
    hint: string,
    options: PlaybookSelectOptions,
    required = false,
  ) => (
    <form.Field name={name}>
      {(field) => (
        <CommunityCheckboxGroup
          errors={field.state.meta.errors}
          hint={hint}
          label={label}
          onChange={field.handleChange}
          options={options}
          required={required}
          value={field.state.value}
        />
      )}
    </form.Field>
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

      <FormSection title={tForm("goalSection")}>
        <FormGrid>
          {textField(
            "title",
            tForm("titleLabel"),
            tForm("titleHint"),
            tForm("titlePlaceholder"),
          )}
          {selectField(
            "goal",
            tForm("goalLabel"),
            tForm("goalHint"),
            options.goals,
            tForm("goalPlaceholder"),
          )}
          {selectField(
            "goalResult",
            tForm("resultLabel"),
            tForm("resultHint"),
            options.goalResults,
            tForm("resultPlaceholder"),
            false,
          )}
          {selectField(
            "timeframe",
            tForm("timeframeLabel"),
            tForm("timeframeHint"),
            options.goalTimeframes,
            tForm("timeframePlaceholder"),
          )}
        </FormGrid>
      </FormSection>

      <FormSection
        title={tForm("routineSection")}
        description={tForm("routineDescription")}
      >
        <form.Field name="steps">
          {(field) => (
            <CommunityPlaybookStepsField
              errors={field.state.meta.errors}
              isLoadingProducts={shelfProducts.isLoading}
              onChange={field.handleChange}
              products={shelfProducts.data}
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Field name="disclosureType">
          {(field) => <CommunityDisclosureSelect field={field} />}
        </form.Field>
      </FormSection>

      <FormSection
        title={tForm("changedSection")}
        description={tForm("changedDescription")}
      >
        {checkGroup(
          "avoidTags",
          tForm("avoidLabel"),
          tForm("avoidHint"),
          options.avoidTags,
        )}
        {checkGroup(
          "habitTags",
          tForm("habitLabel"),
          tForm("habitHint"),
          options.habits,
        )}
        {checkGroup(
          "didNotWorkTags",
          tForm("didNotWorkLabel"),
          tForm("didNotWorkHint"),
          options.didNotWorkTags,
        )}
        {checkGroup(
          "warningTags",
          tForm("warningLabel"),
          tForm("warningHint"),
          options.warnings,
        )}
        <form.Field name="summary">
          {(field) => (
            <CommunityTextareaField
              field={field}
              hint={tForm("summaryHint")}
              label={tForm("summaryLabel")}
              placeholder={tForm("summaryPlaceholder")}
              maxLength={500}
            />
          )}
        </form.Field>
      </FormSection>

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(submitError) => (
          <CommunityPlaybookSubmitError submitError={submitError} />
        )}
      </form.Subscribe>

      {needsConfirm ? <CommunityEditabilityNotice kind="playbook" /> : null}

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => {
          const busy = isSubmitting || mutation.isPending;
          return (
            <CommunityPlaybookSubmitControls
              busy={busy}
              canSubmit={canSubmit}
              cancelLabel={tConfirm("keepEditing")}
              confirmBody={tConfirm("playbookBody")}
              confirmLabel={submitLabel}
              confirmOpen={confirmOpen}
              confirmTitle={tConfirm("playbookTitle")}
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
