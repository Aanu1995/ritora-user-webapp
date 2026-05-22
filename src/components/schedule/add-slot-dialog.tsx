'use client';

import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { AddSlotPresetMode, type DayOfWeek } from '@/types/schedule';
import { AddSlotContent } from './add-slot-content';

type AddSlotDialogProps = {
  open: boolean;
  presetMode: AddSlotPresetMode;
  preselectDay: DayOfWeek | null;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onProductPickerClose?: () => void;
  suppressAutoClose?: boolean;
};

export function AddSlotDialog({
  open,
  presetMode,
  preselectDay,
  onOpenChange,
  onCreated,
  onProductPickerClose,
  suppressAutoClose = false,
}: AddSlotDialogProps) {
  const t = useTranslations('schedule');
  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (!suppressAutoClose) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {open ? (
        <SheetContent
          side="bottom"
          className="flex h-[85vh] w-full max-w-none flex-col gap-0 rounded-t-3xl border-t border-border p-0"
          showCloseButton={!suppressAutoClose}
          onPointerDownOutside={(event) => {
            if (suppressAutoClose) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (suppressAutoClose) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (suppressAutoClose) event.preventDefault();
          }}
        >
          <SheetTitle className="sr-only">
            {presetMode === AddSlotPresetMode.EveryDay
              ? t('addDialog.titleEveryDay')
              : t('addDialog.titleSingle')}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t('addDialog.sheetDescription')}
          </SheetDescription>
          <AddSlotContent
            key={`${presetMode}-${preselectDay ?? 'none'}`}
            presetMode={presetMode}
            preselectDay={preselectDay}
            onClose={() => onOpenChange(false)}
            onCreated={onCreated}
            onProductPickerClose={onProductPickerClose}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
