'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DayOfWeek, type ScheduleSlot } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { SlotRow } from './slot-row';

type DaySectionProps = {
  day: DayOfWeek;
  slots: ScheduleSlot[];
  isToday: boolean;
  onSlotClick: (slotId: string) => void;
  onAddTime: (day: DayOfWeek) => void;
};

export function DaySection({
  day,
  slots,
  isToday,
  onSlotClick,
  onAddTime,
}: DaySectionProps) {
  const t = useTranslations('schedule');
  const count = slots.length;

  return (
    <section
      style={{ boxShadow: 'var(--shadow-soft)' }}
      className={cn(
        'overflow-hidden rounded-xl border bg-surface',
        isToday ? 'border-accent' : 'border-border-strong',
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between border-b px-4 py-3',
          isToday
            ? 'border-accent/40 bg-accent-soft'
            : 'border-border-strong bg-surface-muted',
        )}
      >
        <div className="flex items-center gap-2">
          <h2
            className={cn(
              'text-base font-bold',
              count === 0 && !isToday ? 'text-muted' : 'text-foreground',
            )}
          >
            {t(`days.${day}`)}
          </h2>
          {isToday ? (
            <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-surface">
              {t('daySection.todayBadge')}
            </span>
          ) : null}
        </div>
        <span className="text-xs font-medium text-muted">
          {count === 0 ? '—' : t('daySection.timeCount', { count })}
        </span>
      </header>

      {count === 0 ? (
        <p className="px-4 py-5 text-center text-xs italic text-muted">
          {t('daySection.noRoutines')}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {slots.map((slot) => (
            <li key={slot.id}>
              <SlotRow slot={slot} onClick={() => onSlotClick(slot.id)} />
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onAddTime(day)}
        className={cn(
          'flex w-full items-center justify-center gap-2 border-t border-border bg-background px-4 py-2.5 text-xs font-semibold text-accent-strong transition hover:bg-accent-soft',
          'focus-visible:outline-none focus-visible:bg-accent-soft',
        )}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {t('daySection.addTime')}
      </button>
    </section>
  );
}
