'use client';

import { useForm } from '@tanstack/react-form';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { ConsentCheckbox } from '@/components/auth/consent-checkbox';
import { PasswordInputField } from '@/components/auth/password-input-field';
import { TextInputField } from '@/components/auth/text-input-field';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useRegister } from '@/hooks/use-auth';
import { normalizeLocale } from '@/i18n/config';
import { getRegisterSubmitError } from '@/lib/auth-submit-errors';
import { firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import {
  registerSchema,
  type RegisterValues,
} from './register-form.constants';

const DEFAULT_VALUES: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
  privacyPolicyAccepted: false,
};

function buildResendVerificationHref(email: string) {
  const params = new URLSearchParams({ email });
  return `${AppRoute.ResendVerification}?${params.toString()}`;
}

export function RegisterForm() {
  const t = useTranslations('auth');
  const locale = normalizeLocale(useLocale());
  const registerUser = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: registerSchema,
      onSubmit: registerSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(registerUser.mutate, {
          email: value.email,
          password: value.password,
          firstName: value.firstName,
          lastName: value.lastName,
          preferredLanguage: locale,
          termsAccepted: value.termsAccepted,
          privacyPolicyAccepted: value.privacyPolicyAccepted,
        });

        if (result.error !== null) {
          return getRegisterSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      setSubmittedEmail(value.email);
    },
  });

  if (submittedEmail) {
    return (
      <div className="space-y-6 text-center sm:text-left">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t('verifyEmail')}
          </h1>
          <p className="text-sm text-muted">
            {t('verifyEmailAfterRegistrationDescription', {
              email: submittedEmail,
            })}
          </p>
        </div>

        <div className="rounded-2xl border border-accent/20 bg-accent-soft/60 p-4">
          <p className="text-sm font-medium text-accent-strong">
            {t('verifyEmailSent')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href={AppRoute.Login}>{t('backToLogin')}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-full sm:w-auto"
          >
            <Link href={buildResendVerificationHref(submittedEmail)}>
              {t('resendVerification')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t('signUpTitle')}
        </h1>
        <p className="text-sm text-muted">{t('signUpSubtitle')}</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="mt-8 space-y-5"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="firstName">
            {(field) => (
              <TextInputField
                id={field.name}
                label={t('firstName')}
                value={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                autoComplete="given-name"
                onBlur={field.handleBlur}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Field name="lastName">
            {(field) => (
              <TextInputField
                id={field.name}
                label={t('lastName')}
                value={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                autoComplete="family-name"
                onBlur={field.handleBlur}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="email">
          {(field) => (
            <TextInputField
              id={field.name}
              label={t('email')}
              value={field.state.value}
              errorText={
                field.state.meta.isTouched || field.state.meta.isDirty
                  ? firstFieldError(field.state.meta.errors, t)
                  : undefined
              }
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="password">
            {(field) => (
              <PasswordInputField
                id={field.name}
                label={t('password')}
                value={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                autoComplete="new-password"
                showPassword={showPassword}
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                onToggleVisibility={() =>
                  setShowPassword((current) => !current)
                }
              />
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <TextInputField
                id={field.name}
                label={t('confirmPassword')}
                value={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                type="password"
                autoComplete="new-password"
                onBlur={field.handleBlur}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-surface/50 p-4">
          <form.Field name="termsAccepted">
            {(field) => (
              <ConsentCheckbox
                id={field.name}
                checked={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                prefix={t('acceptTermsPrefix')}
                linkLabel={t('termsOfService')}
                href={AppRoute.Terms}
              />
            )}
          </form.Field>

          <form.Field name="privacyPolicyAccepted">
            {(field) => (
              <ConsentCheckbox
                id={field.name}
                checked={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                prefix={t('acceptPrivacyPrefix')}
                linkLabel={t('privacyPolicy')}
                href={AppRoute.Privacy}
              />
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(submitError) => {
            const message = readSubmissionErrorMessage(submitError);

            return message ? (
              <div
                className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3"
                role="alert"
              >
                <p className="text-sm text-danger">{message}</p>
              </div>
            ) : null;
          }}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            termsAccepted: state.values.termsAccepted,
            privacyPolicyAccepted: state.values.privacyPolicyAccepted,
          })}
        >
          {({ canSubmit, isSubmitting, termsAccepted, privacyPolicyAccepted }) => (
            <Button
              type="submit"
              disabled={
                !canSubmit ||
                isSubmitting ||
                registerUser.isPending ||
                !termsAccepted ||
                !privacyPolicyAccepted
              }
              className="w-full"
            >
              {isSubmitting || registerUser.isPending ? (
                <LoadingIndicator
                  label={t('creatingAccount')}
                  className="inline-flex items-center gap-2"
                />
              ) : (
                t('createAccount')
              )}
            </Button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm text-muted">
          {t('hasAccount')}{' '}
          <Link
            href={AppRoute.Login}
            className="font-semibold text-accent-strong hover:underline"
          >
            {t('signIn')}
          </Link>
        </p>
      </form>
    </div>
  );
}
