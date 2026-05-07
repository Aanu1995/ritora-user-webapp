"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { TimePicker } from "@/components/ui/time-picker";
import { useCreateSlots } from "@/hooks/use-schedule";
import { firstFieldError } from "@/lib/form-errors";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import {
  createSlotsFormSchema,
  type CreateSlotsFormValues,
} from "@/lib/schedule-schemas";
import { getCreateSlotsSubmitError } from "@/lib/schedule-submit-errors";
import {
  AddSlotPresetMode,
  DAYS_OF_WEEK,
  DayOfWeek,
  type RoutineStepProductSummary,
  SlotMode,
} from "@/types/schedule";
import { cn } from "@/lib/utils";
import { AddSlotFooter } from "./add-slot-footer";
import {
  buildCreateSlotsPayload,
  createAddSlotDefaultValues,
  getAddSlotDialogCopy,
  shouldShowFieldError,
  toggleDaySelection,
} from "./add-slot-content.utils";
import { SlotEditorNotesSection } from "./slot-editor-notes-section";
import { SlotEditorStepsSection } from "./slot-editor-steps-section";
import { SlotModeToggle } from "./slot-mode-toggle";
import { SlotSpecialistFields } from "./slot-specialist-fields";

type AddSlotContentProps = {
  presetMode: AddSlotPresetMode;
  preselectDay: DayOfWeek | null;
  onClose: () => void;
  onCreated?: () => void;
  onProductPickerClose?: () => void;
  showCloseButton?: boolean;
};

