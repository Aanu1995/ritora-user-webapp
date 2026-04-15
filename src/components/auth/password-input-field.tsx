import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AuthFormField } from './auth-form-field';

interface PasswordInputFieldProps {
  id: string;
  label?: string;
  value: string;
  errorText?: string;
  autoComplete?: string;
  showPassword: boolean;
  showLabel: string;
  hideLabel: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

export function PasswordInputField({
  id,
  label,
  value,
  errorText,
  autoComplete,
  showPassword,
  showLabel,
  hideLabel,
  onBlur,
  onChange,
  onToggleVisibility,
}: PasswordInputFieldProps) {
  return (
    <AuthFormField id={id} label={label} errorText={errorText}>
      <div className="relative mt-1">
        <Input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'pr-14',
            errorText && 'border-danger focus-visible:ring-danger/30',
          )}
          aria-invalid={Boolean(errorText)}
          aria-describedby={errorText ? `${id}-error` : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="absolute top-1/2 right-2 h-8 -translate-y-1/2 rounded-full px-2 text-xs font-medium text-muted shadow-none hover:text-foreground"
          aria-label={showPassword ? hideLabel : showLabel}
        >
          {showPassword ? hideLabel : showLabel}
        </Button>
      </div>
    </AuthFormField>
  );
}
