import { buildLocalDateTimeIso } from "@/lib/suggestion-daypart";
import type {
  ApplicationLogItemInput,
  EditApplicationPayload,
  RecordApplicationPayload,
} from "@/types/application-tracking";
import type {
  SuggestionInstance,
  TodaysSuggestionSlot,
} from "@/types/suggestions";
import type { ApplicationRecordFormValues } from "./record-application-form";

export function buildRecordApplicationPayload(
  slot: TodaysSuggestionSlot,
  suggestion: SuggestionInstance,
  value: ApplicationRecordFormValues,
): RecordApplicationPayload {
  return {
    suggestionInstanceId: suggestion.id,
    slotId: suggestion.slotId ?? slot.slotId,
    targetDate: suggestion.targetDate,
    targetTime: suggestion.targetTime,
    appliedAt: buildAppliedAt(suggestion, value.appliedTime),
    generalNotes: trimmedOrNull(value.generalNotes),
    items: toApplicationLogItemInputs(value.items),
  };
}

export function buildEditApplicationPayload(
  suggestion: SuggestionInstance,
  value: ApplicationRecordFormValues,
): EditApplicationPayload {
  return {
    appliedAt: buildAppliedAt(suggestion, value.appliedTime),
    generalNotes: trimmedOrNull(value.generalNotes),
    editReason: trimmedOrNull(value.editReason),
    items: toApplicationLogItemInputs(value.items),
  };
}

export function buildSkippedApplicationPayload(
  slot: TodaysSuggestionSlot,
  note: string,
  itemNote: string,
): RecordApplicationPayload | null {
  const suggestion = slot.suggestion;
  if (!suggestion) return null;

  return {
    suggestionInstanceId: suggestion.id,
    slotId: slot.slotId,
    targetDate: suggestion.targetDate,
    targetTime: suggestion.targetTime,
    appliedAt: buildLocalDateTimeIso(
      suggestion.targetDate,
      suggestion.targetTime.slice(0, 5),
    ),
    generalNotes: note,
    items: suggestion.steps.map((step) => ({
      stepOrder: step.stepOrder,
      suggestionStepId: step.id,
      inventoryProductId: step.inventoryProductId,
      productBrand: step.product?.brand ?? step.productBrand,
      productName: step.product?.name ?? step.productName,
      stepLabel: step.stepLabel,
      status: "skipped",
      isAdHoc: false,
      notes: itemNote,
    })),
  };
}

function toApplicationLogItemInputs(
  rows: ApplicationRecordFormValues["items"],
): ApplicationLogItemInput[] {
  return rows.map((row) => ({
    stepOrder: row.stepOrder,
    suggestionStepId: row.suggestionStepId,
    inventoryProductId: row.inventoryProductId,
    substitutedWithProductId: row.substitutedWithProductId,
    productBrand: row.productBrand,
    productName: row.productName,
    stepLabel: row.stepLabel,
    status: row.status,
    isAdHoc: row.isAdHoc,
    adHocBrand: row.adHocBrand,
    adHocName: row.adHocName,
    notes: row.notes,
    substitutionReason: row.substitutionReason,
    appliedAt: row.appliedAt,
  }));
}

function buildAppliedAt(
  suggestion: SuggestionInstance,
  appliedTime: string,
): string {
  return buildLocalDateTimeIso(suggestion.targetDate, appliedTime);
}

function trimmedOrNull(value: string): string | null {
  return value.trim() || null;
}
