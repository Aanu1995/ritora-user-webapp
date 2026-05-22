"use client";

import { useTranslations } from "next-intl";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { FieldRow } from "./essential-field-row";
import type {
  SharedStepProps,
  SkinProfileStringArrayField,
} from "./essential-form-types";

export function ConcernsPriorityStep({
  values,
  options,
  toggleMultiSelect,
  toggleSingleSelect,
  translateOption,
  onConcernSeverityChange,
  errors,
}: SharedStepProps & {
  toggleMultiSelect: (
    field: SkinProfileStringArrayField,
    value: string,
  ) => void;
  onConcernSeverityChange: (concern: string, severity: string) => void;
  errors: Partial<Record<string, string>>;
}) {
  const tStep = useTranslations("skinProfile.concernsPriority");

  return (
    <>
      <FieldRow label={tStep("concernsLabel")} hint={tStep("concernsHint")}>
        <OptionChipGroup
          options={options.concerns}
          values={values.currentConcerns}
          onToggle={(value) => toggleMultiSelect("currentConcerns", value)}
          translateOption={translateOption}
        />
        {errors.currentConcerns ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.currentConcerns}
          </p>
        ) : null}
      </FieldRow>

      {values.currentConcerns.length > 0 ? (
        <div className="space-y-5 py-5">
          {values.currentConcerns.map((concern) => (
            <div key={concern}>
              <p className="text-sm font-semibold text-foreground">
                {tStep("severityLabel", {
                  concern: translateOption(concern),
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {options.reactionSeverities.map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => onConcernSeverityChange(concern, severity)}
                    className={[
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer",
                      values.concernSeverities[concern] === severity
                        ? "border-accent-strong bg-accent-soft text-accent-strong"
                        : "border-border text-foreground hover:border-accent/40",
                    ].join(" ")}
                  >
                    {translateOption(severity)}
                  </button>
                ))}
              </div>
              {errors[`concernSeverities.${concern}`] ? (
                <p className="mt-2 text-sm text-danger" role="alert">
                  {errors[`concernSeverities.${concern}`]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {values.currentConcerns.length > 0 ? (
        <FieldRow
          label={tStep("primaryGoalLabel")}
          hint={tStep("primaryGoalHint")}
        >
          <OptionChipGroup
            options={values.currentConcerns}
            values={values.primaryGoal ? [values.primaryGoal] : []}
            onToggle={(value) => toggleSingleSelect("primaryGoal", value)}
            translateOption={translateOption}
            multiSelect={false}
          />
          {errors.primaryGoal ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {errors.primaryGoal}
            </p>
          ) : null}
        </FieldRow>
      ) : null}
    </>
  );
}
