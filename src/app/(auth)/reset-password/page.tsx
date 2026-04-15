'use client';

import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { z } from 'zod';
import { PasswordInputField } from '@/components/auth/password-input-field';
import { TextInputField } from '@/components/auth/text-input-field';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useActionToken } from '@/hooks/use-action-token';
import { useResetPassword } from '@/hooks/use-auth';
import { getResetPasswordSubmitError } from '@/lib/auth-submit-errors';
import { firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';
import { passwordPattern } from '@/components/auth/register-form.constants';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'validation.passwordRequired')
      .regex(passwordPattern, 'validation.passwordPattern'),
    confirmPassword: z.string().min(1, 'validation.passwordRequired'),
  })
  .superRefine((value, ctx) => {
    if (
      value.newPassword &&
      value.confirmPassword &&
      value.newPassword !== value.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'validation.passwordMismatch',
      });
    }
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const DEFAULT_RESET_PASSWORD_VALUES: ResetPasswordValues = {
  newPassword: '',
  confirmPassword: '',
};

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const { token, isReady } = useActionToken();
  const resetPassword = useResetPassword();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm({
    defaultValues: DEFAULT_RESET_PASSWORD_VALUES,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: resetPasswordSchema,
      onSubmit: resetPasswordSchema,
      onSubmitAsync: async ({ value }) => {
        if (!token) {
          return { form: t('invalidResetToken'), fields: {} };
        }

        const result = await executeMutation(resetPassword.mutate, {
          token,
          newPassword: value.newPassword,
        });

        if (result.error !== null) {
          return getResetPasswordSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      return undefined;
    },
  });

  if (!isReady) {
    return (
      <div className="mt-8 flex justify-center">
        <LoadingIndicator label={t('loading')} />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-danger">{t('invalidResetToken')}</p>
        <Link
          href={AppRoute.ForgotPassword}
          className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (form.state.isSubmitSuccessful) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-accent">{t('passwordResetSuccess')}</p>
        <Link
          href={AppRoute.Login}
          className="inline-block text-sm font-semibold text-accent hover:underline"
        >
          {t('continueToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="mt-8 space-y-5"
      noValidate
    >
      <form.Field name="newPassword">
        {(field) => (
          <PasswordInputField
            id={field.name}
            label={t('newPassword')}
            value={field.state.value}
            errorText={
              field.state.meta.isTouched || field.state.meta.isDirty
                ? firstFieldError(field.state.meta.errors, t)
                : undefined
            }
            autoComplete="new-password"
            showPassword={showNewPassword}
            showLabel={t('showPassword')}
            hideLabel={t('hidePassword')}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            onToggleVisibility={() =>
              setShowNewPassword((current) => !current)
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
            disabled={!canSubmit || isSubmitting || resetPassword.isPending}
            className="w-full"
          >
            {isSubmitting || resetPassword.isPending ? (
              <LoadingIndicator label={t('resetting')} />
            ) : (
              t('resetPassword')
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth');

  return (
    <div>
      <h1 className="text-center font-display text-3xl tracking-tight">
        {t('resetPassword')}
      </h1>
      <p className="mt-3 text-center text-sm text-muted">
        {t('resetPasswordDescription')}
      </p>
      <Suspense
        fallback={
          <div className="mt-8 flex justify-center">
            <LoadingIndicator label={t('loading')} />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
