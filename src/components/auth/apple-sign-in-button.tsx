'use client';

import { useTranslations } from 'next-intl';
import { AppleLogo } from '@/components/icons/apple-logo';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { cn } from '@/lib/utils';

interface AppleSignInButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export function AppleSignInButton({
  onClick,
  isLoading = false,
  isDisabled = false,
  label,
  loadingLabel,
  className,
}: AppleSignInButtonProps) {
  const t = useTranslations('auth');
  const resolvedLabel = label ?? t('continueWithApple');
  const resolvedLoadingLabel = loadingLabel ?? t('openingApple');
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
        'border-[var(--apple-stroke)] bg-[var(--apple-fill)] text-[var(--apple-text)]',
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
          <AppleLogo className="-mt-0.5 h-[18px] w-[18px] shrink-0" />
          <span>{resolvedLabel}</span>
        </>
      )}
    </button>
  );
}
