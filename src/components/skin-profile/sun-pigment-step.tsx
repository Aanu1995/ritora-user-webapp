"use client";

import { useTranslations } from "next-intl";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { FieldRow } from "./essential-field-row";
import type { SharedStepProps } from "./essential-form-types";

export function SunPigmentStep({
  values,
  options,
  toggleSingleSelect,
  translateOption,
  errors,
}: SharedStepProps & {
  errors: Partial<Record<string, string>>;
}) {
  const tStep = useTranslations("skinProfile.sunPigmentStep");

  return (
    <>
      <FieldRow label={tStep("phototypeQuestion")}>
        <OptionChipGroup
          options={options.fitzpatrickPhototypes}
          values={
            values.fitzpatrickPhototype ? [values.fitzpatrickPhototype] : []
          }
          onToggle={(value) =>
            toggleSingleSelect("fitzpatrickPhototype", value)
          }
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.fitzpatrickPhototype ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.fitzpatrickPhototype}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tStep("pihQuestion")} hint={tStep("pihHint")}>
        <OptionChipGroup
          options={options.tendencyLevels}
          values={values.pihTendency ? [values.pihTendency] : []}
          onToggle={(value) => toggleSingleSelect("pihTendency", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.pihTendency ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.pihTendency}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tStep("melasmaQuestion")} hint={tStep("melasmaHint")}>
        <OptionChipGroup
          options={options.tendencyLevels}
          values={values.melasmaTendency ? [values.melasmaTendency] : []}
          onToggle={(value) => toggleSingleSelect("melasmaTendency", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.melasmaTendency ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.melasmaTendency}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tStep("keloidQuestion")} hint={tStep("keloidHint")}>
        <OptionChipGroup
          options={options.tendencyLevels}
          values={values.keloidTendency ? [values.keloidTendency] : []}
          onToggle={(value) => toggleSingleSelect("keloidTendency", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.keloidTendency ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.keloidTendency}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tStep("sunscreenHabitQuestion")}>
        <OptionChipGroup
          options={options.sunscreenHabits}
          values={values.sunscreenHabit ? [values.sunscreenHabit] : []}
          onToggle={(value) => toggleSingleSelect("sunscreenHabit", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.sunscreenHabit ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.sunscreenHabit}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tStep("sunscreenToleranceQuestion")}>
        <OptionChipGroup
          options={options.sunscreenTolerances}
          values={values.sunscreenTolerance ? [values.sunscreenTolerance] : []}
          onToggle={(value) =>
            toggleSingleSelect("sunscreenTolerance", value)
          }
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.sunscreenTolerance ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.sunscreenTolerance}
          </p>
        ) : null}
      </FieldRow>
    </>
  );
}
