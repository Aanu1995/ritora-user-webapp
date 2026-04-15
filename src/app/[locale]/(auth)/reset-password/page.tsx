'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useResetPassword } from '@/hooks/use-auth';
import { Link } from '@/i18n/navigation';

const passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/;

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPassword = useResetPassword();

  const formSchema = z
    .object({
      newPassword: z.string().regex(passwordPattern),
      confirmPassword: z.string().min(1),
    })
    .superRefine((value, ctx) => {
      if (value.newPassword !== value.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'password_mismatch',
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
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    await resetPassword.mutateAsync({
      token,
      newPassword: values.newPassword,
    });
  });

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">{t('invalidResetToken')}</p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (resetPassword.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-[color:var(--color-accent)]">
          {t('passwordResetSuccess')}
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          {t('continueToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium">
          {t('newPassword')}
        </label>
        <input
          id="newPassword"
          type="password"
          {...register('newPassword')}
          className="mt-1 block w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
        />
        {newPassword && !passwordPattern.test(newPassword) && (
          <p className="mt-1 text-xs text-amber-600">
            {t('passwordRequirements')}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmNewPassword"
          className="block text-sm font-medium"
        >
          {t('confirmPassword')}
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          {...register('confirmPassword')}
          className="mt-1 block w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message === 'password_mismatch'
              ? t('passwordMismatch')
              : t('passwordRequirements')}
          </p>
        )}
      </div>

      {resetPassword.isError && (
        <p className="text-sm text-red-600">
          {(resetPassword.error as any)?.body?.message ?? t('resetFailed')}
        </p>
      )}

      <button
        type="submit"
        disabled={resetPassword.isPending}
        className="w-full rounded-xl bg-[color:var(--color-foreground)] py-3 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90 disabled:opacity-50"
      >
        {resetPassword.isPending ? t('resetting') : t('resetPassword')}
      </button>
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
      <p className="mt-3 text-center text-sm text-[color:var(--color-muted)]">
        {t('resetPasswordDescription')}
      </p>
      <Suspense
        fallback={
          <div className="mt-8 text-center text-sm text-[color:var(--color-muted)]">
            {t('loading')}
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
