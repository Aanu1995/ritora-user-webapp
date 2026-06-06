"use client";

import { Calendar as CalendarIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { enUS, es, sv } from "react-day-picker/locale";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { formatLocalizedDate, toDateInputValue } from "@/lib/dayjs";
import { toShelfCalendarSelectionDate } from "@/lib/shelf-date";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  allowClear?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  currentDate?: Date;
};

function parseValue(value: string): Date | undefined {
  return toShelfCalendarSelectionDate(value);
}

function buildDisabledMatcher(
  minDate: Date | undefined,
  maxDate: Date | undefined,
) {
  if (!minDate && !maxDate) return undefined;
  if (minDate && maxDate) return { before: minDate, after: maxDate };
  if (minDate) return { before: minDate };
  return { after: maxDate as Date };
}

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth());
}

function clampDateToRange(
  date: Date,
  minDate: Date | undefined,
  maxDate: Date | undefined,
) {
  const dateOnlyValue = dateOnly(date);
  const min = minDate ? dateOnly(minDate) : undefined;
  const max = maxDate ? dateOnly(maxDate) : undefined;

  if (min && max && min.getTime() > max.getTime()) {
    return dateOnlyValue;
  }
  if (min && dateOnlyValue.getTime() < min.getTime()) {
    return min;
  }
  if (max && dateOnlyValue.getTime() > max.getTime()) {
    return max;
  }
  return dateOnlyValue;
}

function resolveCalendarLocale(locale: string) {
  if (locale.startsWith("sv")) return sv;
  if (locale.startsWith("es")) return es;
  return enUS;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  ariaLabel,
  allowClear = true,
  className,
  minDate,
  maxDate,
  currentDate,
}: Props) {
  const t = useTranslations("common.datePicker");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  const resolvedPlaceholder = placeholder ?? t("placeholder");
  const displayValue = formatLocalizedDate(value, locale);
  const defaultMonth = monthOnly(
    clampDateToRange(selected ?? currentDate ?? new Date(), minDate, maxDate),
  );
  const calendarLocale = resolveCalendarLocale(locale);
  const calendarKey = `${locale}-${toDateInputValue(defaultMonth)}`;

  const showClear = allowClear && Boolean(selected) && !disabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative w-full", className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={ariaLabel ?? resolvedPlaceholder}
            className={cn(
              "inline-flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-surface text-left text-sm transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong disabled:opacity-60",
              showClear ? "pl-3 pr-10" : "px-3",
              !selected && "text-muted",
            )}
          >
            <CalendarIcon
              className="h-4 w-4 shrink-0 text-muted"
              aria-hidden="true"
            />
            <span className="truncate">
              {displayValue ?? resolvedPlaceholder}
            </span>
          </button>
        </PopoverTrigger>
        {showClear ? (
          <button
            type="button"
            aria-label={t("clear")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <PopoverContent
        aria-label={t("dialogTitle")}
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          key={calendarKey}
          mode="single"
          selected={selected}
          defaultMonth={defaultMonth}
          startMonth={minDate ? monthOnly(minDate) : undefined}
          endMonth={maxDate ? monthOnly(maxDate) : undefined}
          locale={calendarLocale}
          labels={{
            labelNav: () => t("navigationLabel"),
            labelPrevious: () => t("previousMonth"),
            labelNext: () => t("nextMonth"),
          }}
          onSelect={(date) => {
            if (!date) {
              return;
            }
            onChange(toDateInputValue(date));
            setOpen(false);
          }}
          disabled={buildDisabledMatcher(minDate, maxDate)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
