'use client';

import { useTranslations } from 'next-intl';
import { MAX_SLOT_NOTES_LENGTH, SlotMode } from '@/types/schedule';
import { cn } from '@/lib/utils';

type SlotNotesFieldProps = {
  value: string;
  onChange: (value: string) => void;
  mode: SlotMode;
  disabled?: boolean;
};

export function SlotNotesField({
  value,
  onChange,
  mode,
  disabled,
}: SlotNotesFieldProps) {
  const t = useTranslations('schedule.editor');
  const isManual = mode === SlotMode.Manual;
  const placeholder = isManual
    ? t('notesPlaceholderManual')
    : t('notesPlaceholderAI');
  const hint = isManual ? t('notesHintManual') : t('notesHintAI');
  const description = isManual
    ? t('notesDescriptionManual')
    : t('notesDescriptionAI');

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label
          htmlFor="slot-notes"
          className="text-[11px] font-semibold uppercase tracking-wide text-muted"
        >
          {t('notesLabel')}
        </label>
        <span className="text-[10px] text-muted">{hint}</span>
      </div>
      <p className="mb-2 text-xs leading-relaxed text-muted">{description}</p>
      {value.length === 0 ? (
        <p className="mb-2 text-[11px] italic text-muted">
          {t('notesEmpty')}
        </p>
      ) : null}
      <textarea
        id="slot-notes"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_SLOT_NOTES_LENGTH))}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={cn(
          'w-full resize-none rounded-xl border border-border bg-surface-muted/30 px-3 py-2.5 text-sm text-foreground outline-none transition',
          'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
          'placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />
      <div className="mt-1 text-right text-[10px] text-muted">
        {t('notesCounter', {
          current: value.length,
          max: MAX_SLOT_NOTES_LENGTH,
        })}
      </div>
    </div>
  );
}
