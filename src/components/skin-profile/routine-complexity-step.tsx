import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface RoutineComplexityStepProps {
  label: string;
  values: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  translateOption: (value: string) => string;
}

export function RoutineComplexityStep({
  label,
  values,
  selectedValue,
  onChange,
  translateOption,
}: RoutineComplexityStepProps) {
  return (
    <div>
      <Label className="block text-sm font-medium">{label}</Label>
      <RadioGroup
        value={selectedValue}
        onValueChange={onChange}
        className="mt-3 space-y-3"
      >
        {values.map((value) => (
          <div
            key={value}
            className={cn(
              'flex items-center gap-4 rounded-xl border p-4 transition',
              selectedValue === value
                ? 'border-accent bg-accent/5'
                : 'border-border',
            )}
          >
            <RadioGroupItem
              id={`routineComplexity-${value}`}
              value={value}
            />
            <Label
              htmlFor={`routineComplexity-${value}`}
              className="cursor-pointer text-sm font-medium"
            >
              {translateOption(value)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
