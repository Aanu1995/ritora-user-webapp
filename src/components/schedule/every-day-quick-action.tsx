'use client';

import { CalendarCheck2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

type EveryDayQuickActionProps = {
  onClick: () => void;
};

export function EveryDayQuickAction({ onClick }: EveryDayQuickActionProps) {
  const t = useTranslations('schedule');
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
        <CalendarCheck2 className="h-5 w-5" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {t('preset.everyDay')}
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {t('preset.everyDayDescription')}
        </span>
      </span>
      <Plus className="h-4 w-4 text-muted transition group-hover:text-accent-strong" />
    </button>
  );
}
