"use client";

import { useForm } from "@tanstack/react-form";
import { Check, Clock4, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { ApplicationAddProductPanel } from "@/components/today-suggestion/application-add-product-panel";
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
  ApplicationEditHistoryFooter,
  ApplicationRecordRow,
} from "@/components/today-suggestion/record-application-sheet-row";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useApplicationLogVersions,
  useEditApplication,
  useRecordApplication,
} from "@/hooks/use-application-tracking";
import {
  formatIsoTime12h,
  formatSlotTime12h,
} from "@/lib/suggestion-daypart";
import type { ApplicationLog } from "@/types/application-tracking";
import type { SuggestionInstance } from "@/types/suggestions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ApplicationRecordSheetMode | null;
  onSaved?: (log: ApplicationLog) => void;
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
}: Props & { mode: ApplicationRecordSheetMode; suggestion: SuggestionInstance }) {
  const t = useTranslations("todaysSuggestion.recordSheet");
  const recordMutation = useRecordApplication();
  const editMutation = useEditApplication();
  const isEdit = mode.kind === "edit";
  const versions = useApplicationLogVersions(
    mode.kind === "edit" ? mode.existingLog.id : null,
  );
  const isSaving = recordMutation.isPending || editMutation.isPending;

  const form = useForm({
    defaultValues: buildApplicationRecordDefaultValues(mode, suggestion),
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
        className="flex max-h-[92vh] flex-col rounded-t-3xl border-t border-border p-0 sm:mx-auto sm:max-w-[540px] sm:rounded-3xl"
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
                isLoadingVersions={versions.isLoading}
                t={t}
                versions={versions.data ?? []}
              />
            ) : null}

            <form.Field name="appliedTime">
              {(field) => (
                <div className="mt-1 flex items-center gap-2">
                  <Clock4 className="h-3.5 w-3.5 text-muted" />
                  <span className="text-xs text-muted">{t("appliedAt")}</span>
                  <input
                    type="time"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSaving}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground"
                  />
                  <span className="ml-auto text-xs text-muted">
                    {suggestion.targetDate}
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
                    className="mt-1.5 w-full resize-y rounded-2xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground"
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
                      className="mt-1.5 w-full resize-y rounded-2xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground"
                    />
                  </div>
                )}
              </form.Field>
            ) : null}
          </div>

          <footer className="flex flex-col gap-2 border-t border-border px-5 pb-5 pt-3.5">
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button
                  type="submit"
                  disabled={isSaving || !canSubmit}
                  className="w-full"
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
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="w-full"
              >
                {t("discard")}
              </Button>
            ) : null}
            <p className="text-center text-[11px] leading-snug text-muted">
              {mode.kind === "edit"
                ? t("editLegal", { count: mode.existingLog.editCount })
                : t("recordLegal")}
            </p>
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
