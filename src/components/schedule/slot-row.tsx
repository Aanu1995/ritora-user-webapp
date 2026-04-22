'use client';

import {
  ChevronRight,
  ListChecks,
  ListMinus,
  MessageSquareDashed,
  MessageSquareText,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  type ScheduleSlot,
  SlotMode,
  deriveDaypart,
  formatSlotTimeLabel,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { DaypartIcon } from './daypart-icon';
import { ModeBadge } from './mode-badge';

type SlotRowProps = {
  slot: ScheduleSlot;
  onClick: () => void;
};

export function SlotRow({ slot, onClick }: SlotRowProps) {
  const t = useTranslations('schedule');
  const daypart = deriveDaypart(slot.slotTime);
  const timeLabel = formatSlotTimeLabel(slot.slotTime);
  const isManual = slot.mode === SlotMode.Manual;
  const stepCount = slot.steps.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-muted/60',
        'focus-visible:outline-none focus-visible:bg-surface-muted/60',
      )}
    >
      <DaypartIcon daypart={daypart} />
      <div className="min-w-0 flex-1">
        <div className="text-base font-bold tabular-nums text-foreground">
          {timeLabel}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <ModeBadge mode={slot.mode} />
          {isManual ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                stepCount > 0 ? 'text-accent-strong' : 'text-warning',
              )}
            >
              {stepCount > 0 ? (
                <ListChecks className="h-3 w-3" aria-hidden />
              ) : (
                <ListMinus className="h-3 w-3" aria-hidden />
              )}
              {t('slot.stepCount', { count: stepCount })}
            </span>
          ) : null}
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              slot.slotNotes ? 'text-accent-strong' : 'text-warning',
            )}
          >
            {slot.slotNotes ? (
              <MessageSquareText className="h-3 w-3" aria-hidden />
            ) : (
              <MessageSquareDashed className="h-3 w-3" aria-hidden />
            )}
            {slot.slotNotes ? t('slot.hasNotes') : t('slot.noNotes')}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
    </button>
  );
}
