'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type Props = {
  onAddFirst: () => void;
};

export function ShelfEmptyState({ onAddFirst }: Props) {
  const t = useTranslations('shelf.empty');

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border-strong px-8 py-16 text-center">
      <ShelfIllustration />
      <h2 className="mt-4 font-display text-2xl font-bold -tracking-[0.01em]">
        {t('title')}
      </h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        {t('description')}
      </p>
      <Button className="mt-6" onClick={onAddFirst}>
        <Plus className="h-4 w-4" />
        {t('cta')}
      </Button>
    </div>
  );
}

function ShelfIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      className="h-24 w-auto text-accent-strong opacity-90"
      role="img"
      aria-hidden
    >
      <rect x="20" y="30" width="160" height="6" rx="3" fill="currentColor" opacity="0.22" />
      <rect x="38" y="36" width="26" height="52" rx="5" fill="currentColor" opacity="0.55" />
      <rect x="70" y="44" width="20" height="44" rx="4" fill="currentColor" opacity="0.35" />
      <rect x="96" y="40" width="24" height="48" rx="5" fill="currentColor" opacity="0.48" />
      <rect x="126" y="48" width="22" height="40" rx="4" fill="currentColor" opacity="0.28" />
      <rect x="154" y="44" width="16" height="44" rx="4" fill="currentColor" opacity="0.4" />
      <rect x="20" y="88" width="160" height="6" rx="3" fill="currentColor" opacity="0.22" />
      <rect x="20" y="110" width="160" height="6" rx="3" fill="currentColor" opacity="0.18" />
    </svg>
  );
}
