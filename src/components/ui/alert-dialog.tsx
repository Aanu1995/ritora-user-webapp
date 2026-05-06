'use client';

import {
  Action as AlertDialogAction,
  Cancel as AlertDialogCancelPrimitive,
  Content as AlertDialogContentPrimitive,
  Description as AlertDialogDescriptionPrimitive,
  Overlay as AlertDialogOverlayPrimitive,
  Portal as AlertDialogPortalPrimitive,
  Root as AlertDialogRoot,
  Title as AlertDialogTitlePrimitive,
  Trigger as AlertDialogTriggerPrimitive,
} from '@radix-ui/react-alert-dialog';
import {
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

function AlertDialog(
  props: ComponentProps<typeof AlertDialogRoot>,
) {
  return <AlertDialogRoot data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(
  props: ComponentProps<typeof AlertDialogTriggerPrimitive>,
) {
  return (
    <AlertDialogTriggerPrimitive
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

function AlertDialogPortal(
  props: ComponentProps<typeof AlertDialogPortalPrimitive>,
) {
  return (
    <AlertDialogPortalPrimitive data-slot="alert-dialog-portal" {...props} />
  );
}

const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogOverlayPrimitive>,
  ComponentPropsWithoutRef<typeof AlertDialogOverlayPrimitive>
>(({ className, ...props }, ref) => (
  <AlertDialogOverlayPrimitive
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
AlertDialogOverlay.displayName = AlertDialogOverlayPrimitive.displayName;

const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogContentPrimitive>,
  ComponentPropsWithoutRef<typeof AlertDialogContentPrimitive>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogContentPrimitive
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface p-6 text-foreground shadow-[var(--shadow-hero)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogContentPrimitive.displayName;

function AlertDialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

function AlertDialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4',
        className,
      )}
      {...props}
    />
  );
}

const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogTitlePrimitive>,
  ComponentPropsWithoutRef<typeof AlertDialogTitlePrimitive>
>(({ className, ...props }, ref) => (
  <AlertDialogTitlePrimitive
    ref={ref}
    className={cn(
      'font-display text-lg font-bold tracking-tight',
      className,
    )}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogTitlePrimitive.displayName;

const AlertDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogDescriptionPrimitive>,
  ComponentPropsWithoutRef<typeof AlertDialogDescriptionPrimitive>
>(({ className, ...props }, ref) => (
  <AlertDialogDescriptionPrimitive
    ref={ref}
    className={cn('text-sm leading-relaxed text-muted', className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogDescriptionPrimitive.displayName;

const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogCancelPrimitive>,
  ComponentPropsWithoutRef<typeof AlertDialogCancelPrimitive>
>(({ className, ...props }, ref) => (
  <AlertDialogCancelPrimitive
    ref={ref}
    className={cn(
      'inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--border-strong)] bg-surface px-4 text-sm font-semibold text-foreground transition outline-none hover:bg-accent-soft hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogCancelPrimitive.displayName;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
