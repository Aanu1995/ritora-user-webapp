'use client';

import {
  Close as DialogClosePrimitive,
  Content as DialogContentPrimitive,
  Description as DialogDescriptionPrimitive,
  Overlay as DialogOverlayPrimitive,
  Portal as DialogPortalPrimitive,
  Root as DialogRoot,
  Title as DialogTitlePrimitive,
  Trigger as DialogTriggerPrimitive,
} from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

function Dialog(props: ComponentProps<typeof DialogRoot>) {
  return <DialogRoot data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: ComponentProps<typeof DialogTriggerPrimitive>,
) {
  return <DialogTriggerPrimitive data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: ComponentProps<typeof DialogPortalPrimitive>,
) {
  return <DialogPortalPrimitive data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: ComponentProps<typeof DialogClosePrimitive>) {
  return <DialogClosePrimitive data-slot="dialog-close" {...props} />;
}

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogOverlayPrimitive>,
  ComponentPropsWithoutRef<typeof DialogOverlayPrimitive>
>(({ className, ...props }, ref) => (
  <DialogOverlayPrimitive
    ref={ref}
    className={cn(
      'fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogOverlayPrimitive.displayName;

const DialogContent = forwardRef<
  ElementRef<typeof DialogContentPrimitive>,
  ComponentPropsWithoutRef<typeof DialogContentPrimitive> & {
    showClose?: boolean;
  }
>(({ className, children, showClose = true, ...props }, ref) => {
  const t = useTranslations('common');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogContentPrimitive
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface p-6 text-foreground shadow-[var(--shadow-hero)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogClosePrimitive className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-accent-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
            <X className="h-4 w-4" />
            <span className="sr-only">{t('close')}</span>
          </DialogClosePrimitive>
        ) : null}
      </DialogContentPrimitive>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogContentPrimitive.displayName;

function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = forwardRef<
  ElementRef<typeof DialogTitlePrimitive>,
  ComponentPropsWithoutRef<typeof DialogTitlePrimitive>
>(({ className, ...props }, ref) => (
  <DialogTitlePrimitive
    ref={ref}
    className={cn('font-display text-lg font-bold tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogTitlePrimitive.displayName;

const DialogDescription = forwardRef<
  ElementRef<typeof DialogDescriptionPrimitive>,
  ComponentPropsWithoutRef<typeof DialogDescriptionPrimitive>
>(({ className, ...props }, ref) => (
  <DialogDescriptionPrimitive
    ref={ref}
    className={cn('text-sm leading-relaxed text-muted', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogDescriptionPrimitive.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
