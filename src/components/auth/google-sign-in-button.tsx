'use client';

import { useTranslations } from 'next-intl';
import { GoogleG } from '@/components/icons/google-g';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { cn } from '@/lib/utils';

interface GoogleSignInButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export function GoogleSignInButton({
  onClick,
  isLoading = false,
  isDisabled = false,
  label,
  loadingLabel,
  className,
}: GoogleSignInButtonProps) {
  const t = useTranslations('auth');
  const resolvedLabel = label ?? t('continueWithGoogle');
  const resolvedLoadingLabel = loadingLabel ?? t('openingGoogle');
  const disabled = isDisabled || isLoading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5',
        'rounded-full border text-sm font-medium',
        'border-[var(--google-stroke)] bg-[var(--google-fill)] text-[var(--google-text)]',
        'transition outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        'hover:-translate-y-0.5 hover:shadow-soft',
        'disabled:pointer-events-none disabled:translate-y-0 disabled:!border-border disabled:!bg-surface-muted disabled:!text-muted disabled:!shadow-none',
        className,
      )}
    >
      {isLoading ? (
        <LoadingIndicator label={resolvedLoadingLabel} size="sm" />
      ) : (
        <>
          <GoogleG className="h-[18px] w-[18px] shrink-0" />
          <span>{resolvedLabel}</span>
        </>
      )}
    </button>
  );
}
