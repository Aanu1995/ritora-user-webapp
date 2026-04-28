"use client";

import { useTranslations } from "next-intl";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { FieldRow } from "./essential-field-row";
import type { SharedStepProps } from "./essential-form-types";

export function RoutineBaselineStep({
  values,
  options,
  toggleSingleSelect,
  translateOption,
  errors,
}: SharedStepProps & {
  errors: Partial<Record<string, string>>;
}) {
  const tStep = useTranslations("skinProfile.routineBaseline");

  return (
    <FieldRow label={tStep("paceLabel")} hint={tStep("paceHint")}>
      <OptionChipGroup
        options={options.routinePaces}
        values={values.routinePace ? [values.routinePace] : []}
        onToggle={(value) => toggleSingleSelect("routinePace", value)}
        translateOption={translateOption}
        multiSelect={false}
      />
      {errors.routinePace ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {errors.routinePace}
        </p>
      ) : null}
    </FieldRow>
  );
}
