'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateSkinProfile,
  useSkinProfile,
  useSkinProfileOptions,
  useUpdateSkinProfile,
} from '@/hooks/use-skin-profile';
import { useRouter } from '@/i18n/navigation';
import type { SkinProfileInput } from '@/types/skin-profile';

const selectFieldClass =
  'block w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]';

type SkinProfileFormValues = {
  skinType: string;
  skinTone: string;
  ageRange: string;
  ethnicity: string;
  currentConcerns: string[];
  knownSensitivities: string[];
  skinGoals: string[];
  countryCode: string;
  city: string;
  routineComplexity: string;
  locationConsent: boolean;
};

export default function SkinProfilePage() {
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('skinProfile');
  const router = useRouter();
  const profile = useSkinProfile();
  const options = useSkinProfileOptions();
  const createProfile = useCreateSkinProfile();
  const updateProfile = useUpdateSkinProfile();
  const [step, setStep] = useState(1);
  const [sensitivityInput, setSensitivityInput] = useState('');

  const formSchema = z
    .object({
      skinType: z.string(),
      skinTone: z.string(),
      ageRange: z.string(),
      ethnicity: z.string(),
      currentConcerns: z.array(z.string()),
      knownSensitivities: z.array(z.string()),
      skinGoals: z.array(z.string()),
      countryCode: z
        .string()
        .max(2)
        .refine((value) => !value || /^[A-Za-z]{2}$/.test(value), {
          message: 'invalid_country_code',
        }),
      city: z.string().max(100),
      routineComplexity: z.string(),
      locationConsent: z.boolean(),
    })
    .superRefine((value, ctx) => {
      const hasLocationData = Boolean(value.countryCode.trim() || value.city.trim());
      if (hasLocationData && !value.locationConsent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['locationConsent'],
          message: 'location_consent_required',
        });
      }
    });

  const {
    register,
    watch,
    setValue,
    getValues,
    reset,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SkinProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skinType: '',
      skinTone: '',
      ageRange: '',
      ethnicity: '',
      currentConcerns: [],
      knownSensitivities: [],
      skinGoals: [],
      countryCode: '',
      city: '',
      routineComplexity: '',
      locationConsent: false,
    },
  });

  useEffect(() => {
    if (!profile.data) {
      return;
    }

    reset({
      skinType: profile.data.skinType ?? '',
      skinTone: profile.data.skinTone ?? '',
      ageRange: profile.data.ageRange ?? '',
      ethnicity: profile.data.ethnicity ?? '',
      currentConcerns: profile.data.currentConcerns,
      knownSensitivities: profile.data.knownSensitivities,
      skinGoals: profile.data.skinGoals,
      countryCode: profile.data.countryCode ?? '',
      city: profile.data.city ?? '',
      routineComplexity: profile.data.routineComplexity ?? '',
      locationConsent: Boolean(profile.data.countryCode || profile.data.city),
    });
  }, [profile.data, reset]);

  const isEdit = Boolean(profile.data);
  const mutation = isEdit ? updateProfile : createProfile;
  const totalSteps = 4;
  const countryCode = watch('countryCode');
  const city = watch('city');
  const currentConcerns = watch('currentConcerns');
  const knownSensitivities = watch('knownSensitivities');
  const skinGoals = watch('skinGoals');
  const routineComplexity = watch('routineComplexity');
  const hasLocationData = Boolean(countryCode.trim() || city.trim());

  const toggleSelection = (
    field: 'currentConcerns' | 'skinGoals',
    value: string,
  ) => {
    const existing = getValues(field);
    const next = existing.includes(value)
      ? existing.filter((item) => item !== value)
      : [...existing, value];

    setValue(field, next, { shouldDirty: true, shouldValidate: true });
  };

  const addSensitivity = () => {
    const trimmed = sensitivityInput.trim();
    if (!trimmed) {
      return;
    }

    const nextValues = Array.from(
      new Set([...getValues('knownSensitivities'), trimmed]),
    );

    setValue('knownSensitivities', nextValues, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSensitivityInput('');
  };

  const removeSensitivity = (value: string) => {
    setValue(
      'knownSensitivities',
      getValues('knownSensitivities').filter((item) => item !== value),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const toNullableSelect = (
    value: string,
    previous: string | null | undefined,
  ): string | null | undefined => {
    if (value) {
      return value;
    }

    if (previous !== null && previous !== undefined) {
      return null;
    }

    return undefined;
  };

  const toNullableString = (
    value: string,
    previous: string | null | undefined,
  ): string | null | undefined => {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }

    if (previous !== null && previous !== undefined) {
      return null;
    }

    return undefined;
  };

  const onSubmit = handleSubmit(async (values) => {
    const existingProfile = profile.data;
    const payload: SkinProfileInput = {
      skinType: toNullableSelect(values.skinType, existingProfile?.skinType),
      skinTone: toNullableSelect(values.skinTone, existingProfile?.skinTone),
      ageRange: toNullableSelect(values.ageRange, existingProfile?.ageRange),
      ethnicity: toNullableSelect(values.ethnicity, existingProfile?.ethnicity),
      routineComplexity: toNullableSelect(
        values.routineComplexity,
        existingProfile?.routineComplexity,
      ),
      currentConcerns:
        isEdit || values.currentConcerns.length > 0
          ? values.currentConcerns
          : undefined,
      knownSensitivities:
        isEdit || values.knownSensitivities.length > 0
          ? values.knownSensitivities
          : undefined,
      skinGoals:
        isEdit || values.skinGoals.length > 0 ? values.skinGoals : undefined,
      countryCode: toNullableString(
        values.countryCode.toUpperCase(),
        existingProfile?.countryCode,
      ),
      city: toNullableString(values.city, existingProfile?.city),
    };

    const nextHasLocationData = Boolean(
      (payload.countryCode ?? '').trim() || (payload.city ?? '').trim(),
    );

    if (nextHasLocationData) {
      payload.locationConsent = values.locationConsent;
    }

    try {
      await mutation.mutateAsync(payload);
      router.push('/dashboard');
    } catch {
      // mutation state renders the server error
    }
  });

  const chipClass = (active: boolean) =>
    `inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm transition ${
      active
        ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent-strong)]'
        : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]'
    }`;

  const translateOption = (value: string) => tProfile(`options.${value}`);

  if (options.isPending || (profile.isPending && !profile.isError)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  if (!options.data) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl tracking-tight">
        {isEdit ? tProfile('editTitle') : tProfile('createTitle')}
      </h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        {tProfile('step', { current: step, total: totalSteps })}
      </p>

      <div className="mt-2 flex gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < step ? 'bg-[color:var(--color-accent)]' : 'bg-[color:var(--color-border)]'}`}
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium" htmlFor="skinType">
                {tProfile('skinType')}
              </label>
              <select
                id="skinType"
                {...register('skinType')}
                className={selectFieldClass}
              >
                <option value="">{tCommon('selectPlaceholder')}</option>
                {options.data.skinTypes.map((value) => (
                  <option key={value} value={value}>
                    {translateOption(value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="skinTone">
                {tProfile('skinTone')}
              </label>
              <select
                id="skinTone"
                {...register('skinTone')}
                className={selectFieldClass}
              >
                <option value="">{tCommon('selectPlaceholder')}</option>
                {options.data.skinTones.map((value) => (
                  <option key={value} value={value}>
                    {translateOption(value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="ageRange">
                {tProfile('ageRange')}
              </label>
              <select
                id="ageRange"
                {...register('ageRange')}
                className={selectFieldClass}
              >
                <option value="">{tCommon('selectPlaceholder')}</option>
                {options.data.ageRanges.map((value) => (
                  <option key={value} value={value}>
                    {translateOption(value)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium">
                {tProfile('concerns')}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.data.concerns.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSelection('currentConcerns', value)}
                    className={chipClass(currentConcerns.includes(value))}
                  >
                    {translateOption(value)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">
                {tProfile('goals')}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.data.goals.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSelection('skinGoals', value)}
                    className={chipClass(skinGoals.includes(value))}
                  >
                    {translateOption(value)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="sensitivityInput">
                {tProfile('sensitivities')}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="sensitivityInput"
                  type="text"
                  value={sensitivityInput}
                  onChange={(event) => setSensitivityInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSensitivity();
                    }
                  }}
                  placeholder={tProfile('sensitivityPlaceholder')}
                  className={`${selectFieldClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={addSensitivity}
                  className="rounded-xl border border-[color:var(--color-border)] px-4 py-3 text-sm font-semibold transition hover:border-[color:var(--color-accent)]"
                >
                  {tProfile('addSensitivity')}
                </button>
              </div>
              {knownSensitivities.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {knownSensitivities.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => removeSensitivity(value)}
                      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm text-[color:var(--color-foreground)]"
                      aria-label={tProfile('removeSensitivityLabel', { value })}
                    >
                      <span>{value}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                  {tProfile('noSensitivities')}
                </p>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium" htmlFor="ethnicity">
                {tProfile('ethnicity')}
              </label>
              <select
                id="ethnicity"
                {...register('ethnicity')}
                className={selectFieldClass}
              >
                <option value="">{tCommon('selectPlaceholder')}</option>
                {options.data.ethnicities.map((value) => (
                  <option key={value} value={value}>
                    {translateOption(value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="countryCode">
                {tProfile('country')}
              </label>
              <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                {tProfile('countryHelp')}
              </p>
              <input
                id="countryCode"
                type="text"
                value={countryCode}
                onChange={(event) =>
                  setValue(
                    'countryCode',
                    event.target.value.toUpperCase().slice(0, 2),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
                placeholder={tProfile('countryPlaceholder')}
                className={`${selectFieldClass} mt-2`}
              />
              {errors.countryCode && (
                <p className="mt-1 text-xs text-red-600">
                  {tProfile('locationConsentRequired')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="city">
                {tProfile('city')}
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                placeholder={tProfile('cityPlaceholder')}
                className={selectFieldClass}
              />
            </div>

            {hasLocationData && (
              <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 p-4">
                <input
                  type="checkbox"
                  {...register('locationConsent')}
                  className="mt-1 h-4 w-4 rounded border-[color:var(--color-border)] accent-[color:var(--color-accent)]"
                />
                <span className="text-sm text-[color:var(--color-muted)]">
                  {tProfile('locationConsent')}
                </span>
              </label>
            )}
            {errors.locationConsent && (
              <p className="text-sm text-red-600">
                {tProfile('locationConsentRequired')}
              </p>
            )}
          </>
        )}

        {step === 4 && (
          <div>
            <label className="block text-sm font-medium">
              {tProfile('routineComplexity')}
            </label>
            <div className="mt-3 space-y-3">
              {options.data.complexities.map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                    routineComplexity === value
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/5'
                      : 'border-[color:var(--color-border)]'
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('routineComplexity')}
                    className="accent-[color:var(--color-accent)]"
                  />
                  <span className="text-sm font-medium">
                    {translateOption(value)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as any)?.body?.message ?? tProfile('failedToSave')}
          </p>
        )}

        <div className="flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="rounded-xl border border-[color:var(--color-border)] px-6 py-3 text-sm font-semibold transition hover:border-[color:var(--color-accent)]"
            >
              {tCommon('back')}
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={async () => {
                if (step === 3) {
                  const valid = await trigger([
                    'countryCode',
                    'city',
                    'locationConsent',
                  ]);

                  if (!valid) {
                    return;
                  }
                }

                setStep((current) => current + 1);
              }}
              className="rounded-xl bg-[color:var(--color-foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90"
            >
              {tCommon('next')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-[color:var(--color-foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending
                ? tProfile('savingProfile')
                : tProfile('saveProfile')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
