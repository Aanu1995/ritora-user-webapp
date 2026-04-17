'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type Props = {
  onSwitchToManual: () => void;
};

export function ScanTab({ onSwitchToManual }: Props) {
  const t = useTranslations('shelf.dialog.scan');

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/95 text-background">
        <div className="pointer-events-none absolute left-3 top-3 h-9 w-9 rounded-tl-md border-l-2 border-t-2 border-accent-strong" />
        <div className="pointer-events-none absolute right-3 top-3 h-9 w-9 rounded-tr-md border-r-2 border-t-2 border-accent-strong" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-9 w-9 rounded-bl-md border-b-2 border-l-2 border-accent-strong" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 rounded-br-md border-b-2 border-r-2 border-accent-strong" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm">
          <p className="opacity-80">{t('comingSoon')}</p>
        </div>
      </div>
      <div className="flex justify-start">
        <Button variant="outline" onClick={onSwitchToManual}>
          {t('fallback')}
        </Button>
      </div>
    </div>
  );
}
