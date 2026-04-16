"use client";

import { useForm } from "@tanstack/react-form";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { ContextStepFields } from "@/components/skin-profile/context-step-fields";
import { KnownSensitivitiesField } from "@/components/skin-profile/known-sensitivities-field";
import { OptionChipGroup } from "@/components/skin-profile/option-chip-group";
import { RoutineComplexityStep } from "@/components/skin-profile/routine-complexity-step";
import { StepActions } from "@/components/skin-profile/step-actions";
import { StepProgressBar } from "@/components/skin-profile/step-progress-bar";
import {
  useCreateSkinProfile,
  useUpdateSkinProfile,
} from "@/hooks/use-skin-profile";
import { firstFieldError, type FieldIssue } from "@/lib/form-errors";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";
import {
  buildSkinProfilePayload,
  getSkinProfileFormValues,
  hasLocationData,
  skinProfileSchema,
  TOTAL_SKIN_PROFILE_STEPS,
  type SkinProfileFormValues,
} from "./skin-profile-form.constants";
import type { SkinProfile, SkinProfileOptions } from "@/types/skin-profile";

interface SkinProfileFormProps {
  existingProfile?: SkinProfile | null;
  options: SkinProfileOptions;
  initialStep?: number;
  onCancel?: () => void;
  onSaved?: () => void;
}

type SingleSelectField =
  | "skinType"
  | "skinTone"
  | "ageRange"
  | "ethnicity"
  | "routineComplexity";

type MultiSelectField = "currentConcerns" | "skinGoals";
type StringField =
  | "skinType"
  | "skinTone"
  | "ageRange"
  | "ethnicity"
  | "countryCode"
  | "city"
  | "routineComplexity";

type SkinProfileFieldMeta = Partial<
  Record<keyof SkinProfileFormValues, { errors?: ReadonlyArray<FieldIssue> }>
>;

function getFieldError(
  fieldMeta: SkinProfileFieldMeta,
  field: keyof SkinProfileFormValues,
  translate: (key: string) => string,
): string | undefined {
  return firstFieldError(fieldMeta[field]?.errors, translate);
}

