import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import type { useTranslations } from 'next-intl';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

type AuthTranslations = ReturnType<typeof useTranslations>;
type HeroTone = 'accent' | 'danger' | 'muted';

const HERO_TONE_CLASSES: Record<
  HeroTone,
  { badge: string; halo: string; haloOuter: string }
> = {
  accent: {
    badge:
      'bg-accent text-surface shadow-[0_18px_40px_-12px_var(--accent-glow)]',
    halo: 'bg-accent/15',
    haloOuter: 'bg-accent/8',
  },
  danger: {
    badge:
      'bg-danger text-surface shadow-[0_18px_40px_-12px_rgba(179,38,30,0.35)]',
    halo: 'bg-danger/15',
    haloOuter: 'bg-danger/8',
  },
  muted: {
    badge: 'bg-foreground/85 text-surface shadow-hero',
    halo: 'bg-foreground/10',
    haloOuter: 'bg-foreground/5',
  },
};

export function HeroBadge({
  tone,
  icon,
}: {
  tone: HeroTone;
  icon: ReactNode;
}) {
  const classes = HERO_TONE_CLASSES[tone];
  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
      <div
        aria-hidden="true"
        className={`absolute inset-0 rounded-full ${classes.haloOuter}`}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-3 rounded-full ${classes.halo}`}
      />
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full ${classes.badge}`}
      >
        {icon}
      </div>
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
    </p>
  );
}

export function StillHereRow({
  icon,
  label,
  description,
}: {
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-accent/15 bg-accent-soft/40 px-3.5 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-accent-strong ring-1 ring-inset ring-accent/15">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[13px] font-semibold text-foreground">
          {label}
        </p>
        <p className="truncate text-[12px] text-muted">{description}</p>
      </div>
      <Check
        className="h-4 w-4 shrink-0 text-accent-strong"
        aria-hidden="true"
      />
    </div>
  );
}

export function ConfirmStatusRow({
  icon,
  label,
  description,
}: {
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        <p className="text-[12px] leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}

export function ConfirmTimeline({ t }: { t: AuthTranslations }) {
  const steps = [
    {
      label: t('accountDeletionConfirmTimelineTodayLabel'),
      body: t('accountDeletionConfirmTimelineTodayBody'),
      active: true,
    },
    {
      label: t('accountDeletionConfirmTimelineGraceLabel'),
      body: t('accountDeletionConfirmTimelineGraceBody'),
      active: false,
    },
    {
      label: t('accountDeletionConfirmTimelineFinalLabel'),
      body: t('accountDeletionConfirmTimelineFinalBody'),
      active: false,
    },
  ];

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute left-[12%] right-[12%] top-3.5 h-px bg-danger/20"
      />
      <ol className="relative grid grid-cols-3 gap-2">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                step.active
                  ? 'border-danger bg-danger text-surface'
                  : 'border-danger/30 bg-surface text-danger/60'
              }`}
            >
              <span className="block h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground">
              {step.label}
            </span>
            <span className="text-[11px] leading-snug text-muted">
              {step.body}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PendingView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse rounded-full bg-accent/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-3 rounded-full bg-accent/15"
        />
        <div className="relative">
          <LoadingIndicator />
        </div>
      </div>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
