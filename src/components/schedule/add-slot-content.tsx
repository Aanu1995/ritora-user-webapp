'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/ui/time-picker';
import { useCreateSlots } from '@/hooks/use-schedule';
import { TIME_REGEX } from '@/lib/schedule-schemas';
import {
  AddSlotPresetMode,
  DAYS_OF_WEEK,
  DayOfWeek,
  SlotMode,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import { SlotModeToggle } from './slot-mode-toggle';

function computeInitialDays(
  presetMode: AddSlotPresetMode,
  preselectDay: DayOfWeek | null,
): Set<DayOfWeek> {
  if (presetMode === AddSlotPresetMode.EveryDay) {
    return new Set(DAYS_OF_WEEK);
  }
  if (preselectDay) {
    return new Set([preselectDay]);
  }
  return new Set();
}

type AddSlotContentProps = {
  presetMode: AddSlotPresetMode;
  preselectDay: DayOfWeek | null;
  onClose: () => void;
  onCreated?: () => void;
  /** Render a visible close X in the header (inline panels need one; Sheets have their own). */
  showCloseButton?: boolean;
};

export function AddSlotContent({
  presetMode,
  preselectDay,
  onClose,
  onCreated,
  showCloseButton = false,
}: AddSlotContentProps) {
  const t = useTranslations('schedule');
  const tCommon = useTranslations('common');
  const createSlots = useCreateSlots();

  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(() =>
    computeInitialDays(presetMode, preselectDay),
  );
  const [slotTime, setSlotTime] = useState('08:00');
  const [mode, setMode] = useState<SlotMode>(SlotMode.AI);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const isValidTime = TIME_REGEX.test(slotTime);
  const canSubmit = isValidTime && selectedDays.size > 0;
  const isPending = createSlots.isPending;

  const submit = () => {
    if (!canSubmit || isPending) return;

    createSlots.mutate(
      {
        daysOfWeek: DAYS_OF_WEEK.filter((day) => selectedDays.has(day)),
        slotTime,
        mode,
      },
      {
        onError: () => {
          toast.error(t('save.errorGeneric'));
        },
        onSuccess: () => {
          toast.success(t('save.saved'));
          onClose();
          onCreated?.();
        },
      },
    );
  };

  const submitLabel =
    selectedDays.size <= 1
      ? t('addDialog.submitSingle')
      : t('addDialog.submitMultiple', { count: selectedDays.size });

  const title =
    presetMode === AddSlotPresetMode.EveryDay
      ? t('addDialog.titleEveryDay')
      : t('addDialog.titleSingle');
  const subtitle =
    presetMode === AddSlotPresetMode.EveryDay
      ? t('addDialog.subtitleEveryDay')
      : t('addDialog.subtitleSingle');
  const daysHint =
    selectedDays.size === 7
      ? t('addDialog.daysHintEveryDay')
      : t('addDialog.daysHintSingle');

  return (
    <div className="flex h-full flex-col">
      <header
        className={cn(
          'border-b border-border px-5 py-4',
          !showCloseButton && 'pr-12',
          showCloseButton && 'flex items-start justify-between gap-3',
        )}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-surface-muted"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="border-b border-border px-5 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t('addDialog.daysLabel')}
          </p>
          <div className="flex gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const selected = selectedDays.has(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={selected}
                  className={cn(
                    'inline-flex h-10 min-w-10 flex-1 items-center justify-center rounded-full border text-sm font-semibold transition',
                    selected
                      ? 'border-accent bg-accent text-surface'
                      : 'border-border bg-surface text-foreground hover:border-accent',
                  )}
                >
                  {t(`days.${day}Initial`)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted">{daysHint}</p>
          {selectedDays.size === 0 ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {t('addDialog.selectAtLeastOneDay')}
            </p>
          ) : null}
        </section>

        <section className="border-b border-border px-5 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t('addDialog.timeLabel')}
          </p>
          <TimePicker
            value={slotTime}
            onChange={setSlotTime}
            invalid={!isValidTime}
            ariaLabel={t('addDialog.timeLabel')}
          />
          <p className="mt-2 text-[11px] text-muted">
            {t('addDialog.timeHint')}
          </p>
        </section>

        <section className="px-5 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t('addDialog.modeLabel')}
          </p>
          <SlotModeToggle value={mode} onChange={setMode} />
        </section>
      </div>

      <footer className="border-t border-border bg-surface px-5 py-4">
        <Button
          className="w-full"
          onClick={submit}
          disabled={!canSubmit || isPending}
        >
          {isPending ? t('save.saving') : submitLabel}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted">
          {t('addDialog.duplicateNote')}
        </p>
      </footer>
    </div>
  );
}
