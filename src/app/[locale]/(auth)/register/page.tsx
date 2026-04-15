'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRegister } from '@/hooks/use-auth';
import { Link, useRouter } from '@/i18n/navigation';

const passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/;
const supportedLocales = ['en', 'sv'] as const;
type SupportedLocale = (typeof supportedLocales)[number];

function normalizeLocale(locale: string): SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'en';
}

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = normalizeLocale(useLocale());
  const registerUser = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = z
    .object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      email: z.string().email(),
      password: z.string().regex(passwordPattern),
      confirmPassword: z.string().min(1),
      termsAccepted: z.boolean(),
      privacyPolicyAccepted: z.boolean(),
    })
    .superRefine((value, ctx) => {
      if (value.password !== value.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'password_mismatch',
        });
      }

      if (!value.termsAccepted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['termsAccepted'],
          message: 'terms_required',
        });
      }

      if (!value.privacyPolicyAccepted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['privacyPolicyAccepted'],
          message: 'privacy_required',
        });
      }
    });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      privacyPolicyAccepted: false,
    },
  });

  const passwordValue = watch('password');
  const termsAccepted = watch('termsAccepted');
  const privacyPolicyAccepted = watch('privacyPolicyAccepted');
  const consentsComplete = termsAccepted && privacyPolicyAccepted;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser.mutateAsync({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        preferredLanguage: locale,
        termsAccepted: values.termsAccepted,
        privacyPolicyAccepted: values.privacyPolicyAccepted,
      });
      router.push('/dashboard');
    } catch {
      // mutation state renders the server error
    }
  });

  const inputClass =
    'mt-1 block w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/30';
  const labelClass =
    'block text-sm font-medium text-[color:var(--color-foreground)]';

  return (
    <div>
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          {t('signUpTitle')}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          {t('signUpSubtitle')}
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              {t('firstName')}
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              {...register('firstName')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>
              {t('lastName')}
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              {...register('lastName')}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelClass}>
              {t('password')}
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                className="block w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 pr-14 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                {showPassword ? t('hidePassword') : t('showPassword')}
              </button>
            </div>
            {passwordValue && !passwordPattern.test(passwordValue) && (
              <p className="mt-1 text-xs text-[color:var(--color-warning)]">
                {t('passwordRequirements')}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              {t('confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={inputClass}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[color:var(--color-danger)]">
                {errors.confirmPassword.message === 'password_mismatch'
                  ? t('passwordMismatch')
                  : t('passwordRequirements')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('termsAccepted')}
              className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border)] accent-[color:var(--color-accent)]"
            />
            <span className="text-sm text-[color:var(--color-muted)]">
              {t('acceptTermsPrefix')}{' '}
              <Link
                href="/terms"
                className="font-medium text-[color:var(--color-accent-strong)] hover:underline"
                target="_blank"
              >
                {t('termsOfService')}
              </Link>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('privacyPolicyAccepted')}
              className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border)] accent-[color:var(--color-accent)]"
            />
            <span className="text-sm text-[color:var(--color-muted)]">
              {t('acceptPrivacyPrefix')}{' '}
              <Link
                href="/privacy"
                className="font-medium text-[color:var(--color-accent-strong)] hover:underline"
                target="_blank"
              >
                {t('privacyPolicy')}
              </Link>
            </span>
          </label>
        </div>

        {registerUser.isError && (
          <p className="text-sm text-[color:var(--color-danger)]">
            {(registerUser.error as { body?: { message?: string } })?.body?.message ?? t('registrationFailed')}
          </p>
        )}

        <button
          type="submit"
          disabled={registerUser.isPending || !consentsComplete}
          className="w-full rounded-full bg-[color:var(--color-foreground)] py-3.5 text-sm font-semibold text-[color:var(--color-background)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-60"
        >
          {registerUser.isPending ? t('creatingAccount') : t('createAccount')}
        </button>

        <p className="text-center text-sm text-[color:var(--color-muted)]">
          {t('hasAccount')}{' '}
          <Link
            href="/login"
            className="font-semibold text-[color:var(--color-accent-strong)] hover:underline"
          >
            {t('signIn')}
          </Link>
        </p>
      </form>
    </div>
  );
}
