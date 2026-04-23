'use client';

import { useForm, useStore } from '@tanstack/react-form';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from '@/components/ui/confirm-dialog';
import { TimePicker } from '@/components/ui/time-picker';
import {
  useDeleteSlot,
  useUpdateSlot,
  useUpsertSteps,
} from '@/hooks/use-schedule';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import {
  scheduleEditorFormSchema,
  type ScheduleEditorFormValues,
} from '@/lib/schedule-schemas';
import { getApiErrorCode } from '@/lib/api-error';
import { getScheduleEditorSubmitError } from '@/lib/schedule-submit-errors';
import {
  type RoutineStepProductSummary,
  ScheduleApiErrorCode,
  type ScheduleSlot,
  SlotMode,
  deriveDaypart,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { DaypartIcon } from './daypart-icon';
import {
  buildProductLookup,
  stepsFromEntity,
} from './routine-step-list.utils';
import { RoutineStepList } from './routine-step-list';
import {
  buildSlotUpdatePayload,
  createSlotEditorDefaultValues,
  getSlotEditorChangeSummary,
  normalizeSlotNotesInput,
  shouldShowFieldError,
} from './slot-editor-content.utils';
import { SlotEditorFooter } from './slot-editor-footer';
import { SlotModeToggle } from './slot-mode-toggle';
import { SlotNotesField } from './slot-notes-field';

type SlotEditorContentProps = {
  slot: ScheduleSlot;
  onClose: () => void;
  showCloseButton?: boolean;
};

export function SlotEditorContent({
  slot,
  onClose,
  showCloseButton = false,
}: SlotEditorContentProps) {
  const t = useTranslations('schedule');
  const tCommon = useTranslations('common');

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
  const normalizedBaselineSlotNotes = normalizeSlotNotesInput(
    defaultValues.slotNotes,
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
        const changeSummary = getSlotEditorChangeSummary({
          initialSteps: baselineSteps,
          normalizedInitialSlotNotes: normalizedBaselineSlotNotes,
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

      toast.success(t('save.saved'));
    },
  });

  const slotTimeValue = useStore(form.store, (state) => state.values.slotTime);
  const modeValue = useStore(form.store, (state) => state.values.mode);
  const slotNotesValue = useStore(form.store, (state) => state.values.slotNotes);
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
        normalizedInitialSlotNotes: normalizedBaselineSlotNotes,
        slot: baselineSlot,
        value: {
          slotTime: slotTimeValue,
          mode: modeValue,
          slotNotes: slotNotesValue,
          steps: stepsValue,
        },
      }),
    [
      baselineSlot,
      baselineSteps,
      modeValue,
      normalizedBaselineSlotNotes,
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
  const saveDisabled = !changeSummary.hasChanges || !canSubmit || isPending;
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: changeSummary.hasChanges,
  });

  const dayLabel = t(`days.${slot.dayOfWeek}`);
  const daypart = deriveDaypart(slotTimeValue);
  const handleProductPicked = useCallback((picked: RoutineStepProductSummary) => {
    setProductLookup((prev) => {
      const next = new Map(prev);
      next.set(picked.id, picked);
      return next;
    });
  }, []);

  const getDeleteErrorMessage = (error: unknown) => {
    if (getApiErrorCode(error) === ScheduleApiErrorCode.SlotNotFound) {
      return t('save.errorNotFound');
    }

    return t('save.errorDelete');
  };

  const handleDelete = () => {
    deleteSlot.mutate(slot.id, {
      onError: (error) => {
        toast.error(getDeleteErrorMessage(error));
      },
      onSuccess: () => {
        releaseGuard({ removeHistoryEntry: false });
        toast.success(t('save.deleted'));
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
          void form.handleSubmit();
        }}
        noValidate
        className="flex h-full flex-col"
      >
        <header
          className={cn(
            'flex items-start gap-3 border-b border-border px-5 py-4',
            !showCloseButton && 'pr-12',
          )}
        >
          <DaypartIcon daypart={daypart} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{dayLabel}</p>
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
                  <>
                    <div className="mt-1 flex items-center gap-2">
                      <TimePicker
                        id={field.name}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        invalid={Boolean(errorText)}
                        ariaLabel={t('addDialog.timeLabel')}
                        ariaDescribedBy={
                          errorText ? `${field.name}-error` : undefined
                        }
                        className="inline-flex h-9 w-auto min-w-[120px] gap-1.5 rounded-lg border border-border bg-surface-muted/60 px-3 py-1.5 text-lg font-bold transition hover:border-accent hover:bg-surface-muted focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
                      />
                      <span className="text-[11px] text-muted">
                        {t('editor.timeEditHint')}
                      </span>
                    </div>
                    {errorText ? (
                      <p
                        id={`${field.name}-error`}
                        className="mt-2 text-xs font-medium text-danger"
                        role="alert"
                      >
                        {errorText}
                      </p>
                    ) : null}
                  </>
                );
              }}
            </form.Field>
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted transition hover:bg-surface-muted"
              aria-label={tCommon('close')}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </header>

        <div className="flex-1 overflow-y-auto">
          <form.Field name="mode">
            {(field) => (
              <section className="border-b border-border px-5 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t('editor.modeLabel')}
                </p>
                <SlotModeToggle
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </section>
            )}
          </form.Field>

          <form.Field name="slotNotes">
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
                  <SlotNotesField
                    id={field.name}
                    value={slotNotesValue}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    mode={modeValue}
                    disabled={isPending}
                    errorText={errorText}
                  />
                </section>
              );
            }}
          </form.Field>

          {modeValue === SlotMode.Manual ? (
            <form.Field name="steps">
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
                  <section className="px-5 py-4">
                    <RoutineStepList
                      steps={field.state.value}
                      productLookup={productLookup}
                      onChange={field.handleChange}
                      onProductPicked={handleProductPicked}
                      errorText={errorText}
                    />
                  </section>
                );
              }}
            </form.Field>
          ) : null}
        </div>

        <SlotEditorFooter
          deleteLabel={t('editor.deleteButton')}
          formError={formError}
          hasChanges={changeSummary.hasChanges}
          isPending={isPending}
          onDeleteRequest={() => setConfirmDelete(true)}
          saveDisabled={saveDisabled}
          saveLabel={t('editor.saveButton')}
          savingLabel={t('editor.savingButton')}
        />
      </form>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('editor.confirmDeleteTitle')}
        description={t('editor.confirmDeleteBody')}
        confirmLabel={t('editor.confirmDelete')}
        onConfirm={handleDelete}
        tone={ConfirmDialogTone.Danger}
        isPending={deleteSlot.isPending}
      />
    </>
  );
}
