import type { CreateSlotsFormValues } from "@/lib/schedule-schemas";
import {
  AddSlotPresetMode,
  type CreateSlotsPayload,
  DAYS_OF_WEEK,
  type DayOfWeek,
  SlotMode,
} from "@/types/schedule";

type ScheduleTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export type AddSlotDialogCopy = {
  daysHint: string;
  duplicateNote: string;
  savingLabel: string;
  submitLabel: string;
  subtitle: string;
  title: string;
};

export function computeInitialDays(
  presetMode: AddSlotPresetMode,
  preselectDay: DayOfWeek | null,
): DayOfWeek[] {
  if (presetMode === AddSlotPresetMode.EveryDay) {
    return [...DAYS_OF_WEEK];
  }

  if (preselectDay) {
    return [preselectDay];
  }

  return [];
}

export function createAddSlotDefaultValues({
  presetMode,
  preselectDay,
}: {
  presetMode: AddSlotPresetMode;
  preselectDay: DayOfWeek | null;
}): CreateSlotsFormValues {
  return {
    daysOfWeek: computeInitialDays(presetMode, preselectDay),
    slotTime: "08:00",
    mode: SlotMode.AI,
    slotNotes: "",
    specialistProviderName: "",
    specialistClinicName: "",
    specialistActiveSince: "",
    specialistSafetyNotes: "",
    steps: [],
  };
}

export function buildCreateSlotsPayload(
  value: CreateSlotsFormValues,
): CreateSlotsPayload {
  return {
    daysOfWeek: value.daysOfWeek,
    slotTime: value.slotTime,
    mode: value.mode,
    slotNotes: value.slotNotes,
    specialistProviderName: value.specialistProviderName,
    specialistClinicName: value.specialistClinicName,
    specialistActiveSince: normalizeOptionalDate(value.specialistActiveSince),
    specialistSafetyNotes: value.specialistSafetyNotes,
    steps: value.steps,
  };
}

function normalizeOptionalDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toggleDaySelection(
  selectedDays: DayOfWeek[],
  day: DayOfWeek,
): DayOfWeek[] {
  const nextSelection = new Set(selectedDays);

  if (nextSelection.has(day)) {
    nextSelection.delete(day);
  } else {
    nextSelection.add(day);
  }

  return DAYS_OF_WEEK.filter((candidate) => nextSelection.has(candidate));
}

export function shouldShowFieldError(
  showAllErrors: boolean,
  isTouched: boolean,
  isDirty: boolean,
): boolean {
  return showAllErrors || isTouched || isDirty;
}

export function getAddSlotDialogCopy({
  presetMode,
  selectedDayCount,
  t,
}: {
  presetMode: AddSlotPresetMode;
  selectedDayCount: number;
  t: ScheduleTranslator;
}): AddSlotDialogCopy {
  const isEveryDayPreset = presetMode === AddSlotPresetMode.EveryDay;

  return {
    daysHint:
      selectedDayCount === DAYS_OF_WEEK.length
        ? t("addDialog.daysHintEveryDay")
        : t("addDialog.daysHintSingle"),
    duplicateNote: t("addDialog.duplicateNote"),
    savingLabel: t("save.saving"),
    submitLabel:
      selectedDayCount <= 1
        ? t("addDialog.submitSingle")
        : t("addDialog.submitMultiple", { count: selectedDayCount }),
    subtitle: isEveryDayPreset
      ? t("addDialog.subtitleEveryDay")
      : t("addDialog.subtitleSingle"),
    title: isEveryDayPreset
      ? t("addDialog.titleEveryDay")
      : t("addDialog.titleSingle"),
  };
}
