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
  RoutinePreferences,
  SkinBehavior,
  SkinProfile,
  SkinProfileOptions,
} from "@/types/skin-profile";
import { FieldHeader, SectionShell, chipClasses } from "./section-shared";
import type { SectionFormHandle } from "./medical-safety-section";
import {
  getSunPigmentFormValues,
  skinBehaviorSectionSchema,
} from "./section-form-schemas";

interface SunPigmentSectionProps {
  profile: SkinProfile;
  options: SkinProfileOptions;
  onPendingChange?: (pending: boolean) => void;
}

export const SunPigmentSection = forwardRef<
  SectionFormHandle,
  SunPigmentSectionProps
>(function SunPigmentSection({ profile, options, onPendingChange }, ref) {
  const t = useTranslations("skinProfile.sunPigment");
  const tOptions = useTranslations("skinProfile.options");
  const updateMutation = useUpdateSkinProfile();

  const form = useForm({
    defaultValues: getSunPigmentFormValues(profile),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => clearSubmitErrors(formApi),
    },
    validators: {
      onChange: skinBehaviorSectionSchema,
      onSubmit: skinBehaviorSectionSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(updateMutation.mutate, {
          fitzpatrickPhototype: value.fitzpatrickPhototype,
          skinBehavior: value.skinBehavior,
          routinePreferences: value.routinePreferences,
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

  const setPhototype = (value: string | null) => {
    form.setFieldValue("fitzpatrickPhototype", value);
  };

  const setBehaviorField = <K extends keyof SkinBehavior>(
    key: K,
    value: SkinBehavior[K] | null,
  ) => {
    form.setFieldValue("skinBehavior", (prev) => {
      const next = { ...prev };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const setRoutineField = <K extends keyof RoutinePreferences>(
    key: K,
    value: RoutinePreferences[K] | null,
  ) => {
    form.setFieldValue("routinePreferences", (prev) => {
      const next = { ...prev };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        submitError: state.errorMap.onSubmit,
      })}
    >
      {({ values, submitError }) => {
        const behavior = values.skinBehavior;
        const routinePrefs = values.routinePreferences;
        const formError = readSubmissionErrorMessage(submitError);

        return (
          <>
            <SectionShell>
              <ChipQuestion
                question={t("questionPhototype")}
                why={t("whyPhototype")}
                options={options.fitzpatrickPhototypes}
                selected={values.fitzpatrickPhototype ?? undefined}
                translate={tOptions}
                onToggle={(value) =>
                  setPhototype(
                    values.fitzpatrickPhototype === value ? null : value,
                  )
                }
                extraButton={{
                  label: t("preferNotToSay"),
                  selected: values.fitzpatrickPhototype === null,
                  onClick: () => setPhototype(null),
                }}
              />
              <ChipQuestion
                question={t("questionPih")}
                why={t("whyPih")}
                options={options.tendencyLevels}
                selected={behavior.pih_tendency}
                translate={tOptions}
                onToggle={(value) =>
                  setBehaviorField(
                    "pih_tendency",
                    behavior.pih_tendency === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionMelasma")}
                why={t("whyMelasma")}
                options={options.tendencyLevels}
                selected={behavior.melasma_tendency}
                translate={tOptions}
                onToggle={(value) =>
                  setBehaviorField(
                    "melasma_tendency",
                    behavior.melasma_tendency === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionKeloid")}
                why={t("whyKeloid")}
                options={options.tendencyLevels}
                selected={behavior.keloid_tendency}
                translate={tOptions}
                onToggle={(value) =>
                  setBehaviorField(
                    "keloid_tendency",
                    behavior.keloid_tendency === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionSunscreen")}
                why={t("whySunscreen")}
                options={options.sunscreenHabits}
                selected={behavior.sunscreen_habit}
                translate={tOptions}
                onToggle={(value) =>
                  setBehaviorField(
                    "sunscreen_habit",
                    behavior.sunscreen_habit === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionTolerance")}
                why={t("whyTolerance")}
                options={options.sunscreenTolerances}
                selected={behavior.sunscreen_tolerance}
                translate={tOptions}
                onToggle={(value) =>
                  setBehaviorField(
                    "sunscreen_tolerance",
                    behavior.sunscreen_tolerance === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionFilter")}
                why={t("whyFilter")}
                options={options.sunscreenFilters}
                selected={routinePrefs.sunscreen_filter}
                translate={tOptions}
                onToggle={(value) =>
                  setRoutineField(
                    "sunscreen_filter",
                    routinePrefs.sunscreen_filter === value ? null : value,
                  )
                }
              />
              <ChipQuestion
                question={t("questionFinish")}
                why={t("whyFinish")}
                options={options.sunscreenFinishes}
                selected={routinePrefs.sunscreen_finish}
                translate={tOptions}
                onToggle={(value) =>
                  setRoutineField(
                    "sunscreen_finish",
                    routinePrefs.sunscreen_finish === value ? null : value,
                  )
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
  translate,
  onToggle,
  extraButton,
}: {
  question: string;
  why: string;
  options: string[];
  selected?: string;
  translate: (value: string) => string;
  onToggle: (value: string) => void;
  extraButton?: {
    label: string;
    selected: boolean;
    onClick: () => void;
  };
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
            className={chipClasses(selected === value)}
          >
            {translate(value)}
          </button>
        ))}
        {extraButton ? (
          <button
            type="button"
            onClick={extraButton.onClick}
            className={chipClasses(extraButton.selected, true)}
          >
            {extraButton.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