export function SkinProfileForm({
  existingProfile = null,
  options,
  initialStep = 1,
  onCancel,
  onSaved,
}: SkinProfileFormProps) {
  const t = useTranslations("skinProfile");
  const createProfile = useCreateSkinProfile();
  const updateProfile = useUpdateSkinProfile();

  const isEdit = Boolean(existingProfile);
  const mutation = isEdit ? updateProfile : createProfile;

  const [step, setStep] = useState(() => clampStep(initialStep));
  const [sensitivityInput, setSensitivityInput] = useState("");

  const form = useForm({
    defaultValues: getSkinProfileFormValues(existingProfile),
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: skinProfileSchema,
      onSubmit: skinProfileSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(
          mutation.mutate,
          buildSkinProfilePayload(value, existingProfile, isEdit),
        );

        if (result.error !== null) {
          return getSkinProfileSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      onSaved?.();
    },
  });

  const translateOption = useCallback(
    (value: string) => t(`options.${value}`),
    [t],
  );

  const updateStringField = (field: StringField, value: string) => {
    form.setFieldValue(field, value);

    if (
      (field === "countryCode" || field === "city") &&
      !hasLocationData(
        field === "countryCode" ? String(value) : form.getFieldValue("countryCode"),
        field === "city" ? String(value) : form.getFieldValue("city"),
      )
    ) {
      form.setFieldValue("locationConsent", false);
    }
  };

  const updateBooleanField = (
    field: "locationConsent",
    value: boolean,
  ) => {
    form.setFieldValue(field, value);
  };

  const toggleSingleSelect = (field: SingleSelectField, value: string) => {
    form.setFieldValue(field, (previous) => (previous === value ? "" : value));
  };

  const toggleMultiSelect = (field: MultiSelectField, value: string) => {
    form.setFieldValue(field, (previous) =>
      previous.includes(value)
        ? previous.filter((entry) => entry !== value)
        : [...previous, value],
    );
  };

  const addSensitivity = () => {
    const trimmed = sensitivityInput.trim();
    if (!trimmed) {
      return;
    }

    let wasAdded = false;

    form.setFieldValue("knownSensitivities", (previous) => {
      const alreadyExists = previous.some(
        (entry) => entry.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
      );

      if (alreadyExists) {
        return previous;
      }

      wasAdded = true;
      return [...previous, trimmed];
    });

    if (wasAdded) {
      setSensitivityInput("");
    }
  };

  const removeSensitivity = (value: string) => {
    form.setFieldValue("knownSensitivities", (previous) =>
      previous.filter((entry) => entry !== value),
    );
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1:
        return Boolean(form.getFieldValue("skinType"));
      case 4:
        return Boolean(form.getFieldValue("routineComplexity"));
      default:
        return true;
    }
  };

  const isEditMode = Boolean(onCancel);

  const handleBack = () => setStep((currentStep) => Math.max(1, currentStep - 1));

  const handleContinue = () => {
    if (mutation.isPending || !canContinue()) {
      return;
    }

    if (isEditMode || step === TOTAL_SKIN_PROFILE_STEPS) {
      void form.handleSubmit();
      return;
    }

    setStep((currentStep) =>
      Math.min(TOTAL_SKIN_PROFILE_STEPS, currentStep + 1),
    );
  };

  const handleSkip = () => {
    if (mutation.isPending) {
      return;
    }

    void form.handleSubmit();
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        fieldMeta: state.fieldMeta as SkinProfileFieldMeta,
        submitError: state.errorMap.onSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ values, fieldMeta, submitError, isSubmitting }) => {
        const formError = readSubmissionErrorMessage(submitError);
        const showLocationConsent = hasLocationData(
          values.countryCode,
          values.city,
        );

        return (
          <div className="mx-auto max-w-xl">
            <StepProgressBar
              currentStep={step}
              totalSteps={TOTAL_SKIN_PROFILE_STEPS}
            />

            <div className="mt-8">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {t(`steps.${stepKey(step)}.heading`)}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {t(`steps.${stepKey(step)}.description`)}
              </p>
            </div>

            <div className="mt-8">
              {step === 1 ? (
                <>
                  <OptionChipGroup
                    options={options.skinTypes}
                    values={values.skinType ? [values.skinType] : []}
                    onToggle={(value) => toggleSingleSelect("skinType", value)}
                    translateOption={translateOption}
                    multiSelect={false}
                  />
                  {getFieldError(fieldMeta, "skinType", t) ? (
                    <p className="mt-4 text-sm text-danger" role="alert">
                      {getFieldError(fieldMeta, "skinType", t)}
                    </p>
                  ) : null}
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <OptionChipGroup
                    options={options.concerns}
                    values={values.currentConcerns}
                    onToggle={(value) =>
                      toggleMultiSelect("currentConcerns", value)
                    }
                    translateOption={translateOption}
                  />
                  {getFieldError(fieldMeta, "currentConcerns", t) ? (
                    <p className="mt-4 text-sm text-danger" role="alert">
                      {getFieldError(fieldMeta, "currentConcerns", t)}
                    </p>
                  ) : null}
                  <KnownSensitivitiesField
                    inputValue={sensitivityInput}
                    values={values.knownSensitivities}
                    errorText={getFieldError(fieldMeta, "knownSensitivities", t)}
                    onInputChange={setSensitivityInput}
                    onAdd={addSensitivity}
                    onRemove={removeSensitivity}
                  />
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <OptionChipGroup
                    options={options.goals}
                    values={values.skinGoals}
                    onToggle={(value) => toggleMultiSelect("skinGoals", value)}
                    translateOption={translateOption}
                  />
                  {getFieldError(fieldMeta, "skinGoals", t) ? (
                    <p className="mt-4 text-sm text-danger" role="alert">
                      {getFieldError(fieldMeta, "skinGoals", t)}
                    </p>
                  ) : null}
                </>
              ) : null}

              {step === 4 ? (
                <RoutineComplexityStep
                  options={options.complexities}
                  selectedValue={values.routineComplexity}
                  errorText={getFieldError(fieldMeta, "routineComplexity", t)}
                  onChange={(value) => updateStringField("routineComplexity", value)}
                />
              ) : null}

              {step === 5 ? (
                <ContextStepFields
                  options={options}
                  skinTone={values.skinTone}
                  ageRange={values.ageRange}
                  ethnicity={values.ethnicity}
                  countryCode={values.countryCode}
                  city={values.city}
                  locationConsent={values.locationConsent}
                  showConsent={showLocationConsent}
                  countryCodeError={getFieldError(fieldMeta, "countryCode", t)}
                  cityError={getFieldError(fieldMeta, "city", t)}
                  locationConsentError={getFieldError(
                    fieldMeta,
                    "locationConsent",
                    t,
                  )}
                  onSkinToneChange={(value) => updateStringField("skinTone", value)}
                  onAgeRangeChange={(value) => updateStringField("ageRange", value)}
                  onEthnicityChange={(value) => updateStringField("ethnicity", value)}
                  onCountryCodeChange={(value) =>
                    updateStringField("countryCode", value)
                  }
                  onCityChange={(value) => updateStringField("city", value)}
                  onLocationConsentChange={(value) =>
                    updateBooleanField("locationConsent", value)
                  }
                />
              ) : null}

              {formError ? (
                <p className="mt-4 text-sm text-danger" role="alert">
                  {formError}
                </p>
              ) : null}
            </div>

            <StepActions
              step={step}
              totalSteps={TOTAL_SKIN_PROFILE_STEPS}
              canContinue={canContinue()}
              isSubmitting={isSubmitting || mutation.isPending}
              isOptionalStep={step === TOTAL_SKIN_PROFILE_STEPS}
              onBack={handleBack}
              onContinue={handleContinue}
              onSkip={handleSkip}
              onCancel={onCancel}
            />
          </div>
        );
      }}
    </form.Subscribe>
  );
}

function stepKey(step: number): string {
  const keys = ["skinType", "concerns", "goals", "routine", "context"];
  return keys[step - 1] ?? "skinType";
}

function clampStep(step: number): number {
  return Math.min(Math.max(step, 1), TOTAL_SKIN_PROFILE_STEPS);
}
