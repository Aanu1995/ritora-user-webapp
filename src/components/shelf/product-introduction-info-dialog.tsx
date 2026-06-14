'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  PRODUCT_INTRODUCTION_INFO_STATUSES,
  PRODUCT_INTRODUCTION_STATUS_META,
  PRODUCT_INTRODUCTION_TONE,
} from './product-introduction-status-data';

type ProductIntroductionInfoDialogProps = {
  stopPropagation?: boolean;
  triggerClassName?: string;
};

export function ProductIntroductionInfoDialog({
  stopPropagation = false,
  triggerClassName,
}: ProductIntroductionInfoDialogProps) {
  const t = useTranslations('shelf.introduction.info');
  const tStatus = useTranslations('shelf.introduction.status');
  const stopCardEvent = (
    event:
      | KeyboardEvent<HTMLButtonElement>
      | MouseEvent<HTMLButtonElement>
      | PointerEvent<HTMLButtonElement>,
  ) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('openLabel')}
          onClick={stopCardEvent}
          onKeyDown={stopCardEvent}
          onPointerDown={stopCardEvent}
          className={cn(
            'h-7 w-7 text-muted hover:text-foreground',
            triggerClassName,
          )}
        >
          <Info className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" stopPropagation={stopPropagation}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid max-h-[60dvh] gap-3 overflow-y-auto pr-1">
          {PRODUCT_INTRODUCTION_INFO_STATUSES.map((status) => {
            const meta = PRODUCT_INTRODUCTION_STATUS_META[status];
            const tone = PRODUCT_INTRODUCTION_TONE[meta.tone];
            const Icon = meta.icon;
            return (
              <div
                key={status}
                className="rounded-2xl border border-border bg-surface p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                      tone.tile,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tStatus(status)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`details.${status}.meaning`)}
                </p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-accent-strong">
                  {t(`details.${status}.suggestions`)}
                </p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
