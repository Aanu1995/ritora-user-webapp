"use client";

import { useTranslations } from "next-intl";
import { TimePicker } from "@/components/ui/time-picker";
import { firstFieldError, type FieldIssue } from "@/lib/form-errors";
import { shouldShowFieldError } from "./slot-editor-content.utils";

type SlotEditorTimeFieldProps = {
  errors: ReadonlyArray<FieldIssue>;
  isDirty: boolean;
  isTouched: boolean;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  showAllErrors: boolean;
  value: string;
};

export function SlotEditorTimeField({
  errors,
  isDirty,
  isTouched,
  name,
  onBlur,
  onChange,
  showAllErrors,
  value,
}: SlotEditorTimeFieldProps) {
  const t = useTranslations("schedule");
  const showError = shouldShowFieldError(showAllErrors, isTouched, isDirty);
  const errorText = showError ? firstFieldError(errors, t) : undefined;
  return (
    <>
      <div className="mt-1 flex items-center gap-2">
        <TimePicker
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          invalid={Boolean(errorText)}
          ariaLabel={t("addDialog.timeLabel")}
          ariaDescribedBy={errorText ? `${name}-error` : undefined}
          className="inline-flex h-9 w-auto min-w-[120px] gap-1.5 rounded-lg border border-border bg-surface-muted/60 px-3 py-1.5 text-lg font-bold transition hover:border-accent hover:bg-surface-muted focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
        />
        <span className="text-[11px] text-muted">
          {t("editor.timeEditHint")}
        </span>
      </div>
      {errorText ? (
        <p
          id={`${name}-error`}
          className="mt-2 text-xs font-medium text-danger"
          role="alert"
        >
          {errorText}
        </p>
      ) : null}
    </>
  );
}
