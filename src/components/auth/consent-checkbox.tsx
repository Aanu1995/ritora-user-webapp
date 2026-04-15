import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onBlur: () => void;
  onChange: (nextValue: boolean) => void;
  prefix: string;
  linkLabel: string;
  href: string;
  errorText?: string;
}

export function ConsentCheckbox({
  id,
  checked,
  onBlur,
  onChange,
  prefix,
  linkLabel,
  href,
  errorText,
}: ConsentCheckboxProps) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
        checked={checked}
        onBlur={onBlur}
          onCheckedChange={(nextValue) => onChange(Boolean(nextValue))}
          aria-invalid={Boolean(errorText)}
          aria-describedby={errorText ? `${id}-error` : undefined}
          className="mt-0.5"
        />
        <Label
          htmlFor={id}
          className="text-sm leading-6 font-normal text-muted"
        >
          {prefix}{' '}
          <Link
            href={href}
            className="font-medium text-accent-strong hover:underline"
            target="_blank"
          >
            {linkLabel}
          </Link>
        </Label>
      </div>
      {errorText ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
