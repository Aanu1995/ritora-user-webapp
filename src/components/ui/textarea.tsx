import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      rows={rows}
      className={cn(
        'flex min-h-28 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground transition outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
