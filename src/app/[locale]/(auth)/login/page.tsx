'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLogin } from '@/hooks/use-auth';
import { Link, useRouter } from '@/i18n/navigation';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
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
          {t('signInTitle')}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          {t('signInSubtitle')}
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
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
          {errors.email && (
            <p className="mt-1 text-xs text-[color:var(--color-danger)]">
              {t('invalidCredentials')}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={labelClass}>
              {t('password')}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[color:var(--color-accent-strong)] hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
          {errors.password && (
            <p className="mt-1 text-xs text-[color:var(--color-danger)]">
              {t('invalidCredentials')}
            </p>
          )}
        </div>

        {login.isError && (
          <p className="text-sm text-[color:var(--color-danger)]">
            {(login.error as { body?: { message?: string } })?.body?.message ?? t('invalidCredentials')}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-full bg-[color:var(--color-foreground)] py-3.5 text-sm font-semibold text-[color:var(--color-background)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-60"
        >
          {login.isPending ? t('signingIn') : t('login')}
        </button>

        <p className="text-center text-sm text-[color:var(--color-muted)]">
          {t('noAccount')}{' '}
          <Link
            href="/register"
            className="font-semibold text-[color:var(--color-accent-strong)] hover:underline"
          >
            {t('signUp')}
          </Link>
        </p>
      </form>
    </div>
  );
}
