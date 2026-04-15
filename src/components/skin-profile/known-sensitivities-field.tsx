import type { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KnownSensitivitiesFieldProps {
  label: string;
  placeholder: string;
  addLabel: string;
  emptyLabel: string;
  removeLabel: (value: string) => string;
  inputValue: string;
  values: string[];
  onInputChange: (value: string) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
}

export function KnownSensitivitiesField({
  label,
  placeholder,
  addLabel,
  emptyLabel,
  removeLabel,
  inputValue,
  values,
  onInputChange,
  onInputKeyDown,
  onAdd,
  onRemove,
}: KnownSensitivitiesFieldProps) {
  return (
    <div>
      <Label className="block text-sm font-medium" htmlFor="sensitivityInput">
        {label}
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="sensitivityInput"
          type="text"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className="rounded-xl"
        >
          {addLabel}
        </Button>
      </div>

      {values.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemove(value)}
              className="rounded-full bg-surface"
              aria-label={removeLabel(value)}
            >
              <span>{value}</span>
              <span aria-hidden="true">×</span>
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{emptyLabel}</p>
      )}
    </div>
  );
}
