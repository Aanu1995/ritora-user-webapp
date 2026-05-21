"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import {
  useDeleteSlot,
  useUpdateSlot,
  useUpsertSteps,
} from "@/hooks/use-schedule";
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import {
  scheduleEditorFormSchema,
  type ScheduleEditorFormValues,
} from "@/lib/schedule-schemas";
import { getApiErrorCode } from "@/lib/api-error";
import { getScheduleEditorSubmitError } from "@/lib/schedule-submit-errors";
import {
  type RoutineStepProductSummary,
  ScheduleApiErrorCode,
  type ScheduleSlot,
  SlotMode,
  deriveDaypart,
} from "@/types/schedule";
import { buildProductLookup, stepsFromEntity } from "./routine-step-list.utils";
import {
  buildSlotUpdatePayload,
  createSlotEditorBaselineSnapshot,
  createSlotEditorDefaultValues,
  getSlotEditorChangeSummary,
} from "./slot-editor-content.utils";
import { SlotEditorHeader } from "./slot-editor-header";
import { SlotEditorFooter } from "./slot-editor-footer";
import { SlotEditorNotesSection } from "./slot-editor-notes-section";
import { SlotEditorStepsSection } from "./slot-editor-steps-section";
import { SlotEditorTimeField } from "./slot-editor-time-field";
import { SlotModeToggle } from "./slot-mode-toggle";
import { SlotSpecialistFields } from "./slot-specialist-fields";

type SlotEditorContentProps = {
  slot: ScheduleSlot;
  onClose: () => void;
  onProductPickerClose?: () => void;
  showCloseButton?: boolean;
};

