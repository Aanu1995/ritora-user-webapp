'use client';

import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LocationStepFields } from '@/components/skin-profile/location-step-fields';
import { RoutineComplexityStep } from '@/components/skin-profile/routine-complexity-step';
import { StepActions } from '@/components/skin-profile/step-actions';
import { StepIndicator } from '@/components/skin-profile/step-indicator';
import { KnownSensitivitiesField } from '@/components/skin-profile/known-sensitivities-field';
import { OptionChipGroup } from '@/components/skin-profile/option-chip-group';
import { ProfileSelectField } from '@/components/skin-profile/profile-select-field';
import { AppRoute } from '@/constants/app-routes';
import {
  useCreateSkinProfile,
  useUpdateSkinProfile,
} from '@/hooks/use-skin-profile';
import { firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import { getSkinProfileSubmitError } from '@/lib/skin-profile-submit-errors';
import { getSkinProfileSetupStatus } from '@/lib/skin-profile-setup';
import type { SkinProfile, SkinProfileOptions } from '@/types/skin-profile';
import {
  buildSkinProfilePayload,
  getSkinProfileFormValues,
  hasLocationData,
  skinProfileSchema,
  TOTAL_SKIN_PROFILE_STEPS,
  type Step3ErrorKind,
  validateLocationStep,
} from './skin-profile-form.constants';

interface SkinProfileFormProps {
  existingProfile?: SkinProfile | null;
  options: SkinProfileOptions;
}

export function SkinProfileForm({
  existingProfile = null,
  options,
}: SkinProfileFormProps) {
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('skinProfile');
  const router = useRouter();
  const createProfile = useCreateSkinProfile();
  const updateProfile = useUpdateSkinProfile();
  const [step, setStep] = useState(1);
  const [sensitivityInput, setSensitivityInput] = useState('');
  const [step3Error, setStep3Error] = useState<Step3ErrorKind>(null);

  const isEdit = Boolean(existingProfile);
  const setupStatus = getSkinProfileSetupStatus(existingProfile);
  const mutation = isEdit ? updateProfile : createProfile;
  const translateOption = (value: string) => tProfile(`options.${value}`);

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
        const payload = buildSkinProfilePayload(value, existingProfile, isEdit);
        const result = await executeMutation(mutation.mutate, payload);

        if (result.error !== null) {
          return getSkinProfileSubmitError(result.error, tProfile);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      router.push(AppRoute.Dashboard);
    },
  });

  const addSensitivity = () => {
    const trimmed = sensitivityInput.trim();
    if (!trimmed) {
      return;
    }

    const current = form.state.values.knownSensitivities;
    if (current.includes(trimmed)) {
      setSensitivityInput('');
      return;
    }

    form.setFieldValue('knownSensitivities', [...current, trimmed]);
    setSensitivityInput('');
  };

  const removeSensitivity = (value: string) => {
    form.setFieldValue(
      'knownSensitivities',
      form.state.values.knownSensitivities.filter((item) => item !== value),
    );
  };

  const handleOptionToggle = (
    fieldName: 'currentConcerns' | 'skinGoals',
    value: string,
  ) => {
    const current = form.state.values[fieldName];
    form.setFieldValue(
      fieldName,
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const handleNext = () => {
    if (step === 3) {
      const result = validateLocationStep(form.state.values);
      if (result) {
        setStep3Error(result);
        return;
      }
      setStep3Error(null);
    }

    setStep((current) => current + 1);
  };

  const handleBack = () => {
    setStep3Error(null);
    setStep((current) => current - 1);
  };

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <h1 className="font-display text-4xl tracking-tight">
        {isEdit
          ? setupStatus.isCoreComplete
            ? tProfile('editTitle')
            : tProfile('continueTitle')
          : tProfile('createTitle')}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {tProfile('step', { current: step, total: TOTAL_SKIN_PROFILE_STEPS })}
      </p>

      <StepIndicator
        currentStep={step}
        totalSteps={TOTAL_SKIN_PROFILE_STEPS}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="mt-8 space-y-6"
        noValidate
      >
        {step === 1 ? (
          <>
            <form.Field name="skinType">
              {(field) => (
                <ProfileSelectField
                  id={field.name}
                  label={tProfile('skinType')}
                  value={field.state.value}
                  options={options.skinTypes}
                  placeholder={tCommon('selectPlaceholder')}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  translateOption={translateOption}
                />
              )}
            </form.Field>

            <form.Field name="skinTone">
              {(field) => (
                <ProfileSelectField
                  id={field.name}
                  label={tProfile('skinTone')}
                  value={field.state.value}
                  options={options.skinTones}
                  placeholder={tCommon('selectPlaceholder')}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  translateOption={translateOption}
                />
              )}
            </form.Field>

            <form.Field name="ageRange">
              {(field) => (
                <ProfileSelectField
                  id={field.name}
                  label={tProfile('ageRange')}
                  value={field.state.value}
                  options={options.ageRanges}
                  placeholder={tCommon('selectPlaceholder')}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  translateOption={translateOption}
                />
              )}
            </form.Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <OptionChipGroup
              label={tProfile('concerns')}
              options={options.concerns}
              values={form.state.values.currentConcerns}
              onToggle={(value) => handleOptionToggle('currentConcerns', value)}
              translateOption={translateOption}
            />

            <OptionChipGroup
              label={tProfile('goals')}
              options={options.goals}
              values={form.state.values.skinGoals}
              onToggle={(value) => handleOptionToggle('skinGoals', value)}
              translateOption={translateOption}
            />

            <KnownSensitivitiesField
              label={tProfile('sensitivities')}
              placeholder={tProfile('sensitivityPlaceholder')}
              addLabel={tProfile('addSensitivity')}
              emptyLabel={tProfile('noSensitivities')}
              removeLabel={(value) =>
                tProfile('removeSensitivityLabel', { value })
              }
              inputValue={sensitivityInput}
              values={form.state.values.knownSensitivities}
              onInputChange={setSensitivityInput}
              onInputKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addSensitivity();
                }
              }}
              onAdd={addSensitivity}
              onRemove={removeSensitivity}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <form.Subscribe
              selector={(state) => ({
                countryCode: state.values.countryCode,
                city: state.values.city,
                locationConsent: state.values.locationConsent,
              })}
            >
              {({ countryCode, city, locationConsent }) => (
                <form.Field name="ethnicity">
                  {(ethnicityField) => (
                    <form.Field name="countryCode">
                      {(countryField) => (
                        <form.Field name="city">
                          {(cityField) => (
                            <form.Field name="locationConsent">
                              {(locationConsentField) => (
                                <LocationStepFields
                                  ethnicityLabel={tProfile('ethnicity')}
                                  ethnicityValue={ethnicityField.state.value}
                                  ethnicityOptions={options.ethnicities}
                                  countryLabel={tProfile('country')}
                                  countryHelp={tProfile('countryHelp')}
                                  countryPlaceholder={tProfile(
                                    'countryPlaceholder',
                                  )}
                                  countryValue={countryCode}
                                  countryError={
                                    countryField.state.meta.isTouched ||
                                    countryField.state.meta.isDirty ||
                                    step3Error === 'country'
                                      ? firstFieldError(
                                          countryField.state.meta.errors,
                                          tProfile,
                                        )
                                      : undefined
                                  }
                                  cityLabel={tProfile('city')}
                                  cityPlaceholder={tProfile('cityPlaceholder')}
                                  cityValue={city}
                                  locationConsentLabel={tProfile(
                                    'locationConsent',
                                  )}
                                  locationConsentValue={locationConsent}
                                  showLocationConsent={hasLocationData(
                                    countryCode,
                                    city,
                                  )}
                                  onEthnicityBlur={ethnicityField.handleBlur}
                                  onEthnicityChange={ethnicityField.handleChange}
                                  onCountryBlur={countryField.handleBlur}
                                  onCountryChange={(value) =>
                                    countryField.handleChange(
                                      value.toUpperCase().slice(0, 2),
                                    )
                                  }
                                  onCityBlur={cityField.handleBlur}
                                  onCityChange={cityField.handleChange}
                                  onLocationConsentChange={
                                    locationConsentField.handleChange
                                  }
                                  translateOption={translateOption}
                                  selectPlaceholder={tCommon(
                                    'selectPlaceholder',
                                  )}
                                />
                              )}
                            </form.Field>
                          )}
                        </form.Field>
                      )}
                    </form.Field>
                  )}
                </form.Field>
              )}
            </form.Subscribe>
            {step3Error === 'consent' ? (
              <p className="text-sm text-danger" role="alert">
                {tProfile('validation.locationConsentRequired')}
              </p>
            ) : null}
          </>
        ) : null}

        {step === 4 ? (
          <RoutineComplexityStep
            label={tProfile('routineComplexity')}
            values={options.complexities}
            selectedValue={form.state.values.routineComplexity}
            onChange={(value) => form.setFieldValue('routineComplexity', value)}
            translateOption={translateOption}
          />
        ) : null}

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(submitError) => {
            const message = readSubmissionErrorMessage(submitError);

            return message ? (
              <p className="text-sm text-danger" role="alert">
                {message}
              </p>
            ) : null;
          }}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <StepActions
              step={step}
              totalSteps={TOTAL_SKIN_PROFILE_STEPS}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              isPending={mutation.isPending}
              backLabel={tCommon('back')}
              nextLabel={tCommon('next')}
              saveLabel={tProfile('saveProfile')}
              savingLabel={tProfile('savingProfile')}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
