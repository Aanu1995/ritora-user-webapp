'use client';

import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type Props = {
  onAddFirst: () => void;
};

export function ShelfEmptyState({ onAddFirst }: Props) {
  const t = useTranslations('shelf.empty');

  return (
    <section
      className="px-6 py-5 sm:px-12 sm:py-10"
      aria-labelledby="shelf-empty-title"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Image
          src="/illustrations/empty-shelf.svg"
          alt=""
          width={560}
          height={300}
          priority
          className="h-24 w-auto sm:h-44 lg:h-48"
        />

        <h2
          id="shelf-empty-title"
          className="mt-2 font-display text-xl font-bold -tracking-[0.01em] sm:mt-5 sm:text-2xl"
        >
          {t('title')}
        </h2>
        <p className="mt-1.5 max-w-xl text-sm leading-snug text-muted sm:mt-2 sm:text-base sm:leading-relaxed">
          {t('description')}
        </p>

        <Button className="mt-4 sm:mt-6" onClick={onAddFirst}>
          <Plus className="h-3.5 w-3.5" />
          {t('cta')}
        </Button>
      </div>
    </section>
  );
}
