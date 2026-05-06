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
};

export function AddSlotDialog({
  open,
  presetMode,
  preselectDay,
  onOpenChange,
  onCreated,
}: AddSlotDialogProps) {
  const t = useTranslations('schedule');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SheetContent
          side="bottom"
          className="flex h-[85vh] w-full max-w-none flex-col gap-0 rounded-t-3xl border-t border-border p-0"
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
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
