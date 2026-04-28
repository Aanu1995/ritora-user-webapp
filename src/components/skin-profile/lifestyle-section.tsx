"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useUpdateSkinProfile } from "@/hooks/use-skin-profile";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";
import type {
  LifestyleContext,
  SkinProfile,
  SkinProfileOptions,
} from "@/types/skin-profile";
import { FieldHeader, SectionShell, chipClasses } from "./section-shared";
import type { SectionFormHandle } from "./medical-safety-section";
import { SkinProfileValue } from "./skin-profile-domain-values";
import {
  getLifestyleFormValues,
  lifestyleSectionSchema,
} from "./section-form-schemas";

interface LifestyleSectionProps {
  profile: SkinProfile;
  options: SkinProfileOptions;
  onPendingChange?: (pending: boolean) => void;
}

const DIET_FLAG_TRANSLATION_KEYS: Record<string, string> = {
  vegan: "vegan_diet",
};

export const LifestyleSection = forwardRef<
  SectionFormHandle,
  LifestyleSectionProps
>(function LifestyleSection({ profile, options, onPendingChange }, ref) {
  const t = useTranslations("skinProfile.lifestyle");
  const tOptions = useTranslations("skinProfile.options");
  const updateMutation = useUpdateSkinProfile();

  const form = useForm({
    defaultValues: getLifestyleFormValues(profile),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => clearSubmitErrors(formApi),
    },
    validators: {
      onChange: lifestyleSectionSchema,
      onSubmit: lifestyleSectionSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(updateMutation.mutate, {
          lifestyleContext: value.lifestyleContext,
        });

        if (result.error !== null) {
          return getSkinProfileSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      form.reset(value);
      releaseGuard();
      toast.success(t("saved"));
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: isFormDirty,
  });

  useEffect(() => {
    onPendingChange?.(updateMutation.isPending);
  }, [updateMutation.isPending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      void form.handleSubmit();
    },
  }));

  const setField = <K extends keyof LifestyleContext>(
    key: K,
    value: LifestyleContext[K] | null,
  ) => {
    form.setFieldValue("lifestyleContext", (prev) => {
      const next = { ...prev };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const toggleStringList = (
    key: "diet_flags" | "climate_sensitivities",
    value: string,
  ) => {
    form.setFieldValue("lifestyleContext", (prev) => {
      const list = prev[key] ?? [];
      const updated = list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];
      return { ...prev, [key]: updated };
    });
  };

  const dietLabel = (value: string) =>
    tOptions(DIET_FLAG_TRANSLATION_KEYS[value] ?? value);

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        submitError: state.errorMap.onSubmit,
      })}
    >
      {({ values, submitError }) => {
        const lifestyle = values.lifestyleContext;
        const formError = readSubmissionErrorMessage(submitError);

        return (
          <>
            <SectionShell>
              <ChipQuestion
                question={t("questionSleep")}
                why={t("whySleep")}
                options={options.sleepLevels}
                selected={lifestyle.sleep}
                translate={tOptions}
                onToggle={(value) =>
                  setField("sleep", lifestyle.sleep === value ? null : value)
                }
              />
              <ChipQuestion
                question={t("questionStress")}
                why={t("whyStress")}
                options={options.stressLevels}
                selected={lifestyle.stress}
                translate={tOptions}
                onToggle={(value) =>
                  setField("stress", lifestyle.stress === value ? null : value)
                }
              />
              <ChipQuestion
                question={t("questionWater")}
                why={t("whyWater")}
                options={options.waterIntakeLevels}
                selected={lifestyle.water_intake}
                translate={tOptions}
                onToggle={(value) =>
                  setField(
                    "water_intake",
                    lifestyle.water_intake === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionDiet")}
                why={t("whyDiet")}
                options={options.dietFlags}
                selectedList={lifestyle.diet_flags ?? []}
                translate={dietLabel}
                onToggle={(value) => toggleStringList("diet_flags", value)}
              />
              <ChipQuestion
                question={t("questionSmoking")}
                why={t("whySmoking")}
                options={options.smokingLevels}
                selected={lifestyle.smoking}
                translate={(value) =>
                  tOptions(
                    value === SkinProfileValue.None
                      ? SkinProfileValue.No
                      : value,
                  )
                }
                onToggle={(value) =>
                  setField(
                    "smoking",
                    lifestyle.smoking === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionAlcohol")}
                why={t("whyAlcohol")}
                options={options.alcoholLevels}
                selected={lifestyle.alcohol}
                translate={(value) =>
                  tOptions(
                    value === SkinProfileValue.None
                      ? SkinProfileValue.No
                      : value,
                  )
                }
                onToggle={(value) =>
                  setField(
                    "alcohol",
                    lifestyle.alcohol === value ? null : value,
                  )
                }
              />
              <BooleanQuestion
                question={t("questionMask")}
                why={t("whyMask")}
                value={lifestyle.mask_wearing}
                yesLabel={tOptions(SkinProfileValue.YesActively)}
                noLabel={tOptions(SkinProfileValue.No)}
                onChange={(value) => setField("mask_wearing", value)}
              />
              <BooleanQuestion
                question={t("questionShaving")}
                why={t("whyShaving")}
                value={lifestyle.shaving}
                yesLabel={tOptions(SkinProfileValue.YesActively)}
                noLabel={tOptions(SkinProfileValue.No)}
                onChange={(value) => setField("shaving", value)}
              />
              <ChipQuestion
                question={t("questionClimate")}
                why={t("whyClimate")}
                options={options.climateSensitivities}
                selectedList={lifestyle.climate_sensitivities ?? []}
                translate={tOptions}
                onToggle={(value) =>
                  toggleStringList("climate_sensitivities", value)
                }
              />
            </SectionShell>

            {formError ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}
          </>
        );
      }}
    </form.Subscribe>
  );
});

function ChipQuestion({
  question,
  why,
  options,
  selected,
  selectedList = [],
  translate,
  onToggle,
}: {
  question: string;
  why: string;
  options: string[];
  selected?: string;
  selectedList?: string[];
  translate: (value: string) => string;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-3 py-5">
      <FieldHeader question={question} why={why} />
      <div className="flex flex-wrap gap-1.5">
        {options.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={chipClasses(
              selected === value || selectedList.includes(value),
            )}
          >
            {translate(value)}
          </button>
        ))}
      </div>
    </div>
  );
}

function BooleanQuestion({
  question,
  why,
  value,
  yesLabel,
  noLabel,
  onChange,
}: {
  question: string;
  why: string;
  value?: boolean;
  yesLabel: string;
  noLabel: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-3 py-5">
      <FieldHeader question={question} why={why} />
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={chipClasses(value === true)}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={chipClasses(value === false)}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}
