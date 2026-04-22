'use client';

import { ArrowRight, CalendarCheck2, CalendarDays, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ScheduleEmptyStateProps = {
  onEveryDay: () => void;
  onBuildFromScratch: () => void;
};

export function ScheduleEmptyState({
  onEveryDay,
  onBuildFromScratch,
}: ScheduleEmptyStateProps) {
  const t = useTranslations('schedule');

  return (
    <div className="mt-8 flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
        <CalendarDays className="h-10 w-10 text-accent-strong" aria-hidden />
      </div>
      <h2 className="mt-5 text-xl font-bold text-foreground">
        {t('empty.headline')}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t('empty.body')}</p>

      <div className="mt-8 w-full max-w-2xl space-y-3">
        <button
          type="button"
          onClick={onEveryDay}
          className="group flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
            <CalendarCheck2 className="h-6 w-6" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {t('preset.everyDay')}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {t('preset.everyDayDescription')}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-muted transition group-hover:text-accent-strong" />
        </button>

        <button
          type="button"
          onClick={onBuildFromScratch}
          className="group flex w-full items-center gap-4 rounded-xl border border-dashed border-border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-muted">
            <Plus className="h-6 w-6" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {t('preset.buildFromScratch')}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {t('preset.buildFromScratchDescription')}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-muted transition group-hover:text-accent-strong" />
        </button>
      </div>
    </div>
  );
}
