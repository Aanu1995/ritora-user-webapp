'use client';

import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import type { RoutineStepProductSummary } from '@/types/schedule';
import { ProductPickerContent } from './product-picker-content';

type ProductPickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: RoutineStepProductSummary) => void;
};

export function ProductPickerSheet({
  open,
  onOpenChange,
  onSelect,
}: ProductPickerSheetProps) {
  const t = useTranslations('schedule.productPicker');

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleSelect = (product: RoutineStepProductSummary) => {
    onSelect(product);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {open ? (
        <SheetContent
          side="bottom"
          className="flex h-[85vh] w-full max-w-none flex-col gap-0 rounded-t-3xl border-t border-border p-0"
        >
          <SheetTitle className="sr-only">{t('title')}</SheetTitle>
          <SheetDescription className="sr-only">{t('title')}</SheetDescription>
          <ProductPickerContent
            onSelect={handleSelect}
            onClose={() => handleOpenChange(false)}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
