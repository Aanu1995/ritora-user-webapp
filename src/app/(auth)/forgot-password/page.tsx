'use client';

import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { z } from '@/lib/zod';
import { TextInputField } from '@/components/auth/text-input-field';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useForgotPassword } from '@/hooks/use-auth';
import { getEmailOnlySubmitError } from '@/lib/auth-submit-errors';
import { firstFieldError } from '@/lib/form-errors';
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from '@/lib/form-submission';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const DEFAULT_FORGOT_PASSWORD_VALUES: ForgotPasswordValues = {
  email: '',
};

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const forgotPassword = useForgotPassword();

  const form = useForm({
    defaultValues: DEFAULT_FORGOT_PASSWORD_VALUES,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: forgotPasswordSchema,
      onSubmit: forgotPasswordSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(forgotPassword.mutate, value.email);

        if (result.error !== null) {
          return getEmailOnlySubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      return undefined;
    },
  });

  return (
    <div>
      <h1 className="text-center font-display text-3xl tracking-tight">
        {t('forgotPasswordTitle')}
      </h1>
      <p className="mt-3 text-center text-sm text-muted">
        {t('forgotPasswordDescription')}
      </p>

      {form.state.isSubmitSuccessful ? (
        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-accent">{t('resetSent')}</p>
          <Link
            href={AppRoute.Login}
            className="inline-block text-sm font-semibold text-accent hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="mt-8 space-y-5"
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
              <Button
                type="submit"
                disabled={
                  !canSubmit || isSubmitting || forgotPassword.isPending
                }
                className="w-full"
              >
                {isSubmitting || forgotPassword.isPending ? (
                  <LoadingIndicator label={t('sending')} />
                ) : (
                  t('sendResetLink')
                )}
              </Button>
            )}
          </form.Subscribe>

          <p className="text-center text-sm text-muted">
            <Link
              href={AppRoute.Login}
              className="font-semibold text-accent hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
