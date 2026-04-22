'use client';

import { CalendarRange, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ScheduleViewMode } from '@/stores/schedule-ui-store';
import { cn } from '@/lib/utils';

type ScheduleViewToggleProps = {
  value: ScheduleViewMode;
  onChange: (mode: ScheduleViewMode) => void;
};

export function ScheduleViewToggle({
  value,
  onChange,
}: ScheduleViewToggleProps) {
  const t = useTranslations('schedule.view');
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
      {[
        { mode: ScheduleViewMode.List, label: t('list'), Icon: List },
        {
          mode: ScheduleViewMode.Calendar,
          label: t('calendar'),
          Icon: CalendarRange,
        },
      ].map(({ mode, label, Icon }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
              active
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
