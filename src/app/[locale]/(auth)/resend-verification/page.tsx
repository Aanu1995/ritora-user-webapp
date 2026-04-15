'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useResendVerification } from '@/hooks/use-auth';
import { Link } from '@/i18n/navigation';

export default function ResendVerificationPage() {
  const t = useTranslations('auth');
  const resend = useResendVerification();

  const formSchema = z.object({
    email: z.string().email(),
  });

  const { register, handleSubmit } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await resend.mutateAsync(values.email);
  });

  return (
    <div>
      <h1 className="text-center font-display text-3xl tracking-tight">
        {t('resendVerificationTitle')}
      </h1>
      <p className="mt-3 text-center text-sm text-[color:var(--color-muted)]">
        {t('resendVerificationDescription')}
      </p>

      {resend.isSuccess ? (
        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-[color:var(--color-accent)]">
            {t('verifyEmailSent')}
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={resend.isPending}
            className="w-full rounded-xl bg-[color:var(--color-foreground)] py-3 text-sm font-semibold text-[color:var(--color-background)] transition hover:opacity-90 disabled:opacity-50"
          >
            {resend.isPending ? t('sending') : t('sendVerificationEmail')}
          </button>

          <p className="text-center text-sm text-[color:var(--color-muted)]">
            <Link
              href="/login"
              className="font-semibold text-[color:var(--color-accent)] hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
