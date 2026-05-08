"use client";

import { useForm } from "@tanstack/react-form";
import { Check, Clock4, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ApplicationAddProductPanel } from "@/components/today-suggestion/application-add-product-panel";
import { ApplicationEditHistoryFooter } from "@/components/today-suggestion/application-edit-history-warning";
import {
  buildEditApplicationPayload,
  buildRecordApplicationPayload,
} from "@/components/today-suggestion/record-application-payload";
import {
  addOffShelfApplicationRecordRow,
  addShelfApplicationRecordRow,
  applicationRecordSheetKey,
  applicationRecordFormSchema,
  buildApplicationRecordDefaultValues,
  removeApplicationRecordRow,
  updateApplicationRecordRow,
  updateApplicationRecordRowStatus,
  type ApplicationRecordFormValues,
  type ApplicationRecordSheetMode,
} from "@/components/today-suggestion/record-application-form";
import {
  AppliedTimePicker,
  formatTargetDate,
} from "@/components/today-suggestion/record-application-sheet-helpers";
import { ApplicationRecordRow } from "@/components/today-suggestion/record-application-sheet-row";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useEditApplication,
  useRecordApplication,
} from "@/hooks/use-application-tracking";
import { formatIsoTime12h, formatSlotTime12h } from "@/lib/suggestion-daypart";
import type { ApplicationLog } from "@/types/application-tracking";
import type { SuggestionInstance } from "@/types/suggestions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ApplicationRecordSheetMode | null;
  onSaved?: (log: ApplicationLog) => void;
  timeZone?: string;
};

export function RecordApplicationSheet(props: Props) {
  const suggestion = props.mode?.slot.suggestion ?? null;
  if (!props.mode || !suggestion) return null;
  return (
    <RecordApplicationSheetForm
      key={applicationRecordSheetKey(props.mode)}
      {...props}
      mode={props.mode}
      suggestion={suggestion}
    />
  );
}