export function AddSlotContent({
  presetMode,
  preselectDay,
  onClose,
  onCreated,
  onProductPickerClose,
  showCloseButton = false,
}: AddSlotContentProps) {
  const t = useTranslations("schedule");
  const tCommon = useTranslations("common");
  const createSlots = useCreateSlots();
  const [productLookup, setProductLookup] = useState<
    Map<string, RoutineStepProductSummary>
  >(() => new Map());
  const defaultValues: CreateSlotsFormValues = createAddSlotDefaultValues({
    presetMode,
    preselectDay,
  });

  const form = useForm({
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: createSlotsFormSchema,
      onSubmit: createSlotsFormSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(
          createSlots.mutate,
          buildCreateSlotsPayload(value),
        );

        if (result.error !== null) {
          return getCreateSlotsSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      toast.success(t("save.saved"));
      onClose();
      onCreated?.();
    },
  });

  const canSubmit = useStore(form.store, (state) => state.canSubmit);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const selectedDayCount = useStore(
    form.store,
    (state) => state.values.daysOfWeek.length,
  );
  const modeValue = useStore(form.store, (state) => state.values.mode);
  const slotNotesValue = useStore(
    form.store,
    (state) => state.values.slotNotes,
  );
  const specialistProviderNameValue = useStore(
    form.store,
    (state) => state.values.specialistProviderName,
  );
  const specialistClinicNameValue = useStore(
    form.store,
    (state) => state.values.specialistClinicName,
  );
  const specialistActiveSinceValue = useStore(
    form.store,
    (state) => state.values.specialistActiveSince,
  );
  const specialistSafetyNotesValue = useStore(
    form.store,
    (state) => state.values.specialistSafetyNotes,
  );
  const submissionAttempts = useStore(
    form.store,
    (state) => state.submissionAttempts,
  );
  const submitError = useStore(form.store, (state) => state.errorMap.onSubmit);
  const showAllErrors = submissionAttempts > 0;
  const formError = readSubmissionErrorMessage(submitError);
  const isPending = createSlots.isPending || isSubmitting;
  const dialogCopy = getAddSlotDialogCopy({
    presetMode,
    selectedDayCount,
    t,
  });
  const handleProductPicked = useCallback(
    (picked: RoutineStepProductSummary) => {
      setProductLookup((prev) => {
        const next = new Map(prev);
        next.set(picked.id, picked);
        return next;
      });
    },
    [],
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      noValidate
      className="flex h-full flex-col"
    >
      <header
        className={cn(
          "border-b border-border px-5 py-4",
          !showCloseButton && "pr-12",
          showCloseButton && "flex items-start justify-between gap-3",
        )}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {dialogCopy.title}
          </h2>
          <p className="mt-1 text-xs text-muted">{dialogCopy.subtitle}</p>
        </div>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-accent-soft"
            aria-label={tCommon("close")}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto">
        <form.Field name="daysOfWeek">
          {(field) => {
            const showError = shouldShowFieldError(
              showAllErrors,
              field.state.meta.isTouched,
              field.state.meta.isDirty,
            );
            const errorText = showError
              ? firstFieldError(field.state.meta.errors, t)
              : undefined;

            return (
              <section className="border-b border-border px-5 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("addDialog.daysLabel")}
                </p>
                <div className="flex gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const selected = field.state.value.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          field.handleChange(
                            toggleDaySelection(field.state.value, day),
                          )
                        }
                        aria-pressed={selected}
                        className={cn(
                          "inline-flex h-10 min-w-10 flex-1 items-center justify-center rounded-full border text-sm font-semibold transition",
                          selected
                            ? "border-accent bg-accent text-surface"
                            : "border-border bg-surface text-foreground hover:border-accent",
                        )}
                      >
                        {t(`days.${day}Initial`)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  {dialogCopy.daysHint}
                </p>
                {errorText ? (
                  <p
                    className="mt-2 text-xs font-medium text-danger"
                    role="alert"
                  >
                    {errorText}
                  </p>
                ) : null}
              </section>
            );
          }}
        </form.Field>

        <form.Field name="slotTime">
          {(field) => {
            const showError = shouldShowFieldError(
              showAllErrors,
              field.state.meta.isTouched,
              field.state.meta.isDirty,
            );
            const errorText = showError
              ? firstFieldError(field.state.meta.errors, t)
              : undefined;

            return (
              <section className="border-b border-border px-5 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("addDialog.timeLabel")}
                </p>
                <TimePicker
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  invalid={Boolean(errorText)}
                  ariaLabel={t("addDialog.timeLabel")}
                  ariaDescribedBy={
                    errorText ? `${field.name}-error` : undefined
                  }
                />
                <p className="mt-2 text-[11px] text-muted">
                  {t("addDialog.timeHint")}
                </p>
                {errorText ? (
                  <p
                    id={`${field.name}-error`}
                    className="mt-2 text-xs font-medium text-danger"
                    role="alert"
                  >
                    {errorText}
                  </p>
                ) : null}
              </section>
            );
          }}
        </form.Field>

        <form.Field name="mode">
          {(field) => (
            <section className="border-b border-border px-5 py-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t("addDialog.modeLabel")}
              </p>
              <SlotModeToggle
                value={field.state.value}
                onChange={field.handleChange}
              />
            </section>
          )}
        </form.Field>

        <form.Field name="slotNotes">
          {(field) => (
            <SlotEditorNotesSection
              disabled={isPending}
              errors={field.state.meta.errors}
              id={field.name}
              isDirty={field.state.meta.isDirty}
              isTouched={field.state.meta.isTouched}
              mode={modeValue}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              showAllErrors={showAllErrors}
              value={slotNotesValue}
            />
          )}
        </form.Field>

        {modeValue === SlotMode.Manual ? (
          <SlotSpecialistFields
            activeSince={specialistActiveSinceValue}
            clinicName={specialistClinicNameValue}
            disabled={isPending}
            providerName={specialistProviderNameValue}
            safetyNotes={specialistSafetyNotesValue}
            onActiveSinceChange={(value) =>
              form.setFieldValue("specialistActiveSince", value)
            }
            onClinicNameChange={(value) =>
              form.setFieldValue("specialistClinicName", value)
            }
            onProviderNameChange={(value) =>
              form.setFieldValue("specialistProviderName", value)
            }
            onSafetyNotesChange={(value) =>
              form.setFieldValue("specialistSafetyNotes", value)
            }
          />
        ) : null}

        {modeValue === SlotMode.Manual ? (
          <form.Field name="steps">
            {(field) => (
              <SlotEditorStepsSection
                errors={field.state.meta.errors}
                isDirty={field.state.meta.isDirty}
                isTouched={field.state.meta.isTouched}
                onChange={field.handleChange}
                onProductPicked={handleProductPicked}
                onProductPickerClose={onProductPickerClose}
                productLookup={productLookup}
                showAllErrors={showAllErrors}
                steps={field.state.value}
              />
            )}
          </form.Field>
        ) : null}
      </div>
      <AddSlotFooter
        canSubmit={canSubmit}
        duplicateNote={dialogCopy.duplicateNote}
        formError={formError}
        isPending={isPending}
        savingLabel={dialogCopy.savingLabel}
        submitLabel={dialogCopy.submitLabel}
      />
    </form>
  );
}
