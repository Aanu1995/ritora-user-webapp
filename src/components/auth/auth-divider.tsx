import { cn } from '@/lib/utils';

interface AuthDividerProps {
  label: string;
  className?: string;
}

export function AuthDivider({ label, className }: AuthDividerProps) {
  return (
    <div
      role="separator"
      className={cn(
        'relative flex items-center justify-center',
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-x-0 h-px bg-border" />
      <span className="relative bg-surface px-3 text-xs text-muted">
        {label}
      </span>
    </div>
  );
}
