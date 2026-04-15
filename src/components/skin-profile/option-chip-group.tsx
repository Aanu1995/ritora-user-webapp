import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptionChipGroupProps {
  label: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
  translateOption: (value: string) => string;
}

export function OptionChipGroup({
  label,
  options,
  values,
  onToggle,
  translateOption,
}: OptionChipGroupProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);

          return (
            <Button
              key={option}
              type="button"
              variant={active ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full',
                active
                  ? 'border-accent bg-accent/10 text-accent-strong'
                  : 'bg-surface text-muted hover:border-accent',
              )}
            >
              {translateOption(option)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
