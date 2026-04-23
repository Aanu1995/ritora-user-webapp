'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/app/page-header';
import { RetryPanel } from '@/components/ui/retry-panel';
import { useIsLgDesktop } from '@/hooks/use-is-lg-desktop';
import { useSchedule } from '@/hooks/use-schedule';
import { useScheduleUiStore } from '@/stores/schedule-ui-store';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import {
  AddSlotPresetMode,
  type DayOfWeek,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { AddSlotContent } from './add-slot-content';
import { AddSlotDialog } from './add-slot-dialog';
import { ProductPickerContent } from './product-picker-content';
import { ProductPickerSheet } from './product-picker-sheet';
import { SchedulePageContent } from './schedule-page-content';
import { ScheduleSkeleton } from './schedule-skeleton';
import { SlotEditorContent } from './slot-editor-content';
import { SlotEditorSheet } from './slot-editor-sheet';
import {
  buildSchedulePageHrefWithoutSlotParam,
  findScheduleSlotById,
  groupSlotsByDay,
  orderedDaysStartingToday,
} from './schedule-page.utils';
import {
  DEFAULT_TIME_ZONE,
  resolveDayOfWeekForTimeZone,
} from '@/lib/time-zone';

const PANEL_WIDTH_PX = 440;
const PICKER_WIDTH_PX = 340;
const PRODUCT_PICKER_DISMISS_GUARD_MS = 300;

export function SchedulePage() {
  const t = useTranslations('schedule');
  const tCommon = useTranslations('common');
  const { data, isLoading, isError, refetch } = useSchedule();
  const isDesktop = useIsLgDesktop();
  const pathname = usePathname();
  const router = useRouter();
  const [isEditorDismissSuppressed, setIsEditorDismissSuppressed] =
    useState(false);
  const dismissSuppressionTimeoutRef = useRef<number | null>(null);

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
  const productPickerOpenForStepIndex = useScheduleUiStore(
    (s) => s.productPickerOpenForStepIndex,
  );
  const closeProductPicker = useScheduleUiStore((s) => s.closeProductPicker);
  const selectProductForPicker = useScheduleUiStore(
    (s) => s.selectProductForPicker,
  );
  const requestLeave = useUnsavedChangesStore((s) => s.requestLeave);

  const scheduleTimeZone = data?.timeZone ?? DEFAULT_TIME_ZONE;
  const today = useMemo(
    () => resolveDayOfWeekForTimeZone(scheduleTimeZone),
    [scheduleTimeZone],
  );
  const slots = useMemo(() => data?.slots ?? [], [data]);
  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);
  const orderedDays = useMemo(() => orderedDaysStartingToday(today), [today]);
  const editingSlot = useMemo(
    () => findScheduleSlotById(slots, editingSlotId),
    [editingSlotId, slots],
  );

  const panelOpen =
    (editingSlotId !== null && editingSlot !== null) || addSlotDialog.open;
  const desktopPanelOpen = isDesktop && panelOpen;
  const pickerOpen =
    editingSlotId !== null &&
    editingSlot !== null &&
    productPickerOpenForStepIndex !== null;
  const desktopPickerOpen = isDesktop && pickerOpen;
  const mobileEditorDismissSuppressed = !isDesktop && isEditorDismissSuppressed;

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

    startTransition(() => {
      router.replace(
        buildSchedulePageHrefWithoutSlotParam(pathname, searchParams),
      );
    });
  }, [
    data,
    deepLinkSlotId,
    editingSlotId,
    openEditor,
    pathname,
    router,
    searchParams,
  ]);

  const closeEditorGuarded = () => requestLeave(() => closeEditor());
  const closeAddSlotGuarded = () => requestLeave(() => closeAddSlotDialog());
  const suppressEditorDismissTemporarily = useCallback(() => {
    setIsEditorDismissSuppressed(true);

    if (dismissSuppressionTimeoutRef.current !== null) {
      window.clearTimeout(dismissSuppressionTimeoutRef.current);
    }

    dismissSuppressionTimeoutRef.current = window.setTimeout(() => {
      dismissSuppressionTimeoutRef.current = null;
      setIsEditorDismissSuppressed(false);
    }, PRODUCT_PICKER_DISMISS_GUARD_MS);
  }, []);
  const openEveryDayDialog = () =>
    openAddSlotDialog({ presetMode: AddSlotPresetMode.EveryDay });
  const openSingleDayDialog = (day: DayOfWeek) =>
    openAddSlotDialog({
      day,
      presetMode: AddSlotPresetMode.Single,
    });
  const addSlotDialogKey = `${addSlotDialog.presetMode ?? AddSlotPresetMode.Single}-${addSlotDialog.preselectDay ?? 'none'}`;

  useEffect(() => {
    return () => {
      if (dismissSuppressionTimeoutRef.current !== null) {
        window.clearTimeout(dismissSuppressionTimeoutRef.current);
      }
    };
  }, []);

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
          for the fixed aside — content and sticky header re-flow, not overlap.
          Doubles when the product picker is also open (editor + picker). */}
      <div
        className={cn(
          'transition-[padding] duration-300 ease-in-out',
          desktopPanelOpen && !desktopPickerOpen && 'lg:pr-[440px]',
          desktopPickerOpen && 'lg:pr-[780px]',
        )}
      >
        <SchedulePageContent
          buildFromScratch={buildFromScratch}
          groupedSlots={grouped}
          onEnterBuildFromScratch={enterBuildFromScratch}
          onOpenEveryDayDialog={openEveryDayDialog}
          onOpenSingleDayDialog={openSingleDayDialog}
          onOpenSlotEditor={openEditor}
          orderedDays={orderedDays}
          scheduleTimeZone={scheduleTimeZone}
          slots={slots}
          today={today}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Fixed right panel, flush to the viewport edge, full height. Slides in
          from the right with translate-x; no overlay, no blur, no rounded edges.
          When the product picker is also open, this panel shifts left by one
          panel-width so the picker can sit flush against the viewport edge. */}
      {isDesktop ? (
        <aside
          aria-hidden={!panelOpen}
          style={{
            width: `${PANEL_WIDTH_PX}px`,
            right: desktopPickerOpen ? `${PICKER_WIDTH_PX}px` : 0,
          }}
          className={cn(
            'fixed inset-y-0 z-30 hidden border-l border-border bg-surface shadow-soft transition-[transform,right] duration-300 ease-in-out lg:flex lg:flex-col',
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
              key={addSlotDialogKey}
              presetMode={addSlotDialog.presetMode ?? AddSlotPresetMode.Single}
              preselectDay={addSlotDialog.preselectDay}
              onClose={closeAddSlotGuarded}
              showCloseButton
            />
          ) : null}
        </aside>
      ) : null}

      {/* Inline product picker panel on desktop. Slides in from the right, sits
          flush to the viewport edge; the slot-editor aside shifts left one
          panel-width so both panels fit on the right side without overlay. */}
      {isDesktop ? (
        <aside
          aria-hidden={!desktopPickerOpen}
          style={{ width: `${PICKER_WIDTH_PX}px` }}
          className={cn(
            'fixed inset-y-0 right-0 z-30 hidden border-l border-border bg-surface shadow-soft transition-transform duration-300 ease-in-out lg:flex lg:flex-col',
            desktopPickerOpen
              ? 'lg:translate-x-0'
              : 'lg:pointer-events-none lg:translate-x-full',
          )}
        >
          {desktopPickerOpen ? (
            <ProductPickerContent
              onSelect={selectProductForPicker}
              onClose={closeProductPicker}
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
              if (!open) {
                closeAddSlotDialog();
              }
            }}
          />

          <SlotEditorSheet
            slot={editingSlot}
            open={editingSlotId !== null && editingSlot !== null}
            onOpenChange={(open) => {
              if (!open) {
                closeEditor();
              }
            }}
            onProductPickerClose={suppressEditorDismissTemporarily}
            suppressAutoClose={pickerOpen || mobileEditorDismissSuppressed}
          />

          <ProductPickerSheet
            open={pickerOpen}
            onOpenChange={(open) => {
              if (!open) {
                suppressEditorDismissTemporarily();
                closeProductPicker();
              }
            }}
            onSelect={selectProductForPicker}
          />
        </>
      ) : null}
    </>
  );
}
