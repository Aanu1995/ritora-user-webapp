"use client";

import { useTranslations } from "next-intl";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { FieldRow } from "./essential-field-row";
import type { SharedStepProps, SkinProfileStringField } from "./essential-form-types";

type Props = SharedStepProps & {
  setStringField: (field: SkinProfileStringField, value: string) => void;
  errors: Partial<Record<string, string>>;
};

export function EnvironmentStep({
  values,
  options,
  setStringField,
  translateOption,
  errors,
}: Props) {
  const t = useTranslations("skinProfile.environment");

  return (
    <>
      <FieldRow label={t("waterHardnessLabel")} hint={t("waterHardnessHint")}>
        <OptionChipGroup
          options={options.waterHardnessLevels}
          values={[values.waterHardness]}
          onToggle={(value) => setStringField("waterHardness", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.waterHardness ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.waterHardness}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow
        label={t("waterSensitivityLabel")}
        hint={t("waterSensitivityHint")}
      >
        <OptionChipGroup
          options={options.waterSensitivityLevels}
          values={[values.waterSensitivity]}
          onToggle={(value) => setStringField("waterSensitivity", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.waterSensitivity ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.waterSensitivity}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={t("waterNotesLabel")} hint={t("waterNotesHint")}>
        <textarea
          value={values.waterReactionNotes}
          onChange={(event) =>
            setStringField("waterReactionNotes", event.target.value)
          }
          rows={3}
          placeholder={t("waterNotesPlaceholder")}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {errors.waterReactionNotes ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.waterReactionNotes}
          </p>
        ) : null}
      </FieldRow>
    </>
  );
}
