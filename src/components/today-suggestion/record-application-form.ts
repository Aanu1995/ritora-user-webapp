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

const applicationRecordItemSchema = z
  .object({
    stepOrder: z.number().int().min(0),
    suggestionStepId: nullableText,
    inventoryProductId: nullableText,
    productBrand: nullableText,
    productName: nullableText,
    stepLabel: nullableText,
    status: z.enum(APPLICATION_ITEM_STATUSES),
    substitutedWithProductId: nullableText,
    substitutionReason: nullableText,
    isAdHoc: z.boolean(),
    adHocBrand: nullableText,
    adHocName: nullableText,
    notes: nullableText,
    appliedAt: nullableText,
  })
  .superRefine((row, ctx) => {
    if (row.isAdHoc && (!row.adHocBrand?.trim() || !row.adHocName?.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["adHocName"],
        message: "validation.offShelfProductRequired",
      });
    }
    if (
      row.status === "substituted" &&
      !row.substitutedWithProductId &&
      !(row.isAdHoc && row.adHocBrand?.trim() && row.adHocName?.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["substitutedWithProductId"],
        message: "validation.substituteRequired",
      });
    }
  });

export const applicationRecordFormSchema = z.object({
  appliedTime: z
    .string()
    .regex(applicationTimePattern, "validation.invalidAppliedTime"),
  generalNotes: z.string().max(1000, "validation.notesTooLong"),
  editReason: z.string().max(500, "validation.editReasonTooLong"),
  items: z.array(applicationRecordItemSchema).min(1, "validation.itemsRequired"),
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
          .map((item) => ({
            stepOrder: item.stepOrder,
            suggestionStepId: item.suggestionStepId,
            inventoryProductId: item.inventoryProductId,
            productBrand: item.productBrand,
            productName: item.productName,
            stepLabel: item.stepLabel,
            status: item.status,
            substitutedWithProductId: item.substitutedWithProductId,
            substitutionReason: item.substitutionReason,
            isAdHoc: item.isAdHoc,
            adHocBrand: item.adHocBrand,
            adHocName: item.adHocName,
            notes: item.notes,
            appliedAt: item.appliedAt,
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
          substitutionReason: null,
          isAdHoc: false,
          adHocBrand: null,
          adHocName: null,
          notes: null,
          appliedAt: null,
        }));

  return {
    appliedTime: initialAppliedTime(mode),
    generalNotes: mode.kind === "edit" ? (mode.existingLog.generalNotes ?? "") : "",
    editReason: "",
    items,
  };
}

export function updateApplicationRecordRow(
  rows: ApplicationRecordFormValues["items"],
  stepOrder: number,
  patch: Partial<ApplicationRecordFormValues["items"][number]>,
): ApplicationRecordFormValues["items"] {
  return rows.map((row) =>
    row.stepOrder === stepOrder ? { ...row, ...patch } : row,
  );
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
          substitutionReason:
            status === "substituted" ? row.substitutionReason : null,
          isAdHoc:
            status === "substituted" || !row.suggestionStepId
              ? row.isAdHoc
              : false,
          adHocBrand:
            status === "substituted" || !row.suggestionStepId
              ? row.adHocBrand
              : null,
          adHocName:
            status === "substituted" || !row.suggestionStepId
              ? row.adHocName
              : null,
        }
      : row,
  );
}

export function addShelfApplicationRecordRow(
  rows: ApplicationRecordFormValues["items"],
  product: {
    id: string;
    brand: string;
    name: string;
    category: string;
  },
): ApplicationRecordFormValues["items"] {
  return [
    ...rows,
    {
      stepOrder: nextStepOrder(rows),
      suggestionStepId: null,
      inventoryProductId: product.id,
      productBrand: product.brand,
      productName: product.name,
      stepLabel: product.category,
      status: "applied",
      substitutedWithProductId: null,
      substitutionReason: null,
      isAdHoc: false,
      adHocBrand: null,
      adHocName: null,
      notes: null,
      appliedAt: null,
    },
  ];
}

export function addOffShelfApplicationRecordRow(
  rows: ApplicationRecordFormValues["items"],
  input: { brand: string; name: string },
): ApplicationRecordFormValues["items"] {
  return [
    ...rows,
    {
      stepOrder: nextStepOrder(rows),
      suggestionStepId: null,
      inventoryProductId: null,
      productBrand: input.brand,
      productName: input.name,
      stepLabel: null,
      status: "applied",
      substitutedWithProductId: null,
      substitutionReason: null,
      isAdHoc: true,
      adHocBrand: input.brand,
      adHocName: input.name,
      notes: null,
      appliedAt: null,
    },
  ];
}

export function removeApplicationRecordRow(
  rows: ApplicationRecordFormValues["items"],
  stepOrder: number,
): ApplicationRecordFormValues["items"] {
  return rows.filter((row) => row.stepOrder !== stepOrder);
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

function nextStepOrder(rows: ApplicationRecordFormValues["items"]): number {
  return rows.reduce((max, row) => Math.max(max, row.stepOrder), -1) + 1;
}
