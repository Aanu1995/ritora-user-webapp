'use client';

import { useTranslations } from 'next-intl';
import { MAX_SLOT_NOTES_LENGTH, SlotMode } from '@/types/schedule';
import { cn } from '@/lib/utils';

type SlotNotesFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  mode: SlotMode;
  disabled?: boolean;
  errorText?: string;
};

export function SlotNotesField({
  id = 'slot-notes',
  value,
  onChange,
  onBlur,
  mode,
  disabled,
  errorText,
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
          htmlFor={id}
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
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_SLOT_NOTES_LENGTH))}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={cn(
          'w-full resize-none rounded-xl border border-border bg-surface-muted/30 px-3 py-2.5 text-sm text-foreground outline-none transition',
          errorText
            ? 'border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/30'
            : 'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
          'placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-invalid={Boolean(errorText)}
        aria-describedby={errorText ? `${id}-error` : undefined}
      />
      {errorText ? (
        <p id={`${id}-error`} className="mt-2 text-xs text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
      <div className="mt-1 text-right text-[10px] text-muted">
        {t('notesCounter', {
          current: value.length,
          max: MAX_SLOT_NOTES_LENGTH,
        })}
      </div>
    </div>
  );
}
