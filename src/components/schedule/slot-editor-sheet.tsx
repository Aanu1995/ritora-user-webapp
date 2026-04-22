'use client';

import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import type { ScheduleSlot } from '@/types/schedule';
import { SlotEditorContent } from './slot-editor-content';

type SlotEditorSheetProps = {
  slot: ScheduleSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Mobile-only wrapper that presents the slot editor as a bottom sheet.
 * On desktop the SchedulePage renders <SlotEditorContent /> inline in a
 * right-hand split-pane column instead of using this component.
 */
export function SlotEditorSheet({
  slot,
  open,
  onOpenChange,
}: SlotEditorSheetProps) {
  const t = useTranslations('schedule');
  const requestLeave = useUnsavedChangesStore((s) => s.requestLeave);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    requestLeave(() => onOpenChange(false));
  };

  return (
    <Sheet open={open && slot !== null} onOpenChange={handleOpenChange}>
      {open && slot ? (
        <SheetContent
          side="bottom"
          className="flex h-[92vh] w-full max-w-none flex-col gap-0 rounded-t-3xl border-t border-border p-0"
        >
          <SheetTitle className="sr-only">
            {t('editor.sheetTitle', {
              day: t(`days.${slot.dayOfWeek}`),
              time: slot.slotTime,
            })}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t('editor.sheetDescription')}
          </SheetDescription>
          <SlotEditorContent
            key={slot.id}
            slot={slot}
            onClose={() => onOpenChange(false)}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
