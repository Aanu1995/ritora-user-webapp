interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<LoadingIndicatorProps['size']>, string> = {
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-4 w-4 border-2',
};

export function LoadingIndicator({
  label,
  size = 'md',
  className,
}: LoadingIndicatorProps) {
  return (
    <span className={className ?? 'inline-flex items-center gap-2'}>
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-current border-t-transparent ${SIZE_CLASS[size]}`}
      />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
