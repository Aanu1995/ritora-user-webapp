"use client";

import { useTranslations } from "next-intl";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { FieldRow } from "./essential-field-row";
import type {
  SharedStepProps,
  SkinProfileBooleanField,
} from "./essential-form-types";
import { TriStateBooleanValue } from "./skin-profile-domain-values";

export function PreferencesStep({
  values,
  options,
  toggleSingleSelect,
  setBoolField,
  translateOption,
  errors,
}: SharedStepProps & {
  setBoolField: (field: SkinProfileBooleanField, value: boolean) => void;
  errors: Partial<Record<string, string>>;
}) {
  const tStep = useTranslations("skinProfile.preferences");

  const yesNoOptions = [TriStateBooleanValue.Yes, TriStateBooleanValue.No];
  const translateYesNo = (value: string) =>
    value === TriStateBooleanValue.Yes ? tStep("yes") : tStep("no");

  return (
    <>
      <FieldRow
        label={tStep("fragranceFreeLabel")}
        hint={tStep("fragranceFreeHint")}
      >
        <OptionChipGroup
          options={yesNoOptions}
          values={values.fragranceFree ? [values.fragranceFree] : []}
          onToggle={(value) => toggleSingleSelect("fragranceFree", value)}
          translateOption={translateYesNo}
          multiSelect={false}
        />
        {errors.fragranceFree ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.fragranceFree}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow
        label={tStep("nonComedogenicLabel")}
        hint={tStep("nonComedogenicHint")}
      >
        <OptionChipGroup
          options={yesNoOptions}
          values={values.nonComedogenic ? [values.nonComedogenic] : []}
          onToggle={(value) => toggleSingleSelect("nonComedogenic", value)}
          translateOption={translateYesNo}
          multiSelect={false}
        />
        {errors.nonComedogenic ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.nonComedogenic}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow
        label={tStep("sunscreenFilterLabel")}
        hint={tStep("sunscreenFilterHint")}
      >
        <OptionChipGroup
          options={options.sunscreenFilters}
          values={values.sunscreenFilter ? [values.sunscreenFilter] : []}
          onToggle={(value) => toggleSingleSelect("sunscreenFilter", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.sunscreenFilter ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.sunscreenFilter}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow
        label={tStep("sunscreenFinishLabel")}
        hint={tStep("sunscreenFinishHint")}
      >
        <OptionChipGroup
          options={options.sunscreenFinishes}
          values={values.sunscreenFinish ? [values.sunscreenFinish] : []}
          onToggle={(value) => toggleSingleSelect("sunscreenFinish", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.sunscreenFinish ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.sunscreenFinish}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={tStep("budgetTierLabel")} hint={tStep("budgetTierHint")}>
        <OptionChipGroup
          options={options.budgetTiers}
          values={values.budgetTier ? [values.budgetTier] : []}
          onToggle={(value) => toggleSingleSelect("budgetTier", value)}
          translateOption={translateOption}
          multiSelect={false}
        />
        {errors.budgetTier ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.budgetTier}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow
        label={tStep("allowSmartPicksLabel")}
        hint={tStep("allowSmartPicksHint")}
      >
        <div className="flex gap-1.5">
          <SmartPickButton
            selected={values.allowSmartPicks === true}
            label={tStep("yes")}
            onClick={() => setBoolField("allowSmartPicks", true)}
          />
          <SmartPickButton
            selected={values.allowSmartPicks === false}
            label={tStep("no")}
            onClick={() => setBoolField("allowSmartPicks", false)}
          />
        </div>
        {errors.allowSmartPicks ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {errors.allowSmartPicks}
          </p>
        ) : null}
      </FieldRow>
    </>
  );
}

function SmartPickButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer",
        selected
          ? "border-accent-strong bg-accent-soft text-accent-strong"
          : "border-border text-foreground hover:border-accent/40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
