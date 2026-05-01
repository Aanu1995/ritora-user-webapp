"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCalendar } from "@/hooks/use-skin-journal";
import type { PhotoDateIndex } from "@/types/skin-journal";
import { formatJournalShortDate } from "./journal-date";
import { JournalCalendar } from "./journal-calendar";

interface PhotoDatePickerProps {
  value: string | null;
  onChange: (next: string) => void;
  label: string;
  photoDates: PhotoDateIndex;
  disabledDate?: string | null;
}

function todayYmd(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function monthFromDate(date: string | null | undefined): string | null {
  return date ? date.slice(0, 7) : null;
}

function currentMonth(): string {
  return todayYmd().slice(0, 7);
}

function addMonths(month: string, delta: -1 | 1): string {
  const [year, monthNumber] = month.split("-").map((part) => parseInt(part, 10));
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string, locale: string): string {
  const [year, monthNumber] = month.split("-").map((part) => parseInt(part, 10));
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
}

export function PhotoDatePicker({
  value,
  onChange,
  label,
  photoDates,
  disabledDate,
}: PhotoDatePickerProps) {
  const t = useTranslations("journal.compare");
  const locale = useLocale();
  const firstTrackedMonth = photoDates.months[0]?.month ?? currentMonth();
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    monthFromDate(value) ?? firstTrackedMonth,
  );
  const photoDateSet = useMemo(
    () =>
      new Set(
        photoDates.dates
          .map((item) => item.date)
          .filter((date) => date !== disabledDate),
      ),
    [disabledDate, photoDates.dates],
  );
  const { data: calendarData, isLoading } = useCalendar(visibleMonth);
  const displayValue = value
    ? formatJournalShortDate(value, locale)
    : t("pickPhotoDate");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={label}
          className="h-11 w-full justify-between rounded-xl px-3"
        >
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted" />
            {displayValue}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,380px)] p-0" align="start">
        <JournalCalendar
          payload={calendarData}
          isLoading={isLoading}
          selectedDate={value}
          onSelectDate={(date) => {
            onChange(date);
            setOpen(false);
          }}
          todayLocalDate={todayYmd()}
          onChangeMonth={(delta) => setVisibleMonth(addMonths(visibleMonth, delta))}
          monthLabel={formatMonth(visibleMonth, locale)}
          selectableDates={photoDateSet}
          disableUnavailableDates
          monthOptions={photoDates.months}
          onSelectMonth={setVisibleMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
