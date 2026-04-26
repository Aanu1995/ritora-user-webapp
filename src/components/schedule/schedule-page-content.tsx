'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/app/page-header';
import { ScheduleViewMode } from '@/stores/schedule-ui-store';
import { DayOfWeek, type ScheduleSlot } from '@/types/schedule';
import {
  DEFAULT_TIME_ZONE,
  formatTimeZoneLabel,
} from '@/lib/time-zone';
import { CalendarView } from './calendar-view';
import { DaySection } from './day-section';
import { EveryDayQuickAction } from './every-day-quick-action';
import { ScheduleEmptyState } from './schedule-empty-state';
import { ScheduleViewToggle } from './schedule-view-toggle';

type SchedulePageContentProps = {
  buildFromScratch: boolean;
  groupedSlots: Record<DayOfWeek, ScheduleSlot[]>;
  onEnterBuildFromScratch: () => void;
  onOpenEveryDayDialog: () => void;
  onOpenSingleDayDialog: (day: DayOfWeek) => void;
  onOpenSlotEditor: (slotId: string) => void;
  orderedDays: DayOfWeek[];
  scheduleTimeZone?: string;
  slots: ScheduleSlot[];
  today: DayOfWeek;
  viewMode: ScheduleViewMode;
  onViewModeChange: (viewMode: ScheduleViewMode) => void;
};

export function SchedulePageContent({
  buildFromScratch,
  groupedSlots,
  onEnterBuildFromScratch,
  onOpenEveryDayDialog,
  onOpenSingleDayDialog,
  onOpenSlotEditor,
  orderedDays,
  scheduleTimeZone = DEFAULT_TIME_ZONE,
  slots,
  today,
  viewMode,
  onViewModeChange,
}: SchedulePageContentProps) {
  const t = useTranslations('schedule');
  const hasAnySlots = slots.length > 0;
  const showDayList = hasAnySlots || buildFromScratch;

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          showDayList ? (
            <ScheduleViewToggle value={viewMode} onChange={onViewModeChange} />
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm text-muted">
          {t('timeZone.label', {
            timeZone: formatTimeZoneLabel(scheduleTimeZone),
          })}
        </p>

        {!showDayList ? (
          <ScheduleEmptyState
            onEveryDay={onOpenEveryDayDialog}
            onBuildFromScratch={onEnterBuildFromScratch}
          />
        ) : viewMode === ScheduleViewMode.Calendar ? (
          <div className="mt-4 space-y-3 pb-8">
            <EveryDayQuickAction onClick={onOpenEveryDayDialog} />
            <CalendarView
              slots={slots}
              today={today}
              onSlotClick={onOpenSlotEditor}
              onAddTime={onOpenSingleDayDialog}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3 pb-8">
            <EveryDayQuickAction onClick={onOpenEveryDayDialog} />

            {orderedDays.map((day) => (
              <DaySection
                key={day}
                day={day}
                slots={groupedSlots[day]}
                isToday={day === today}
                onSlotClick={onOpenSlotEditor}
                onAddTime={onOpenSingleDayDialog}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
