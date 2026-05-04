import { z } from "zod";
import { formatLocalTimeInput } from "@/lib/suggestion-daypart";
import {
  APPLICATION_ITEM_STATUSES,
  type ApplicationItemStatus,
  type ApplicationLog,
} from "@/types/application-tracking";
import type {
  SuggestionInstance,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

const applicationTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const nullableText = z.string().nullable();

export const applicationRecordFormSchema = z.object({
  appliedTime: z
    .string()
    .regex(applicationTimePattern, "validation.invalidAppliedTime"),
  generalNotes: z.string().max(1000, "validation.notesTooLong"),
  editReason: z.string().max(500, "validation.editReasonTooLong"),
  items: z
    .array(
      z.object({
        stepOrder: z.number().int().min(0),
        suggestionStepId: nullableText,
        inventoryProductId: nullableText,
        productBrand: nullableText,
        productName: nullableText,
        stepLabel: nullableText,
        status: z.enum(APPLICATION_ITEM_STATUSES),
        substitutedWithProductId: nullableText,
        notes: nullableText,
      }),
    )
    .min(1, "validation.itemsRequired"),
});

export type ApplicationRecordFormValues = z.infer<
  typeof applicationRecordFormSchema
>;

export type ApplicationRecordSheetMode =
  | { kind: "record"; slot: TodaysSuggestionSlot }
  | { kind: "edit"; slot: TodaysSuggestionSlot; existingLog: ApplicationLog };

export function buildApplicationRecordDefaultValues(
  mode: ApplicationRecordSheetMode,
  suggestion: SuggestionInstance,
): ApplicationRecordFormValues {
  const items =
    mode.kind === "edit"
      ? mode.existingLog.items
          .filter((item) => !item.isAdHoc)
          .map((item) => ({
            stepOrder: item.stepOrder,
            suggestionStepId: item.suggestionStepId,
            inventoryProductId: item.inventoryProductId,
            productBrand: item.productBrand,
            productName: item.productName,
            stepLabel: item.stepLabel,
            status: item.status,
            substitutedWithProductId: item.substitutedWithProductId,
            notes: item.notes,
          }))
      : suggestion.steps.map((step) => ({
          stepOrder: step.stepOrder,
          suggestionStepId: step.id,
          inventoryProductId: step.inventoryProductId,
          productBrand: step.product?.brand ?? step.productBrand,
          productName: step.product?.name ?? step.productName,
          stepLabel: step.stepLabel,
          status: "applied" as const,
          substitutedWithProductId: null,
          notes: null,
        }));

  return {
    appliedTime: initialAppliedTime(mode),
    generalNotes: mode.kind === "edit" ? (mode.existingLog.generalNotes ?? "") : "",
    editReason: "",
    items,
  };
}

export function updateApplicationRecordRowStatus(
  rows: ApplicationRecordFormValues["items"],
  stepOrder: number,
  status: ApplicationItemStatus,
): ApplicationRecordFormValues["items"] {
  return rows.map((row) =>
    row.stepOrder === stepOrder
      ? {
          ...row,
          status,
          substitutedWithProductId:
            status === "substituted" ? row.substitutedWithProductId : null,
        }
      : row,
  );
}

export function applicationRecordSheetKey(
  mode: ApplicationRecordSheetMode,
): string {
  if (mode.kind === "edit") return `edit:${mode.existingLog.id}`;
  return `record:${mode.slot.suggestion?.id ?? mode.slot.slotId}`;
}

function initialAppliedTime(mode: ApplicationRecordSheetMode): string {
  if (mode.kind !== "edit") return formatLocalTimeInput();
  return mode.existingLog.appliedAt
    ? formatLocalTimeInput(new Date(mode.existingLog.appliedAt))
    : formatLocalTimeInput();
}
