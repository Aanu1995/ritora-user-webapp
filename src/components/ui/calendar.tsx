'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      className={cn('p-2 font-sans text-sm text-foreground', className)}
      classNames={{
        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-2',
        month_caption: 'flex items-center justify-center px-1 pt-1',
        caption_label: 'text-sm font-semibold',
        nav: 'absolute inset-x-0 flex items-center justify-between px-1',
        button_previous: cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-surface-muted text-foreground transition hover:bg-accent-soft hover:text-accent-strong',
        ),
        button_next: cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-surface-muted text-foreground transition hover:bg-accent-soft hover:text-accent-strong',
        ),
        month_grid: 'border-collapse',
        weekdays: 'flex',
        weekday:
          'flex h-8 w-8 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.04em] text-muted',
        week: 'flex w-full mt-1',
        day: 'h-8 w-8 p-0 text-sm',
        day_button: cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-full transition',
          'hover:bg-accent-soft hover:text-accent-strong',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong',
        ),
        today: 'font-semibold text-accent-strong',
        selected: '!bg-foreground !text-background hover:!bg-foreground',
        outside: 'text-muted opacity-50',
        disabled: 'cursor-not-allowed opacity-30',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
