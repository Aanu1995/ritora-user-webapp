import type { ScheduleEditorFormValues } from '@/lib/schedule-schemas';
import {
  SlotMode,
  type RoutineStepInput,
  type ScheduleSlot,
  type UpdateSlotPayload,
} from '@/types/schedule';

type SlotEditorComparableSlot = Pick<ScheduleSlot, 'slotTime' | 'mode'>;

export type SlotEditorChangeSummary = {
  detailsChanged: boolean;
  hasChanges: boolean;
  modeChanged: boolean;
  normalizedSlotNotes: string;
  notesChanged: boolean;
  stepsChanged: boolean;
  timeChanged: boolean;
};

export function areStepsEqual(
  a: RoutineStepInput[],
  b: RoutineStepInput[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    const current = a[index];
    const next = b[index];

    if (
      current.id !== next.id ||
      current.stepOrder !== next.stepOrder ||
      current.inventoryProductId !== next.inventoryProductId ||
      current.stepLabel !== next.stepLabel ||
      (current.customLabel ?? null) !== (next.customLabel ?? null) ||
      (current.notes ?? null) !== (next.notes ?? null) ||
      (current.optional ?? false) !== (next.optional ?? false)
    ) {
      return false;
    }
  }

  return true;
}

export function shouldShowFieldError(
  showAllErrors: boolean,
  isTouched: boolean,
  isDirty: boolean,
): boolean {
  return showAllErrors || isTouched || isDirty;
}

export function normalizeSlotNotesInput(value: string): string {
  return value.trim();
}

export function createSlotEditorDefaultValues(
  slot: ScheduleSlot,
  initialSteps: RoutineStepInput[],
): ScheduleEditorFormValues {
  return {
    slotTime: slot.slotTime,
    mode: slot.mode,
    slotNotes: slot.slotNotes ?? '',
    steps: initialSteps,
  };
}

export function getSlotEditorChangeSummary({
  initialSteps,
  normalizedInitialSlotNotes,
  slot,
  value,
}: {
  initialSteps: RoutineStepInput[];
  normalizedInitialSlotNotes: string;
  slot: SlotEditorComparableSlot;
  value: ScheduleEditorFormValues;
}): SlotEditorChangeSummary {
  const normalizedSlotNotes = normalizeSlotNotesInput(value.slotNotes);
  const timeChanged = value.slotTime !== slot.slotTime;
  const modeChanged = value.mode !== slot.mode;
  const notesChanged = normalizedSlotNotes !== normalizedInitialSlotNotes;
  const stepsChanged =
    value.mode === SlotMode.Manual &&
    !areStepsEqual(value.steps, initialSteps);
  const detailsChanged = timeChanged || modeChanged || notesChanged;

  return {
    detailsChanged,
    hasChanges: detailsChanged || stepsChanged,
    modeChanged,
    normalizedSlotNotes,
    notesChanged,
    stepsChanged,
    timeChanged,
  };
}

export function buildSlotUpdatePayload(
  changeSummary: SlotEditorChangeSummary,
  value: ScheduleEditorFormValues,
): UpdateSlotPayload {
  return {
    slotTime: changeSummary.timeChanged ? value.slotTime : undefined,
    mode: changeSummary.modeChanged ? value.mode : undefined,
    slotNotes: changeSummary.notesChanged
      ? changeSummary.normalizedSlotNotes || null
      : undefined,
  };
}
