import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  className?: string;
  step?: number;
};

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  (
    { value, onChange, id, disabled, invalid, ariaLabel, className, step = 300 },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const openPicker = () => {
      if (disabled) return;
      const input = innerRef.current;
      if (!input) return;
      input.focus();
      if ('showPicker' in input) {
        try {
          (input as HTMLInputElement & { showPicker: () => void }).showPicker();
        } catch {
          // Fallback to focus only (some browsers require a direct user gesture path).
        }
      }
    };

    return (
      <div
        onClick={openPicker}
        className={cn(
          'flex h-12 w-full items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm transition focus-within:ring-2 focus-within:ring-accent/30',
          invalid ? 'border-destructive' : 'border-border',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className,
        )}
      >
        <Clock className="h-4 w-4 text-muted" aria-hidden="true" />
        <input
          ref={innerRef}
          id={id}
          type="time"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          aria-label={ariaLabel}
          data-slot="time-picker-input"
          className="time-picker-input w-full cursor-pointer bg-transparent font-semibold tabular-nums text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
        />
      </div>
    );
  },
);

TimePicker.displayName = 'TimePicker';

export { TimePicker };
