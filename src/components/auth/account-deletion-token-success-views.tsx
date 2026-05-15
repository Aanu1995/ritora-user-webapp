import {
  CalendarClock,
  Camera,
  Check,
  Heart,
  Inbox,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import type { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AppRoute } from '@/constants/app-routes';
import {
  ConfirmStatusRow,
  ConfirmTimeline,
  HeroBadge,
  SectionHeading,
  StillHereRow,
} from '@/components/auth/account-deletion-token-primitives';

type AuthTranslations = ReturnType<typeof useTranslations>;

export function CancelSuccessView({
  title,
  body,
  t,
}: {
  title: string;
  body: string;
  t: AuthTranslations;
}) {
  return (
    <div className="space-y-7 text-center">
      <div className="animate-fade-in">
        <HeroBadge
          tone="accent"
          icon={
            <Check className="h-9 w-9" strokeWidth={2.6} aria-hidden="true" />
          }
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

      <section
        aria-label={t('accountDeletionStillHereTitle')}
        className="animate-fade-up-delay-1 space-y-3"
      >
        <SectionHeading>{t('accountDeletionStillHereTitle')}</SectionHeading>
        <div className="space-y-2">
          <StillHereRow
            icon={<Camera className="h-4 w-4" aria-hidden="true" />}
            label={t('accountDeletionStillHerePhotos')}
            description={t('accountDeletionStillHerePhotosDesc')}
          />
          <StillHereRow
            icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
            label={t('accountDeletionStillHereRoutine')}
            description={t('accountDeletionStillHereRoutineDesc')}
          />
          <StillHereRow
            icon={<Package className="h-4 w-4" aria-hidden="true" />}
            label={t('accountDeletionStillHereShelf')}
            description={t('accountDeletionStillHereShelfDesc')}
          />
        </div>
      </section>

      <section
        aria-label={t('accountDeletionCancelPrivacyTitle')}
        className="animate-fade-up-delay-1 flex items-start gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3.5 text-left"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[12px] font-semibold text-foreground">
            {t('accountDeletionCancelPrivacyTitle')}
          </p>
          <p className="text-[12px] leading-relaxed text-muted">
            {t('accountDeletionCancelPrivacyBody')}
          </p>
        </div>
      </section>

      <div className="animate-fade-up-delay-2 space-y-2">
        <Button asChild className="w-full rounded-full">
          <Link href={AppRoute.Login}>{t('accountDeletionGoToLogin')}</Link>
        </Button>
        <p
          className="text-center text-xs text-muted"
          role="status"
          aria-live="polite"
        >
          {t('accountDeletionRedirecting')}
        </p>
      </div>
    </div>
  );
}

export function ConfirmSuccessView({
  title,
  body,
  t,
}: {
  title: string;
  body: string;
  t: AuthTranslations;
}) {
  return (
    <div className="space-y-7 text-center">
      <div className="animate-fade-in">
        <HeroBadge
          tone="danger"
          icon={<CalendarClock className="h-8 w-8" aria-hidden="true" />}
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

      <div className="animate-fade-up-delay-1 rounded-2xl border border-border bg-background/50 px-5 py-5">
        <ConfirmTimeline t={t} />
      </div>

      <section
        aria-label={t('accountDeletionConfirmStatusTitle')}
        className="animate-fade-up-delay-1 space-y-3 text-left"
      >
        <SectionHeading>
          {t('accountDeletionConfirmStatusTitle')}
        </SectionHeading>
        <div className="space-y-3">
          <ConfirmStatusRow
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            label={t('accountDeletionConfirmStatusSignedOut')}
            description={t('accountDeletionConfirmStatusSignedOutDesc')}
          />
          <ConfirmStatusRow
            icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            label={t('accountDeletionConfirmStatusDataHeld')}
            description={t('accountDeletionConfirmStatusDataHeldDesc')}
          />
          <ConfirmStatusRow
            icon={<Inbox className="h-4 w-4" aria-hidden="true" />}
            label={t('accountDeletionConfirmStatusEmail')}
            description={t('accountDeletionConfirmStatusEmailDesc')}
          />
        </div>
      </section>

      <section
        aria-label={t('accountDeletionConfirmChangedMindTitle')}
        className="animate-fade-up-delay-2 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3.5 text-left"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-accent-strong">
          <Heart className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[13px] font-semibold text-foreground">
            {t('accountDeletionConfirmChangedMindTitle')}
          </p>
          <p className="text-[12px] leading-relaxed text-muted">
            {t('accountDeletionConfirmChangedMindBody')}
          </p>
        </div>
      </section>

      <div className="animate-fade-up-delay-2 space-y-2">
        <Button asChild className="w-full rounded-full">
          <Link href={AppRoute.Login}>{t('accountDeletionGoToLogin')}</Link>
        </Button>
        <p
          className="text-center text-[11px] leading-relaxed text-muted"
          role="status"
          aria-live="polite"
        >
          {t('accountDeletionConfirmFinalPromise')}
        </p>
        <p className="text-center text-xs text-muted" aria-live="polite">
          {t('accountDeletionRedirecting')}
        </p>
      </div>
    </div>
  );
}
