'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { ProductIllustration } from '@/components/shelf/product-illustration';
import { cn } from '@/lib/utils';
import type { ProductCategory } from '@/types/shelf';

type Props = {
  imageUrls: string[];
  brand: string;
  productName: string;
  category: ProductCategory;
};

export function ProductImageCarousel({
  imageUrls,
  brand,
  productName,
  category,
}: Props) {
  const t = useTranslations('shelf.detail.carousel');
  const [index, setIndex] = useState(0);
  const total = imageUrls.length;
  const hasImages = total > 0;

  const prev = useCallback(() => {
    if (!hasImages) {
      return;
    }
    setIndex((current) => (current - 1 + total) % total);
  }, [hasImages, total]);

  const next = useCallback(() => {
    if (!hasImages) {
      return;
    }
    setIndex((current) => (current + 1) % total);
  }, [hasImages, total]);

  useEffect(() => {
    if (!hasImages) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prev();
      } else if (event.key === 'ArrowRight') {
        next();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasImages, prev, next]);

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-muted"
      aria-roledescription="carousel"
    >
      {hasImages ? (
        <Image
          src={imageUrls[index]}
          alt={`${brand} ${productName}`}
          fill
          unoptimized
          sizes="(max-width: 820px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ProductIllustration
            brand={brand}
            category={category}
            className="h-[58%] w-auto"
          />
        </div>
      )}

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label={t('previousImage')}
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2 text-foreground shadow-[var(--shadow-soft)] hover:bg-surface"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t('nextImage')}
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2 text-foreground shadow-[var(--shadow-soft)] hover:bg-surface"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div
            className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
            aria-hidden
          >
            {imageUrls.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={cn(
                  'h-1.5 w-1.5 rounded-full bg-foreground/25 transition',
                  dotIndex === index && 'bg-accent-strong',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
