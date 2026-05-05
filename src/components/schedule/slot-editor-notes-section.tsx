"use client";

import { useTranslations } from "next-intl";
import { firstFieldError, type FieldIssue } from "@/lib/form-errors";
import { SlotMode } from "@/types/schedule";
import { shouldShowFieldError } from "./slot-editor-content.utils";
import { SlotNotesField } from "./slot-notes-field";

type SlotEditorNotesSectionProps = {
  disabled?: boolean;
  errors: ReadonlyArray<FieldIssue>;
  id: string;
  isDirty: boolean;
  isTouched: boolean;
  mode: SlotMode;
  onBlur: () => void;
  onChange: (value: string) => void;
  showAllErrors: boolean;
  value: string;
};

export function SlotEditorNotesSection({
  disabled,
  errors,
  id,
  isDirty,
  isTouched,
  mode,
  onBlur,
  onChange,
  showAllErrors,
  value,
}: SlotEditorNotesSectionProps) {
  const t = useTranslations("schedule");
  const showError = shouldShowFieldError(showAllErrors, isTouched, isDirty);
  const errorText = showError ? firstFieldError(errors, t) : undefined;
  return (
    <section className="border-b border-border px-5 py-4">
      <SlotNotesField
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        mode={mode}
        disabled={disabled}
        errorText={errorText}
      />
    </section>
  );
}
