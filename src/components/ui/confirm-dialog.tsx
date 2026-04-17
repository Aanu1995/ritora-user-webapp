'use client';

import { AlertTriangle } from 'lucide-react';
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
import { Button } from './button';
import { cn } from '@/lib/utils';

type Tone = 'danger' | 'warning' | 'neutral';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: Tone;
  isPending?: boolean;
};

const TONE_ICON_CLASS: Record<Tone, string> = {
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  neutral: 'bg-accent-soft text-accent-strong',
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  tone = 'neutral',
  isPending,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
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
              {description ? (
                <AlertDialogDescription className="mt-1.5">
                  {description}
                </AlertDialogDescription>
              ) : null}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={isPending}
              className={cn(
                tone === 'danger' &&
                  'bg-danger text-surface hover:bg-danger/90',
              )}
            >
              {isPending ? 'Working…' : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
