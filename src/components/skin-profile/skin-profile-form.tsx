"use client";

import { useForm, useStore } from "@tanstack/react-form";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StepProgressBar } from "@/components/skin-profile/step-progress-bar";
import { Button } from "@/components/ui/button";
import {
  useCreateSkinProfile,
  useUpdateSkinProfile,
} from "@/hooks/use-skin-profile";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { firstFieldError } from "@/lib/form-errors";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";
import {
  buildSkinProfilePayload,
  getSkinProfileFormValues,
  skinProfileSchema,
  TOTAL_SKIN_PROFILE_STEPS,
  type SkinProfileFormValues,
} from "./skin-profile-form.constants";
import {
  ALL_STEP_NUMBERS,
  STEP_KEYS,
  clampStep,
  getValidationErrors,
} from "./skin-profile-form-validation";
import { isEssentialStepComplete } from "./essential-step-validation";
import { BaselineStep } from "./baseline-step";
import { ConcernsPriorityStep } from "./concerns-priority-step";
import { PreferencesStep } from "./preferences-step";
import { RoutineBaselineStep } from "./routine-baseline-step";
import { SunPigmentStep } from "./sun-pigment-step";
import type {
  SkinProfileBooleanField,
  SkinProfileStringArrayField,
  SkinProfileStringField,
} from "./essential-form-types";
import type { SkinProfile, SkinProfileOptions } from "@/types/skin-profile";

interface SkinProfileFormProps {
  existingProfile?: SkinProfile | null;
  options: SkinProfileOptions;
  initialStep?: number;
  onCancel?: () => void;
  onSaved?: () => void;
  onPendingChange?: (pending: boolean) => void;
}

export interface SkinProfileFormHandle {
  submit: () => void;
}

export const SkinProfileForm = forwardRef<
  SkinProfileFormHandle,
  SkinProfileFormProps