export function SlotEditorContent({
  slot,
  onClose,
  onProductPickerClose,
  showCloseButton = false,
}: SlotEditorContentProps) {
  const t = useTranslations("schedule");
  const tCommon = useTranslations("common");
  const capabilities = useUserCapabilities();
  const aiDisabled = isCapabilityDisabled(capabilities.aiGeneration);

  const [baselineSlot, setBaselineSlot] = useState(slot);
  const [baselineSteps, setBaselineSteps] = useState(() =>
    stepsFromEntity(slot.steps),
  );
  const [productLookup, setProductLookup] = useState<
    Map<string, RoutineStepProductSummary>
  >(() => buildProductLookup(slot.steps));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const latestSavedSlotRef = useRef<ScheduleSlot | null>(null);

  const updateSlot = useUpdateSlot();
  const deleteSlot = useDeleteSlot();
  const upsertSteps = useUpsertSteps();
  const defaultValues = useMemo(
    () => createSlotEditorDefaultValues(baselineSlot, baselineSteps),
    [baselineSlot, baselineSteps],
  );
  const baselineSnapshot = useMemo(
    () => createSlotEditorBaselineSnapshot(defaultValues),
    [defaultValues],
  );

  const form = useForm({
    defaultValues: defaultValues satisfies ScheduleEditorFormValues,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: scheduleEditorFormSchema,
      onSubmit: scheduleEditorFormSchema,
      onSubmitAsync: async ({ value }) => {
        latestSavedSlotRef.current = null;
        if (value.mode === SlotMode.AI && aiDisabled) {
          return undefined;
        }

        const changeSummary = getSlotEditorChangeSummary({
          initialSteps: baselineSteps,
          ...baselineSnapshot,
          slot: baselineSlot,
          value,
        });

        if (changeSummary.detailsChanged) {
          const result = await executeMutation(updateSlot.mutate, {
            id: baselineSlot.id,
            payload: buildSlotUpdatePayload(changeSummary, value),
          });

          if (result.error !== null) {
            return getScheduleEditorSubmitError(result.error, t);
          }

          latestSavedSlotRef.current = result.data;
        }

        if (changeSummary.stepsChanged) {
          const result = await executeMutation(upsertSteps.mutate, {
            id: baselineSlot.id,
            payload: { steps: value.steps },
          });

          if (result.error !== null) {
            return getScheduleEditorSubmitError(result.error, t);
          }

          latestSavedSlotRef.current = result.data;
        }

        return undefined;
      },
    },
    onSubmit: () => {
      const savedSlot = latestSavedSlotRef.current ?? baselineSlot;
      const nextBaselineSteps = stepsFromEntity(savedSlot.steps);

      setBaselineSlot(savedSlot);
      setBaselineSteps(nextBaselineSteps);
      setProductLookup(buildProductLookup(savedSlot.steps));
      form.reset(createSlotEditorDefaultValues(savedSlot, nextBaselineSteps));
      latestSavedSlotRef.current = null;

      toast.success(t("save.saved"));
    },
  });

  const slotTimeValue = useStore(form.store, (state) => state.values.slotTime);
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
  const stepsValue = useStore(form.store, (state) => state.values.steps);
  const canSubmit = useStore(form.store, (state) => state.canSubmit);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const submissionAttempts = useStore(
    form.store,
    (state) => state.submissionAttempts,
  );
  const submitError = useStore(form.store, (state) => state.errorMap.onSubmit);

  const changeSummary = useMemo(
    () =>
      getSlotEditorChangeSummary({
        initialSteps: baselineSteps,
        ...baselineSnapshot,
        slot: baselineSlot,
        value: {
          slotTime: slotTimeValue,
          mode: modeValue,
          slotNotes: slotNotesValue,
          specialistProviderName: specialistProviderNameValue,
          specialistClinicName: specialistClinicNameValue,
          specialistActiveSince: specialistActiveSinceValue,
          specialistSafetyNotes: specialistSafetyNotesValue,
          steps: stepsValue,
        },
      }),
    [
      baselineSlot,
      baselineSteps,
      baselineSnapshot,
      modeValue,
      specialistActiveSinceValue,
      specialistClinicNameValue,
      specialistProviderNameValue,
      specialistSafetyNotesValue,
      slotNotesValue,
      slotTimeValue,
      stepsValue,
    ],
  );
  const isPending =
    isSubmitting ||
    updateSlot.isPending ||
    upsertSteps.isPending ||
    deleteSlot.isPending;
  const showAllErrors = submissionAttempts > 0;
  const formError = readSubmissionErrorMessage(submitError);
  const aiModeBlocked = modeValue === SlotMode.AI && aiDisabled;
  const saveDisabled =
    !changeSummary.hasChanges || !canSubmit || isPending || aiModeBlocked;
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: changeSummary.hasChanges,
  });

  const dayLabel = t(`days.${slot.dayOfWeek}`);
  const daypart = deriveDaypart(slotTimeValue);
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

  const getDeleteErrorMessage = (error: unknown) => {
    if (getApiErrorCode(error) === ScheduleApiErrorCode.SlotNotFound) {
      return t("save.errorNotFound");
    }

    return t("save.errorDelete");
  };

  const handleDelete = () => {
    deleteSlot.mutate(slot.id, {
      onError: (error) => {
        toast.error(getDeleteErrorMessage(error));
      },
      onSuccess: () => {
        releaseGuard({ removeHistoryEntry: false });
        toast.success(t("save.deleted"));
        setConfirmDelete(false);
        onClose();
      },
    });
  };

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (aiModeBlocked) {
            return;
          }
          void form.handleSubmit();
        }}
        noValidate
        className="flex h-full flex-col"
      >
        <SlotEditorHeader
          closeLabel={tCommon("close")}
          dayLabel={dayLabel}
          daypart={daypart}
          onClose={onClose}
          showCloseButton={showCloseButton}
        >
          <form.Field name="slotTime">
            {(field) => (
              <SlotEditorTimeField
                errors={field.state.meta.errors}
                isDirty={field.state.meta.isDirty}
                isTouched={field.state.meta.isTouched}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                showAllErrors={showAllErrors}
                value={field.state.value}
              />
            )}
          </form.Field>
        </SlotEditorHeader>

        <div className="flex-1 overflow-y-auto">
          <form.Field name="mode">
            {(field) => (
              <section className="border-b border-border px-5 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("editor.modeLabel")}
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

        <SlotEditorFooter
          deleteLabel={t("editor.deleteButton")}
          formError={formError}
          hasChanges={changeSummary.hasChanges}
          isPending={isPending}
          onDeleteRequest={() => setConfirmDelete(true)}
          saveDisabled={saveDisabled}
          saveLabel={t("editor.saveButton")}
          savingLabel={t("editor.savingButton")}
        />
      </form>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("editor.confirmDeleteTitle")}
        description={t("editor.confirmDeleteBody")}
        confirmLabel={t("editor.confirmDelete")}
        onConfirm={handleDelete}
        tone={ConfirmDialogTone.Danger}
        isPending={deleteSlot.isPending}
      />
    </>
  );
}
