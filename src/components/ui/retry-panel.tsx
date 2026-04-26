'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface RetryPanelProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  illustrationSrc?: string;
  illustrationAlt?: string;
}

export function RetryPanel({
  title,
  description,
  actionLabel,
  onAction,
  illustrationSrc = '/illustrations/load-error.svg',
  illustrationAlt = '',
}: RetryPanelProps) {
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
          size="lg"
          className="mt-5 sm:mt-7"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
