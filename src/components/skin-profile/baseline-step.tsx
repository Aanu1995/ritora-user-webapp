"use client";

import { useTranslations } from "next-intl";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { BirthdayPicker } from "@/components/ui/birthday-picker";
import { FieldRow } from "./essential-field-row";
import {
  type SharedStepProps,
} from "./essential-form-types";

export function BaselineStep({
  values,
  options,
  dateOfBirthField,
  errors,
  toggleSingleSelect,
  translateOption,
}: SharedStepProps & {
  dateOfBirthField: {
    value: string;
    errorText?: string;
    onBlur: () => void;
    onChange: (value: string) => void;
  };
  errors: Partial<Record<string, string>>;
}) {
  const tLabels = useTranslations("skinProfile.baselineLabels");

  return (
    <>
      <FieldRow label={tLabels("skinType")} hint={tLabels("skinTypeHint")}>
        <OptionChipGroup
          options={options.skinTypes}
          values={values.skinType ? [values.skinType] : []}
          onToggle={(value) => toggleSingleSelect("skinType", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.skinType ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.skinType}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tLabels("skinTone")}>
        <OptionChipGroup
          options={options.skinTones}
          values={values.skinTone ? [values.skinTone] : []}
          onToggle={(value) => toggleSingleSelect("skinTone", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.skinTone ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.skinTone}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tLabels("dateOfBirth")}>
        <BirthdayPicker
          value={dateOfBirthField.value}
          onChange={dateOfBirthField.onChange}
          onBlur={dateOfBirthField.onBlur}
          ariaLabel={tLabels("dateOfBirth")}
          errorText={dateOfBirthField.errorText ?? errors.dateOfBirth}
        />
      </FieldRow>

      <FieldRow label={tLabels("sexAtBirth")} hint={tLabels("sexAtBirthHint")}>
        <OptionChipGroup
          options={options.sexAtBirth}
          values={values.sexAtBirth ? [values.sexAtBirth] : []}
          onToggle={(value) => toggleSingleSelect("sexAtBirth", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.sexAtBirth ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.sexAtBirth}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tLabels("ethnicity")} hint={tLabels("ethnicityHint")}>
        <OptionChipGroup
          options={options.ethnicities}
          values={values.ethnicity ? [values.ethnicity] : []}
          onToggle={(value) => toggleSingleSelect("ethnicity", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.ethnicity ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.ethnicity}
          </p>
        ) : null}
      </FieldRow>
    </>
  );
}
