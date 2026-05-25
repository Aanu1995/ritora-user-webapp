import { AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import type { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AppRoute } from '@/constants/app-routes';
import { getSupportMailto } from '@/lib/support-email';
import {
  HeroBadge,
  SectionHeading,
} from '@/components/auth/account-deletion-token-primitives';

type AuthTranslations = ReturnType<typeof useTranslations>;

export function ErrorView({
  title,
  body,
  t,
  showCommonReasons = false,
  showNextSteps = false,
  onRetry,
  retryLabel,
}: {
  title: string;
  body: string;
  t: AuthTranslations;
  showCommonReasons?: boolean;
  showNextSteps?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const commonReasons = [
    t('accountDeletionErrorReason1'),
    t('accountDeletionErrorReason2'),
    t('accountDeletionErrorReason3'),
  ];

  const nextSteps = [
    t('accountDeletionInvalidTokenWhatItem1'),
    t('accountDeletionInvalidTokenWhatItem2'),
    t('accountDeletionInvalidTokenWhatItem3'),
  ];

  return (
    <div className="space-y-7 text-center">
      <div className="animate-fade-in">
        <HeroBadge
          tone="danger"
          icon={<AlertCircle className="h-8 w-8" aria-hidden="true" />}
        />
      </div>

      <div className="animate-fade-up space-y-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h2>
        <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted">
          {body}
        </p>
      </div>

      {showCommonReasons ? (
        <section
          aria-label={t('accountDeletionErrorReasonsTitle')}
          className="animate-fade-up-delay-1 space-y-3 text-left"
        >
          <SectionHeading>
            {t('accountDeletionErrorReasonsTitle')}
          </SectionHeading>
          <ul className="space-y-2">
            {commonReasons.map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-danger/60"
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showNextSteps ? (
        <section
          aria-label={t('accountDeletionInvalidTokenWhatTitle')}
          className="animate-fade-up-delay-1 space-y-3 text-left"
        >
          <SectionHeading>
            {t('accountDeletionInvalidTokenWhatTitle')}
          </SectionHeading>
          <ol className="space-y-2">
            {nextSteps.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 text-[13px] leading-relaxed text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-bold text-accent-strong"
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="animate-fade-up-delay-2 space-y-2">
        {onRetry ? (
          <Button
            type="button"
            className="w-full rounded-full"
            onClick={onRetry}
          >
            {retryLabel ?? t('accountDeletionTryAgain')}
          </Button>
        ) : null}
        <Button
          asChild
          variant={onRetry ? 'outline' : 'default'}
          className="w-full rounded-full"
        >
          <Link href={AppRoute.Login}>{t('accountDeletionGoToLogin')}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full rounded-full">
          <a href={getSupportMailto()}>
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {t('accountDeletionContactSupport')}
          </a>
        </Button>
      </div>
    </div>
  );
}
