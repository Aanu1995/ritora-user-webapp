import type { ScheduleEditorFormValues } from "@/lib/schedule-schemas";
import {
  SlotMode,
  type RoutineStepInput,
  type ScheduleSlot,
  type UpdateSlotPayload,
} from "@/types/schedule";

type SlotEditorComparableSlot = Pick<ScheduleSlot, "slotTime" | "mode">;

export type SlotEditorChangeSummary = {
  detailsChanged: boolean;
  hasChanges: boolean;
  modeChanged: boolean;
  normalizedSpecialistActiveSince: string;
  normalizedSpecialistClinicName: string;
  normalizedSpecialistProviderName: string;
  normalizedSpecialistSafetyNotes: string;
  normalizedSlotNotes: string;
  notesChanged: boolean;
  specialistChanged: boolean;
  stepsChanged: boolean;
  timeChanged: boolean;
};

export type SlotEditorBaselineSnapshot = Pick<
  Parameters<typeof getSlotEditorChangeSummary>[0],
  | "normalizedInitialSlotNotes"
  | "normalizedInitialSpecialistProviderName"
  | "normalizedInitialSpecialistClinicName"
  | "normalizedInitialSpecialistActiveSince"
  | "normalizedInitialSpecialistSafetyNotes"
>;

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
      (current.optional ?? false) !== (next.optional ?? false) ||
      (current.isSpecialistLocked ?? false) !==
        (next.isSpecialistLocked ?? false)
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
    slotNotes: slot.slotNotes ?? "",
    specialistProviderName: slot.specialistProviderName ?? "",
    specialistClinicName: slot.specialistClinicName ?? "",
    specialistActiveSince: slot.specialistActiveSince ?? "",
    specialistSafetyNotes: slot.specialistSafetyNotes ?? "",
    steps: initialSteps,
  };
}

export function createSlotEditorBaselineSnapshot(
  value: ScheduleEditorFormValues,
): SlotEditorBaselineSnapshot {
  return {
    normalizedInitialSlotNotes: normalizeSlotNotesInput(value.slotNotes),
    normalizedInitialSpecialistProviderName: normalizeSlotNotesInput(
      value.specialistProviderName,
    ),
    normalizedInitialSpecialistClinicName: normalizeSlotNotesInput(
      value.specialistClinicName,
    ),
    normalizedInitialSpecialistActiveSince: normalizeSlotNotesInput(
      value.specialistActiveSince,
    ),
    normalizedInitialSpecialistSafetyNotes: normalizeSlotNotesInput(
      value.specialistSafetyNotes,
    ),
  };
}

export function getSlotEditorChangeSummary({
  initialSteps,
  normalizedInitialSpecialistActiveSince,
  normalizedInitialSpecialistClinicName,
  normalizedInitialSpecialistProviderName,
  normalizedInitialSpecialistSafetyNotes,
  normalizedInitialSlotNotes,
  slot,
  value,
}: {
  initialSteps: RoutineStepInput[];
  normalizedInitialSpecialistActiveSince: string;
  normalizedInitialSpecialistClinicName: string;
  normalizedInitialSpecialistProviderName: string;
  normalizedInitialSpecialistSafetyNotes: string;
  normalizedInitialSlotNotes: string;
  slot: SlotEditorComparableSlot;
  value: ScheduleEditorFormValues;
}): SlotEditorChangeSummary {
  const normalizedSlotNotes = normalizeSlotNotesInput(value.slotNotes);
  const normalizedSpecialistProviderName = normalizeSlotNotesInput(
    value.specialistProviderName,
  );
  const normalizedSpecialistClinicName = normalizeSlotNotesInput(
    value.specialistClinicName,
  );
  const normalizedSpecialistActiveSince = normalizeSlotNotesInput(
    value.specialistActiveSince,
  );
  const normalizedSpecialistSafetyNotes = normalizeSlotNotesInput(
    value.specialistSafetyNotes,
  );
  const timeChanged = value.slotTime !== slot.slotTime;
  const modeChanged = value.mode !== slot.mode;
  const notesChanged = normalizedSlotNotes !== normalizedInitialSlotNotes;
  const specialistChanged =
    normalizedSpecialistProviderName !==
      normalizedInitialSpecialistProviderName ||
    normalizedSpecialistClinicName !== normalizedInitialSpecialistClinicName ||
    normalizedSpecialistActiveSince !==
      normalizedInitialSpecialistActiveSince ||
    normalizedSpecialistSafetyNotes !== normalizedInitialSpecialistSafetyNotes;
  const stepsChanged =
    value.mode === SlotMode.Manual && !areStepsEqual(value.steps, initialSteps);
  const detailsChanged =
    timeChanged || modeChanged || notesChanged || specialistChanged;

  return {
    detailsChanged,
    hasChanges: detailsChanged || stepsChanged,
    modeChanged,
    normalizedSpecialistActiveSince,
    normalizedSpecialistClinicName,
    normalizedSpecialistProviderName,
    normalizedSpecialistSafetyNotes,
    normalizedSlotNotes,
    notesChanged,
    specialistChanged,
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
    specialistProviderName: changeSummary.specialistChanged
      ? changeSummary.normalizedSpecialistProviderName || null
      : undefined,
    specialistClinicName: changeSummary.specialistChanged
      ? changeSummary.normalizedSpecialistClinicName || null
      : undefined,
    specialistActiveSince: changeSummary.specialistChanged
      ? changeSummary.normalizedSpecialistActiveSince || null
      : undefined,
    specialistSafetyNotes: changeSummary.specialistChanged
      ? changeSummary.normalizedSpecialistSafetyNotes || null
      : undefined,
  };
}
