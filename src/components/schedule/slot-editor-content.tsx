'use client';

import { Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { getApiErrorCode } from '@/lib/api-error';
import { TIME_REGEX } from '@/lib/schedule-schemas';
import {
  type RoutineStepInput,
  type RoutineStepProductSummary,
  ScheduleApiErrorCode,
  type ScheduleSlot,
  SlotMode,
  StepLabel,
  deriveDaypart,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { DaypartIcon } from './daypart-icon';
import {
  RoutineStepList,
  buildProductLookup,
  stepsFromEntity,
} from './routine-step-list';
import { SlotModeToggle } from './slot-mode-toggle';
import { SlotNotesField } from './slot-notes-field';

export function areStepsEqual(
  a: RoutineStepInput[],
  b: RoutineStepInput[],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (
      x.id !== y.id ||
      x.stepOrder !== y.stepOrder ||
      x.inventoryProductId !== y.inventoryProductId ||
      x.stepLabel !== y.stepLabel ||
      (x.customLabel ?? null) !== (y.customLabel ?? null) ||
      (x.notes ?? null) !== (y.notes ?? null) ||
      (x.optional ?? false) !== (y.optional ?? false)
    ) {
      return false;
    }
  }
  return true;
}

type SlotEditorContentProps = {
  slot: ScheduleSlot;
  onClose: () => void;
  /** Render a visible close X in the header. Sheets already show one; inline panels need their own. */
  showCloseButton?: boolean;
};

export function SlotEditorContent({
  slot,
  onClose,
  showCloseButton = false,
}: SlotEditorContentProps) {
  const t = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const initialSteps = useMemo(() => stepsFromEntity(slot.steps), [slot.steps]);

  const [slotTime, setSlotTime] = useState(slot.slotTime);
  const [mode, setMode] = useState<SlotMode>(slot.mode);
  const [notes, setNotes] = useState(slot.slotNotes ?? '');
  const [steps, setSteps] = useState<RoutineStepInput[]>(initialSteps);
  const [productLookup, setProductLookup] = useState<
    Map<string, RoutineStepProductSummary>
  >(() => buildProductLookup(slot.steps));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateSlot = useUpdateSlot();
  const deleteSlot = useDeleteSlot();
  const upsertSteps = useUpsertSteps();

  const isValidTime = TIME_REGEX.test(slotTime);
  const timeChanged = slotTime !== slot.slotTime;
  const modeChanged = mode !== slot.mode;
  const notesChanged = (slot.slotNotes ?? '') !== notes;
  const stepsChanged =
    mode === SlotMode.Manual && !areStepsEqual(steps, initialSteps);
  const hasChanges =
    timeChanged || modeChanged || notesChanged || stepsChanged;
  const isPending =
    updateSlot.isPending || upsertSteps.isPending || deleteSlot.isPending;
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: hasChanges,
  });

  const dayLabel = t(`days.${slot.dayOfWeek}`);
  const daypart = deriveDaypart(slotTime);

  const getSaveErrorMessage = (error: unknown) => {
    const code = getApiErrorCode(error);

    if (code === ScheduleApiErrorCode.SlotConflict) {
      return t('save.errorDuplicate');
    }

    if (code === ScheduleApiErrorCode.SlotNotFound) {
      return t('save.errorNotFound');
    }

    return t('save.errorGeneric');
  };

  const getDeleteErrorMessage = (error: unknown) => {
    if (getApiErrorCode(error) === ScheduleApiErrorCode.SlotNotFound) {
      return t('save.errorNotFound');
    }

    return t('save.errorDelete');
  };

  const handleSave = () => {
    if (!isValidTime) {
      toast.error(t('validation.timeFormat'));
      return;
    }

    if (mode === SlotMode.Manual) {
      for (const step of steps) {
        if (
          step.stepLabel === StepLabel.Custom &&
          !step.customLabel?.trim()
        ) {
          toast.error(t('validation.customLabelRequired'));
          return;
        }
      }
    }

    const finishSave = () => {
      releaseGuard();
      toast.success(t('save.saved'));
      onClose();
    };

    const saveSteps = () => {
      if (!stepsChanged) {
        finishSave();
        return;
      }

      upsertSteps.mutate(
        {
          id: slot.id,
          payload: { steps },
        },
        {
          onError: (error) => {
            toast.error(getSaveErrorMessage(error));
          },
          onSuccess: () => {
            finishSave();
          },
        },
      );
    };

    if (timeChanged || modeChanged || notesChanged) {
      updateSlot.mutate(
        {
          id: slot.id,
          payload: {
            slotTime: timeChanged ? slotTime : undefined,
            mode: modeChanged ? mode : undefined,
            slotNotes: notesChanged ? (notes.trim() ? notes : null) : undefined,
          },
        },
        {
          onError: (error) => {
            toast.error(getSaveErrorMessage(error));
          },
          onSuccess: () => {
            saveSteps();
          },
        },
      );
      return;
    }

    saveSteps();
  };

  const handleDelete = () => {
    deleteSlot.mutate(slot.id, {
      onError: (error) => {
        toast.error(getDeleteErrorMessage(error));
      },
      onSuccess: () => {
        releaseGuard();
        toast.success(t('save.deleted'));
        setConfirmDelete(false);
        onClose();
      },
    });
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <header
          className={cn(
            'flex items-start gap-3 border-b border-border px-5 py-4',
            !showCloseButton && 'pr-12',
          )}
        >
          <DaypartIcon daypart={daypart} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{dayLabel}</p>
            <div className="mt-1 flex items-center gap-2">
              <TimePicker
                value={slotTime}
                onChange={setSlotTime}
                invalid={!isValidTime}
                ariaLabel={t('addDialog.timeLabel')}
                className="inline-flex h-9 w-auto min-w-[120px] gap-1.5 rounded-lg border border-border bg-surface-muted/60 px-3 py-1.5 text-lg font-bold transition hover:border-accent hover:bg-surface-muted focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
              />
              <span className="text-[11px] text-muted">
                {t('editor.timeEditHint')}
              </span>
            </div>
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
          <section className="border-b border-border px-5 py-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t('editor.modeLabel')}
            </p>
            <SlotModeToggle value={mode} onChange={setMode} />
          </section>

          <section className="border-b border-border px-5 py-4">
            <SlotNotesField value={notes} onChange={setNotes} mode={mode} />
          </section>

          {mode === SlotMode.Manual ? (
            <section className="px-5 py-4">
              <RoutineStepList
                steps={steps}
                productLookup={productLookup}
                onChange={setSteps}
                onProductPicked={(picked) =>
                  setProductLookup((prev) => {
                    const next = new Map(prev);
                    next.set(picked.id, picked);
                    return next;
                  })
                }
              />
            </section>
          ) : null}
        </div>

        <footer className="flex gap-2 border-t border-border bg-surface px-5 py-4">
          <Button
            variant="outline"
            className="flex-1 border-danger/40 text-danger hover:border-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" aria-hidden />
            {t('editor.deleteButton')}
          </Button>
          <Button
            className={cn('flex-1', !hasChanges && 'opacity-50')}
            onClick={handleSave}
            disabled={!hasChanges || !isValidTime || isPending}
          >
            {isPending ? t('editor.savingButton') : t('editor.saveButton')}
          </Button>
        </footer>
      </div>

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
