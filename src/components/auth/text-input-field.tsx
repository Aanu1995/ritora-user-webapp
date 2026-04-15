import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AuthFormField } from './auth-form-field';

interface TextInputFieldProps {
  id: string;
  label?: string;
  value: string;
  errorText?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  placeholder?: string;
  onBlur: () => void;
  onChange: (value: string) => void;
}

export function TextInputField({
  id,
  label,
  value,
  errorText,
  helperText,
  type = 'text',
  autoComplete,
  placeholder,
  onBlur,
  onChange,
}: TextInputFieldProps) {
  return (
    <AuthFormField
      id={id}
      label={label}
      errorText={errorText}
      helperText={helperText}
    >
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'mt-1',
          errorText && 'border-danger focus-visible:ring-danger/30',
        )}
        aria-invalid={Boolean(errorText)}
        aria-describedby={errorText ? `${id}-error` : undefined}
      />
    </AuthFormField>
  );
}