function RecordApplicationSheetForm({
  open,
  onOpenChange,
  mode,
  onSaved,
  suggestion,
  timeZone,
}: Props & {
  mode: ApplicationRecordSheetMode;
  suggestion: SuggestionInstance;
}) {
  const t = useTranslations("todaysSuggestion.recordSheet");
  const recordMutation = useRecordApplication();
  const editMutation = useEditApplication();
  const isEdit = mode.kind === "edit";
  const isSaving = recordMutation.isPending || editMutation.isPending;

  const imagesByStepOrder = useMemo(() => {
    const map = new Map<number, string | null>();
    for (const step of suggestion.steps) {
      map.set(step.stepOrder, step.product?.imageUrl ?? null);
    }
    return map;
  }, [suggestion.steps]);

  const formattedTargetDate = useMemo(
    () => formatTargetDate(suggestion.targetDate),
    [suggestion.targetDate],
  );

  const form = useForm({
    defaultValues: buildApplicationRecordDefaultValues(
      mode,
      suggestion,
      timeZone,
    ),
    validators: {
      onChange: applicationRecordFormSchema,
      onSubmit: applicationRecordFormSchema,
    },
    onSubmit: ({ value }) => {
      submitApplication(value);
    },
  });

  function submitApplication(value: ApplicationRecordFormValues) {
    if (mode.kind === "edit") {
      editMutation.mutate(
        {
          id: mode.existingLog.id,
          payload: buildEditApplicationPayload(suggestion, value),
        },
        { onSuccess: (log) => saveDone(log, onSaved, onOpenChange) },
      );
      return;
    }

    recordMutation.mutate(
      buildRecordApplicationPayload(mode.slot, suggestion, value),
      { onSuccess: (log) => saveDone(log, onSaved, onOpenChange) },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92vh] flex-col rounded-t-3xl border-t border-border p-0 sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[min(540px,calc(100vw-2rem))] sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          noValidate
        >
          <div className="mx-auto mt-2 h-1 w-9 rounded bg-[color:var(--border-strong)]" />
          <header className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
            <div className="min-w-0">
              <SheetTitle className="text-lg font-bold">
                {isEdit ? t("editTitle") : t("recordTitle")}
              </SheetTitle>
              <SheetDescription className="mt-1 text-xs text-muted">
                {mode.kind === "edit"
                  ? t("editSubtitle", {
                      time: formatSlotTime12h(suggestion.targetTime),
                      firstRecordedAt: formatIsoTime12h(
                        mode.existingLog.firstRecordedAt,
                        timeZone,
                      ),
                    })
                  : t("recordSubtitle", {
                      time: formatSlotTime12h(suggestion.targetTime),
                      count: suggestion.steps.length,
                    })}
              </SheetDescription>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            {mode.kind === "edit" ? (
              <ApplicationEditHistoryFooter
                existingLog={mode.existingLog}
                t={t}
                timeZone={timeZone}
              />
            ) : null}

            <form.Field name="appliedTime">
              {(field) => (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Clock4 className="h-3.5 w-3.5 text-muted" />
                  <span className="text-xs text-muted">{t("appliedAt")}</span>
                  <AppliedTimePicker
                    value={field.state.value}
                    disabled={isSaving}
                    onChange={(next) => field.handleChange(next)}
                    onBlur={field.handleBlur}
                    ariaLabel={t("appliedAt")}
                  />
                  <span className="ml-auto text-xs text-muted">
                    {formattedTargetDate}
                  </span>
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.items}>
              {(items) => (
                <ul className="mt-3 flex flex-col">
                  {items.map((row) => (
                    <ApplicationRecordRow
                      key={row.stepOrder}
                      row={row}
                      imageUrl={imagesByStepOrder.get(row.stepOrder) ?? null}
                      disabled={isSaving}
                      onChangeStatus={(status) =>
                        form.setFieldValue(
                          "items",
                          updateApplicationRecordRowStatus(
                            items,
                            row.stepOrder,
                            status,
                          ),
                        )
                      }
                      onPatch={(patch) =>
                        form.setFieldValue(
                          "items",
                          updateApplicationRecordRow(
                            items,
                            row.stepOrder,
                            patch,
                          ),
                        )
                      }
                      onRemove={
                        row.suggestionStepId
                          ? undefined
                          : () =>
                              form.setFieldValue(
                                "items",
                                removeApplicationRecordRow(
                                  items,
                                  row.stepOrder,
                                ),
                              )
                      }
                      t={t}
                    />
                  ))}
                </ul>
              )}
            </form.Subscribe>

            <form.Subscribe selector={(state) => state.values.items}>
              {(items) => (
                <ApplicationAddProductPanel
                  disabled={isSaving}
                  onAddShelfProduct={(product) =>
                    form.setFieldValue(
                      "items",
                      addShelfApplicationRecordRow(items, product),
                    )
                  }
                  onAddOffShelfProduct={(input) =>
                    form.setFieldValue(
                      "items",
                      addOffShelfApplicationRecordRow(items, input),
                    )
                  }
                />
              )}
            </form.Subscribe>

            <form.Field name="generalNotes">
              {(field) => (
                <div className="mt-4">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {t("notesLabel")}
                  </label>
                  <textarea
                    rows={3}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSaving}
                    placeholder={t("notesPlaceholder")}
                    className="mt-1.5 w-full resize-y rounded-2xl border border-[color:var(--border-strong)] bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                  />
                </div>
              )}
            </form.Field>

            {isEdit ? (
              <form.Field name="editReason">
                {(field) => (
                  <div className="mt-4">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t("editReasonLabel")}
                    </label>
                    <textarea
                      rows={2}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      disabled={isSaving}
                      placeholder={t("editReasonPlaceholder")}
                      className="mt-1.5 w-full resize-y rounded-2xl border border-[color:var(--border-strong)] bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    />
                  </div>
                )}
              </form.Field>
            ) : null}
          </div>

          <footer className="flex flex-col gap-2 border-t border-border px-5 pb-8 pt-4">
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button
                  type="submit"
                  disabled={isSaving || !canSubmit}
                  className="w-full border border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-none hover:bg-[color:var(--accent-strong)] hover:opacity-100"
                >
                  {isSaving ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <>
                      {isEdit ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {isEdit ? t("saveChanges") : t("saveRecord")}
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
            {isEdit ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="w-full bg-transparent font-medium shadow-none hover:bg-surface-muted hover:text-foreground"
              >
                {t("discard")}
              </Button>
            ) : null}
            {!isEdit ? (
              <p className="text-center text-[11px] leading-snug text-muted">
                {t("recordLegal")}
              </p>
            ) : null}
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function saveDone(
  log: ApplicationLog,
  onSaved: Props["onSaved"],
  onOpenChange: Props["onOpenChange"],
): void {
  onSaved?.(log);
  onOpenChange(false);
}
