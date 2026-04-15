import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface AuthFormFieldProps {
  id: string;
  label?: string;
  errorText?: string;
  helperText?: string;
  children: ReactNode;
}

export function AuthFormField({
  id,
  label,
  errorText,
  helperText,
  children,
}: AuthFormFieldProps) {
  return (
    <div>
      {label ? (
        <Label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </Label>
      ) : null}
      {helperText ? (
        <p className="mt-1 text-xs text-muted">{helperText}</p>
      ) : null}
      {children}
      {errorText ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
