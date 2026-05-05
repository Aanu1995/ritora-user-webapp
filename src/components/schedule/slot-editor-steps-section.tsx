"use client";

import { useTranslations } from "next-intl";
import { firstFieldError, type FieldIssue } from "@/lib/form-errors";
import type {
  RoutineStepInput,
  RoutineStepProductSummary,
} from "@/types/schedule";
import { RoutineStepList } from "./routine-step-list";
import { shouldShowFieldError } from "./slot-editor-content.utils";

type SlotEditorStepsSectionProps = {
  errors: ReadonlyArray<FieldIssue>;
  isDirty: boolean;
  isTouched: boolean;
  onChange: (steps: RoutineStepInput[]) => void;
  onProductPicked: (picked: RoutineStepProductSummary) => void;
  onProductPickerClose?: () => void;
  productLookup: Map<string, RoutineStepProductSummary>;
  showAllErrors: boolean;
  steps: RoutineStepInput[];
};

export function SlotEditorStepsSection({
  errors,
  isDirty,
  isTouched,
  onChange,
  onProductPicked,
  onProductPickerClose,
  productLookup,
  showAllErrors,
  steps,
}: SlotEditorStepsSectionProps) {
  const t = useTranslations("schedule");
  const showError = shouldShowFieldError(showAllErrors, isTouched, isDirty);
  const errorText = showError ? firstFieldError(errors, t) : undefined;
  return (
    <section className="px-5 py-4">
      <RoutineStepList
        steps={steps}
        productLookup={productLookup}
        onChange={onChange}
        onProductPicked={onProductPicked}
        onProductPickerClose={onProductPickerClose}
        errorText={errorText}
      />
    </section>
  );
}
