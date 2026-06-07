'use client';

import { useForm } from '@tanstack/react-form';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { z } from 'zod';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthLegalDisclosure } from '@/components/auth/auth-legal-disclosure';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { PasswordInputField } from '@/components/auth/password-input-field';
import { TextInputField } from '@/components/auth/text-input-field';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useLogin } from '@/hooks/use-auth';
import { normalizeLocale } from '@/i18n/config';
import { getApiErrorBody } from '@/lib/api-error';
import { getLoginSubmitError } from '@/lib/auth-submit-errors';
import { navigateToUrl } from '@/lib/browser-navigation';
import { firstFieldError } from '@/lib/form-errors';
import { resolvePostLoginRoute } from '@/lib/post-login-route';
import { getGoogleOAuthStartUrl } from '@/services/auth.service';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEFAULT_LOGIN_VALUES: LoginValues = {
  email: '',
  password: '',
};

function buildResendVerificationHref(email: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return AppRoute.ResendVerification;
  }

  const params = new URLSearchParams({ email: trimmedEmail });
  return `${AppRoute.ResendVerification}?${params.toString()}`;
}

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const currentLocale = normalizeLocale(useLocale());
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const successfulLoginLocaleRef = useRef<string | undefined>(undefined);
  const loginErrorCode = getApiErrorBody(login.error)?.code;
  const showResendVerificationLink =
    typeof loginErrorCode === 'string' &&
    loginErrorCode.toUpperCase() === 'EMAIL_NOT_VERIFIED';

  const navigateAfterLogin = async (preferredLanguage?: string) => {
    const preferredLocale = normalizeLocale(preferredLanguage);

    if (preferredLocale !== currentLocale && typeof window !== 'undefined') {
      navigateToUrl(AppRoute.PostLogin);
      return;
    }

    const nextRoute = await resolvePostLoginRoute();
    router.push(nextRoute);
  };

  const handleGoogleSignIn = () => {
    setIsGoogleRedirecting(true);
    navigateToUrl(
      getGoogleOAuthStartUrl({
        preferredLanguage: currentLocale,
        termsAccepted: true,
        privacyPolicyAccepted: true,
      }),
    );
  };

  const form = useForm({
    defaultValues: DEFAULT_LOGIN_VALUES,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: loginSchema,
      onSubmit: loginSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(login.mutate, value);

        if (result.error !== null) {
          successfulLoginLocaleRef.current = undefined;
          return getLoginSubmitError(result.error, t);
        }

        successfulLoginLocaleRef.current = result.data.user.preferredLanguage;
        return undefined;
      },
    },
    onSubmit: async () => {
      await navigateAfterLogin(successfulLoginLocaleRef.current);
    },
  });

  return (
    <div>
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t('signInTitle')}
        </h1>
        <p className="text-sm text-muted">{t('signInSubtitle')}</p>
      </div>

      <div className="mt-8 space-y-5">
        <AuthLegalDisclosure />

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="flex flex-col gap-3">
              <GoogleSignInButton
                isDisabled={isSubmitting || login.isPending}
                isLoading={isGoogleRedirecting}
                onClick={handleGoogleSignIn}
              />
              {/* TODO: Re-enable Apple sign-in after the OAuth implementation is complete. */}
            </div>
          )}
        </form.Subscribe>

        <AuthDivider label={t('orContinueWithEmail')} />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-5"
          noValidate
        >
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

        <form.Field name="password">
          {(field) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-foreground"
                >
                  {t('password')}
                </label>
                <Link
                  href={AppRoute.ForgotPassword}
                  className="text-xs font-medium text-accent-strong hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <PasswordInputField
                id={field.name}
                label=""
                value={field.state.value}
                errorText={
                  field.state.meta.isTouched || field.state.meta.isDirty
                    ? firstFieldError(field.state.meta.errors, t)
                    : undefined
                }
                autoComplete="current-password"
                showPassword={showPassword}
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                onToggleVisibility={() =>
                  setShowPassword((current) => !current)
                }
              />
            </div>
          )}
        </form.Field>

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
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit || isSubmitting || login.isPending}
              className="w-full"
            >
              {isSubmitting || login.isPending ? (
                <LoadingIndicator label={t('signingIn')} />
              ) : (
                t('login')
              )}
            </Button>
          )}
        </form.Subscribe>

        {showResendVerificationLink ? (
          <form.Subscribe selector={(state) => state.values.email}>
            {(email) => (
              <p className="text-center text-sm text-muted">
                <Link
                  href={buildResendVerificationHref(email)}
                  className="font-semibold text-accent-strong hover:underline"
                >
                  {t('resendVerification')}
                </Link>
              </p>
            )}
          </form.Subscribe>
        ) : null}

        <p className="text-center text-sm text-muted">
          {t('noAccount')}{' '}
          <Link
            href={AppRoute.Register}
            className="font-semibold text-accent-strong hover:underline"
          >
            {t('signUp')}
          </Link>
        </p>
        </form>
      </div>
    </div>
  );
}
