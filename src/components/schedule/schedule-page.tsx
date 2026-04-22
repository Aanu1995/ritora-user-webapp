'use client';

import { startTransition, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/app/page-header';
import { RetryPanel } from '@/components/ui/retry-panel';
import { useIsLgDesktop } from '@/hooks/use-is-lg-desktop';
import { useSchedule } from '@/hooks/use-schedule';
import { ScheduleViewMode, useScheduleUiStore } from '@/stores/schedule-ui-store';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import {
  AddSlotPresetMode,
  DAYS_OF_WEEK,
  DAY_OF_WEEK_ORDER,
  DayOfWeek,
  type ScheduleSlot,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { AddSlotContent } from './add-slot-content';
import { AddSlotDialog } from './add-slot-dialog';
import { CalendarView } from './calendar-view';
import { DaySection } from './day-section';
import { EveryDayQuickAction } from './every-day-quick-action';
import { ScheduleEmptyState } from './schedule-empty-state';
import { ScheduleSkeleton } from './schedule-skeleton';
import { ScheduleViewToggle } from './schedule-view-toggle';
import { SlotEditorContent } from './slot-editor-content';
import { SlotEditorSheet } from './slot-editor-sheet';

const PANEL_WIDTH_PX = 440;

function useTodayOfWeek(): DayOfWeek {
  const order = [
    DayOfWeek.Sun,
    DayOfWeek.Mon,
    DayOfWeek.Tue,
    DayOfWeek.Wed,
    DayOfWeek.Thu,
    DayOfWeek.Fri,
    DayOfWeek.Sat,
  ];
  return order[new Date().getDay()];
}

function groupSlotsByDay(
  slots: ScheduleSlot[],
): Record<DayOfWeek, ScheduleSlot[]> {
  const grouped = DAYS_OF_WEEK.reduce<Record<DayOfWeek, ScheduleSlot[]>>(
    (acc, day) => {
      acc[day] = [];
      return acc;
    },
    {
      [DayOfWeek.Mon]: [],
      [DayOfWeek.Tue]: [],
      [DayOfWeek.Wed]: [],
      [DayOfWeek.Thu]: [],
      [DayOfWeek.Fri]: [],
      [DayOfWeek.Sat]: [],
      [DayOfWeek.Sun]: [],
    },
  );

  for (const slot of slots) {
    grouped[slot.dayOfWeek].push(slot);
  }

  for (const day of DAYS_OF_WEEK) {
    grouped[day].sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }

  return grouped;
}

function orderedDaysStartingToday(today: DayOfWeek): DayOfWeek[] {
  const todayIndex = DAY_OF_WEEK_ORDER[today];
  return [...DAYS_OF_WEEK].sort((a, b) => {
    const aOffset = (DAY_OF_WEEK_ORDER[a] - todayIndex + 7) % 7;
    const bOffset = (DAY_OF_WEEK_ORDER[b] - todayIndex + 7) % 7;
    return aOffset - bOffset;
  });
}

export function SchedulePage() {
  const t = useTranslations('schedule');
  const today = useTodayOfWeek();
  const tCommon = useTranslations('common');
  const { data, isLoading, isError, refetch } = useSchedule();
  const isDesktop = useIsLgDesktop();
  const pathname = usePathname();
  const router = useRouter();

  const editingSlotId = useScheduleUiStore((s) => s.editingSlotId);
  const openEditor = useScheduleUiStore((s) => s.openEditor);
  const closeEditor = useScheduleUiStore((s) => s.closeEditor);
  const addSlotDialog = useScheduleUiStore((s) => s.addSlotDialog);
  const openAddSlotDialog = useScheduleUiStore((s) => s.openAddSlotDialog);
  const closeAddSlotDialog = useScheduleUiStore((s) => s.closeAddSlotDialog);
  const viewMode = useScheduleUiStore((s) => s.viewMode);
  const setViewMode = useScheduleUiStore((s) => s.setViewMode);
  const buildFromScratch = useScheduleUiStore((s) => s.buildFromScratch);
  const enterBuildFromScratch = useScheduleUiStore(
    (s) => s.enterBuildFromScratch,
  );
  const requestLeave = useUnsavedChangesStore((s) => s.requestLeave);

  const slots = useMemo(() => data?.slots ?? [], [data]);
  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);
  const orderedDays = useMemo(() => orderedDaysStartingToday(today), [today]);
  const hasAnySlots = slots.length > 0;
  const showDayList = hasAnySlots || buildFromScratch;
  const editingSlot = useMemo(
    () =>
      editingSlotId
        ? slots.find((s) => s.id === editingSlotId) ?? null
        : null,
    [editingSlotId, slots],
  );

  const panelOpen =
    (editingSlotId !== null && editingSlot !== null) || addSlotDialog.open;
  const desktopPanelOpen = isDesktop && panelOpen;

  // Deep-link support: ?slot=<id> auto-opens the editor after schedule loads.
  const searchParams = useSearchParams();
  const deepLinkSlotId = searchParams.get('slot');

  useEffect(() => {
    if (!deepLinkSlotId) return;
    if (!data) return;

    const match = data.slots.find((s) => s.id === deepLinkSlotId);
    if (match && editingSlotId !== match.id) {
      openEditor(match.id);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('slot');
    const nextHref =
      nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextHref);
    });
  }, [data, deepLinkSlotId, editingSlotId, openEditor, pathname, router, searchParams]);

  const closeEditorGuarded = () => requestLeave(() => closeEditor());
  const closeAddSlotGuarded = () => requestLeave(() => closeAddSlotDialog());

  if (isLoading) {
    return (
      <div>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="mx-auto w-full max-w-3xl">
          <ScheduleSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="mx-auto mt-6 w-full max-w-3xl">
          <RetryPanel
            title={tCommon('error')}
            description={t('save.errorGeneric')}
            actionLabel={tCommon('retry')}
            onAction={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main column. When the desktop panel opens, pad-right to free space
          for the fixed aside — content and sticky header re-flow, not overlap. */}
      <div
        className={cn(
          'transition-[padding] duration-300 ease-in-out',
          desktopPanelOpen && 'lg:pr-[440px]',
        )}
      >
        <PageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          action={
            showDayList ? (
              <ScheduleViewToggle value={viewMode} onChange={setViewMode} />
            ) : undefined
          }
        />

        <div className="mx-auto w-full max-w-3xl">
          {!showDayList ? (
            <ScheduleEmptyState
              onEveryDay={() =>
                openAddSlotDialog({ presetMode: AddSlotPresetMode.EveryDay })
              }
              onBuildFromScratch={() => enterBuildFromScratch()}
            />
          ) : viewMode === ScheduleViewMode.Calendar ? (
            <div className="mt-4 space-y-3 pb-8">
              <EveryDayQuickAction
                onClick={() =>
                  openAddSlotDialog({ presetMode: AddSlotPresetMode.EveryDay })
                }
              />
              <CalendarView
                slots={slots}
                today={today}
                onSlotClick={(id) => openEditor(id)}
                onAddTime={(d) =>
                  openAddSlotDialog({
                    day: d,
                    presetMode: AddSlotPresetMode.Single,
                  })
                }
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3 pb-8">
              <EveryDayQuickAction
                onClick={() =>
                  openAddSlotDialog({ presetMode: AddSlotPresetMode.EveryDay })
                }
              />

              {orderedDays.map((day) => (
                <DaySection
                  key={day}
                  day={day}
                  slots={grouped[day]}
                  isToday={day === today}
                  onSlotClick={(id) => openEditor(id)}
                  onAddTime={(d) =>
                    openAddSlotDialog({
                      day: d,
                      presetMode: AddSlotPresetMode.Single,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed right panel, flush to the viewport edge, full height. Slides in
          from the right with translate-x; no overlay, no blur, no rounded edges. */}
      {isDesktop ? (
        <aside
          aria-hidden={!panelOpen}
          style={{ width: `${PANEL_WIDTH_PX}px` }}
          className={cn(
            'fixed inset-y-0 right-0 z-30 hidden border-l border-border bg-surface shadow-soft transition-transform duration-300 ease-in-out lg:flex lg:flex-col',
            panelOpen
              ? 'lg:translate-x-0'
              : 'lg:pointer-events-none lg:translate-x-full',
          )}
        >
          {editingSlot ? (
            <SlotEditorContent
              key={editingSlot.id}
              slot={editingSlot}
              onClose={closeEditorGuarded}
              showCloseButton
            />
          ) : addSlotDialog.open ? (
            <AddSlotContent
              key={`${addSlotDialog.presetMode ?? AddSlotPresetMode.Single}-${addSlotDialog.preselectDay ?? 'none'}`}
              presetMode={addSlotDialog.presetMode ?? AddSlotPresetMode.Single}
              preselectDay={addSlotDialog.preselectDay}
              onClose={closeAddSlotGuarded}
              showCloseButton
            />
          ) : null}
        </aside>
      ) : null}

      {/* Mobile-only bottom sheets. Not mounted on desktop so only one
          form instance exists at a time. */}
      {!isDesktop ? (
        <>
          <AddSlotDialog
            open={addSlotDialog.open}
            presetMode={addSlotDialog.presetMode ?? AddSlotPresetMode.Single}
            preselectDay={addSlotDialog.preselectDay}
            onOpenChange={(open) => {
              if (!open) closeAddSlotDialog();
            }}
          />

          <SlotEditorSheet
            slot={editingSlot}
            open={editingSlotId !== null && editingSlot !== null}
            onOpenChange={(open) => {
              if (!open) closeEditor();
            }}
          />
        </>
      ) : null}
    </>
  );
}
