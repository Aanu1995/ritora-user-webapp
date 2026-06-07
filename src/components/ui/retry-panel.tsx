'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ContactSupportButton } from '@/components/support/contact-support-button';

interface RetryPanelProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  illustrationSrc?: string;
  illustrationAlt?: string;
  /**
   * Hide the "Still stuck? Contact support" link beneath the retry button.
   * Default `false` so most callers automatically get the support escape
   * hatch when a retry isn't enough. Pass `true` for inline error blocks
   * where a support prompt would feel out of place.
   */
  hideSupportLink?: boolean;
}

export function RetryPanel({
  title,
  description,
  actionLabel,
  onAction,
  illustrationSrc = '/illustrations/load-error.svg',
  illustrationAlt = '',
  hideSupportLink = false,
}: RetryPanelProps) {
  const t = useTranslations('common.retryPanel');

  return (
    <section
      className="px-6 py-8 text-center sm:px-12 sm:py-14"
      role="alert"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <Image
          src={illustrationSrc}
          alt={illustrationAlt}
          width={480}
          height={300}
          className="h-24 w-auto sm:h-40"
        />

        <h2 className="mt-3 font-display text-xl font-bold -tracking-[0.01em] text-foreground sm:mt-6 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-snug text-muted sm:text-base sm:leading-relaxed">
          {description}
        </p>

        <Button
          type="button"
          variant="secondary"
          className="mt-5 sm:mt-7"
          onClick={onAction}
        >
          {actionLabel}
        </Button>

        {hideSupportLink ? null : (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <span>{t('stillStuck')}</span>
            <ContactSupportButton
              variant="link"
              size="sm"
              label={t('contactSupport')}
              className="h-auto text-sm"
            />
          </div>
        )}
      </div>
    </section>
  );
}
