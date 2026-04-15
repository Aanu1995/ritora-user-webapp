import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProfileSelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  translateOption: (value: string) => string;
}

export function ProfileSelectField({
  id,
  label,
  value,
  options,
  placeholder,
  onBlur,
  onChange,
  translateOption,
}: ProfileSelectFieldProps) {
  return (
    <div>
      <Label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </Label>
      <Select
        value={value || undefined}
        onValueChange={(nextValue) =>
          onChange(nextValue === '__empty__' ? '' : nextValue)
        }
      >
        <SelectTrigger id={id} name={id} onBlur={onBlur} className="mt-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {translateOption(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
