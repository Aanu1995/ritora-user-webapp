'use client';

import { useTranslations } from 'next-intl';
import { PhotosTab } from './photos-tab';
import type { ResolvedLookup } from '@/types/shelf';

type Props = {
  onPhotosChange?: () => void;
  onResult: (resolved: ResolvedLookup) => void;
};
export function QuickLookupCard({ onPhotosChange, onResult }: Props) {
  const tLookup = useTranslations('shelf.dialog.lookup');

  const handleResult = (resolved: ResolvedLookup) => {
    onResult(resolved);
  };

  return (
    <section className="rounded-3xl border border-border bg-surface p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold -tracking-[0.01em]">
          {tLookup('heading')}
        </h2>
        <p className="text-sm text-muted">
          {tLookup('description')}
        </p>
      </header>

      <div className="mt-5">
        <PhotosTab onPhotosChange={onPhotosChange} onResolved={handleResult} />
      </div>
    </section>
  );
}