>(function SkinProfileForm(
  {
    existingProfile = null,
    options,
    initialStep = 1,
    onCancel,
    onSaved,
    onPendingChange,
  },
  ref,
) {
  const t = useTranslations("skinProfile");
  const createProfile = useCreateSkinProfile();
  const updateProfile = useUpdateSkinProfile();

  const isEdit = Boolean(existingProfile);
  const mutation = isEdit ? updateProfile : createProfile;

  const [step, setStep] = useState(() => clampStep(initialStep));
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(
    () => new Set(),
  );
  const formTopRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    defaultValues: getSkinProfileFormValues(existingProfile),
    canSubmitWhenInvalid: true,
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
    onSubmit: ({ value }) => {
      form.reset(value);
      releaseGuard();
      onSaved?.();
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: isEdit && isFormDirty,
  });

  useEffect(() => {
    onPendingChange?.(mutation.isPending);
  }, [mutation.isPending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      setAttemptedSteps(new Set(ALL_STEP_NUMBERS));
      void form.handleSubmit();
    },
  }));

  const translateOption = useCallback(
    (value: string) => t(`options.${value}`),
    [t],
  );

  const setBoolField = (field: SkinProfileBooleanField, value: boolean) => {
    clearSubmitErrors(form);
    form.setFieldValue(field, value);
  };

  const toggleSingleSelect = (
    field: SkinProfileStringField,
    value: string,
  ) => {
    clearSubmitErrors(form);
    const previous = form.getFieldValue(field);
    form.setFieldValue(field, previous === value ? "" : value);
  };

  const toggleMultiSelect = (
    field: SkinProfileStringArrayField,
    value: string,
  ) => {
    clearSubmitErrors(form);
    const list = form.getFieldValue(field);
    const isRemoving = list.includes(value);
    const next = isRemoving
      ? list.filter((entry) => entry !== value)
      : [...list, value];

    if (field === "currentConcerns" && isRemoving) {
      if (form.getFieldValue("primaryGoal") === value) {
        form.setFieldValue("primaryGoal", "");
      }
      const severities = { ...form.getFieldValue("concernSeverities") };
      delete severities[value];
      form.setFieldValue("concernSeverities", severities);
    }

    form.setFieldValue(field, next);
  };

  const setConcernSeverity = (concern: string, severity: string) => {
    clearSubmitErrors(form);
    const severities = { ...form.getFieldValue("concernSeverities") };
    severities[concern] = severities[concern] === severity ? "" : severity;
    form.setFieldValue("concernSeverities", severities);
  };

  const isEditMode = Boolean(onCancel);

  const scrollToFormTop = () => {
    window.requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    });
  };

  const handleBack = () => {
    setStep((current) => Math.max(1, current - 1));
    scrollToFormTop();
  };

  const handleContinue = (values: SkinProfileFormValues) => {
    if (mutation.isPending) return;

    setAttemptedSteps((current) => new Set(current).add(step));

    if (!isEssentialStepComplete(step, values)) return;

    if (step === TOTAL_SKIN_PROFILE_STEPS) {
      setAttemptedSteps(new Set(ALL_STEP_NUMBERS));
      void form.handleSubmit();
      return;
    }

    setStep((current) => Math.min(TOTAL_SKIN_PROFILE_STEPS, current + 1));
    scrollToFormTop();
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        submitError: state.errorMap.onSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ values, submitError, isSubmitting }) => {
        const formError = readSubmissionErrorMessage(submitError);
        const stepInfo = STEP_KEYS[step - 1];

        const isFirstStep = step === 1;
        const isLastStep = step === TOTAL_SKIN_PROFILE_STEPS;
        const showSaveLabel = isLastStep;
        const stepErrors = attemptedSteps.has(step)
          ? getValidationErrors(values, t)
          : {};

        return (
          <div ref={formTopRef} className="mx-auto max-w-3xl scroll-mt-32">
            {!isEditMode ? (
              <div className="sticky top-[88px] z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto flex max-w-3xl items-start gap-3">
                  {!isFirstStep ? (
                    <button
                      type="button"
                      aria-label={t("steps.back")}
                      onClick={handleBack}
                      disabled={isSubmitting || mutation.isPending}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  ) : null}
                  <div className="mt-3 min-w-0 flex-1">
                    <StepProgressBar
                      currentStep={step}
                      totalSteps={TOTAL_SKIN_PROFILE_STEPS}
                    />
                  </div>
                  <div className="flex shrink-0 items-start gap-2 pl-16">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleContinue(values)}
                      disabled={isSubmitting || mutation.isPending}
                      className="gap-1.5 bg-accent text-white hover:bg-accent-strong"
                    >
                      {isSubmitting || mutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      {showSaveLabel
                        ? isSubmitting || mutation.isPending
                          ? t("steps.saving")
                          : t("steps.save")
                        : t("steps.continue")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {t(`steps.${stepInfo}.heading`)}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {t(`steps.${stepInfo}.description`)}
                </p>
              </div>

              <div className="divide-y divide-border px-6">
                {step === 1 ? (
                  <form.Field name="dateOfBirth">
                    {(dateOfBirthField) => (
                      <BaselineStep
                        values={values}
                        options={options}
                        dateOfBirthField={{
                          value: dateOfBirthField.state.value,
                          errorText:
                            dateOfBirthField.state.meta.isTouched ||
                            dateOfBirthField.state.meta.isDirty
                              ? firstFieldError(
                                  dateOfBirthField.state.meta.errors,
                                  t,
                                )
                              : undefined,
                          onBlur: dateOfBirthField.handleBlur,
                          onChange: (next) => {
                            clearSubmitErrors(form);
                            dateOfBirthField.handleChange(next);
                          },
                        }}
                        errors={stepErrors}
                        toggleSingleSelect={toggleSingleSelect}
                        translateOption={translateOption}
                      />
                    )}
                  </form.Field>
                ) : null}

                {step === 2 ? (
                  <ConcernsPriorityStep
                    values={values}
                    options={options}
                    toggleMultiSelect={toggleMultiSelect}
                    toggleSingleSelect={toggleSingleSelect}
                    translateOption={translateOption}
                    onConcernSeverityChange={setConcernSeverity}
                    errors={stepErrors}
                  />
                ) : null}

                {step === 3 ? (
                  <SunPigmentStep
                    values={values}
                    options={options}
                    toggleSingleSelect={toggleSingleSelect}
                    translateOption={translateOption}
                    errors={stepErrors}
                  />
                ) : null}

                {step === 4 ? (
                  <RoutineBaselineStep
                    values={values}
                    options={options}
                    toggleSingleSelect={toggleSingleSelect}
                    translateOption={translateOption}
                    errors={stepErrors}
                  />
                ) : null}

                {step === 5 ? (
                  <PreferencesStep
                    values={values}
                    options={options}
                    toggleSingleSelect={toggleSingleSelect}
                    setBoolField={setBoolField}
                    translateOption={translateOption}
                    errors={stepErrors}
                  />
                ) : null}
              </div>
            </div>

            {formError ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}
          </div>
        );
      }}
    </form.Subscribe>
  );
});
