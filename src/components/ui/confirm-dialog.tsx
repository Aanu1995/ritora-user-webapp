'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';

export enum ConfirmDialogTone {
  Danger = 'danger',
  Warning = 'warning',
  Neutral = 'neutral',
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  contentClassName?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: ConfirmDialogTone;
  isPending?: boolean;
};

const TONE_ICON_CLASS: Record<ConfirmDialogTone, string> = {
  [ConfirmDialogTone.Danger]: 'bg-danger/10 text-danger',
  [ConfirmDialogTone.Warning]: 'bg-warning/10 text-warning',
  [ConfirmDialogTone.Neutral]: 'bg-accent-soft text-accent-strong',
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  contentClassName,
  confirmLabel,
  cancelLabel,
  onConfirm,
  tone = ConfirmDialogTone.Neutral,
  isPending,
}: Props) {
  const t = useTranslations('common.confirmDialog');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader>
          <div className="mb-1 flex items-start gap-3">
            <span
              aria-hidden
              className={cn(
                'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                TONE_ICON_CLASS[tone],
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription
                className={cn('mt-1.5', !description && 'sr-only')}
              >
                {description ?? title}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {cancelLabel ?? t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              buttonVariants({ size: 'sm' }),
              tone === ConfirmDialogTone.Danger &&
                'bg-danger text-surface hover:bg-danger/90',
            )}
          >
            {isPending ? t('working') : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
