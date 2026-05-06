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
  onProductPickerClose?: () => void;
  /** When true, suppress auto-close triggers from Radix (outside click / escape).
   * Used on mobile while the product picker sheet is stacked on top so dismissing
   * the picker doesn't leak into closing or prompting unsaved-changes on the editor. */
  suppressAutoClose?: boolean;
};

export function SlotEditorSheet({
  slot,
  open,
  onOpenChange,
  onProductPickerClose,
  suppressAutoClose = false,
}: SlotEditorSheetProps) {
  const t = useTranslations('schedule');
  const requestLeave = useUnsavedChangesStore((s) => s.requestLeave);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (suppressAutoClose) return;
    requestLeave(() => onOpenChange(false));
  };

  return (
    <Sheet open={open && slot !== null} onOpenChange={handleOpenChange}>
      {open && slot ? (
        <SheetContent
          side="bottom"
          className="flex h-[92vh] w-full max-w-none flex-col gap-0 rounded-t-3xl border-t border-border p-0"
          showCloseButton={!suppressAutoClose}
          onPointerDownOutside={(e) => {
            if (suppressAutoClose) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (suppressAutoClose) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (suppressAutoClose) e.preventDefault();
          }}
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
            onProductPickerClose={onProductPickerClose}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
