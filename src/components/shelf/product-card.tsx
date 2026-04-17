'use client';

import { Calendar, Check, Clock, Droplet } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import { ProductIllustration } from './product-illustration';
import { cn } from '@/lib/utils';
import {
  deriveShelfLife,
  formatOpenedToken,
  formatRemainingToken,
} from '@/lib/shelf-life';
import {
  ShelfLifeState,
  type ShelfProduct,
} from '@/types/shelf';

type Props = {
  product: ShelfProduct;
  isSelected: boolean;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
};

const STATE_DOT_CLASS: Record<ShelfLifeState, string> = {
  [ShelfLifeState.Fresh]: 'bg-success',
  [ShelfLifeState.Aging]: 'bg-warning',
  [ShelfLifeState.Expired]: 'bg-danger',
  [ShelfLifeState.Unopened]: 'bg-muted',
  [ShelfLifeState.Finished]: 'bg-muted',
  [ShelfLifeState.Archived]: 'bg-muted',
};

const STATE_BAR_CLASS: Record<ShelfLifeState, string> = {
  [ShelfLifeState.Fresh]: 'bg-success',
  [ShelfLifeState.Aging]: 'bg-warning',
  [ShelfLifeState.Expired]: 'bg-danger',
  [ShelfLifeState.Unopened]: 'bg-muted/40',
  [ShelfLifeState.Finished]: 'bg-muted/40',
  [ShelfLifeState.Archived]: 'bg-muted/40',
};

export function ProductCard({
  product,
  isSelected,
  onOpen,
  onToggleSelect,
}: Props) {
  const tCat = useTranslations('shelf.category');
  const tCard = useTranslations('shelf.card');
  const life = deriveShelfLife(product);
  const openedToken = formatOpenedToken(product);
  const remainingToken = formatRemainingToken(life);
  const isAging = life.state === ShelfLifeState.Aging;
  const isExpired = life.state === ShelfLifeState.Expired;
  const fraction = life.remainingFraction ?? (life.state === ShelfLifeState.Unopened ? 1 : 0);
  const fillWidthPercent = Math.max(4, Math.round(fraction * 100));
  const categoryLabel = tCat(product.identity.category);
  const imageUrl = product.identity.imageUrls[0] ?? null;
  const accessibleName = `${product.identity.brand}, ${product.identity.name}`;

  const handleCardClick = () => {
    onOpen(product.id);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(product.id);
    }
  };

  const handleCheckboxClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleSelect(product.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={accessibleName}
      aria-pressed={isSelected}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      data-testid={`product-card-${product.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-surface text-left transition',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]',
        'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong',
        isSelected
          ? 'border-accent-strong ring-2 ring-accent-soft'
          : 'border-border hover:border-border-strong',
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ProductIllustration
              category={product.identity.category}
              brand={product.identity.brand}
              className="h-[70%] w-auto"
            />
          </div>
        )}

        {/* Status dot */}
        <span
          className={cn(
            'absolute right-3 top-3 h-2.5 w-2.5 rounded-full ring-[3px] ring-surface',
            STATE_DOT_CLASS[life.state],
          )}
          aria-hidden
        />

        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          aria-label={accessibleName}
          onClick={handleCheckboxClick}
          className={cn(
            'absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md border transition',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong',
            isSelected
              ? 'border-accent-strong bg-accent-strong text-surface opacity-100'
              : 'border-border-strong bg-surface text-transparent opacity-0 group-hover:opacity-100',
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </button>

        {/* Category badge */}
        <span className="absolute bottom-4 left-3 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground">
          {categoryLabel}
        </span>

        {/* Shelf-life progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-foreground/10">
          <div
            className={cn('h-full transition-[width]', STATE_BAR_CLASS[life.state])}
            style={{ width: `${fillWidthPercent}%` }}
            data-testid="shelf-life-bar"
            data-status={life.state}
            aria-hidden
          />
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-3.5 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          {product.identity.brand}
        </span>
        <span className="line-clamp-1 text-[15px] font-semibold leading-snug -tracking-[0.01em]">
          {product.identity.name}
        </span>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
          {life.state === ShelfLifeState.Unopened ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-70" />
              {tCard('unopened')}
            </span>
          ) : openedToken ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-70" />
              {openedToken}
            </span>
          ) : null}

          {remainingToken && life.state !== ShelfLifeState.Unopened ? (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                isAging && 'text-warning',
                isExpired && 'text-danger',
              )}
            >
              <Clock className="h-3 w-3 opacity-70" />
              {remainingToken}
            </span>
          ) : null}

          {product.identity.sizeMl ? (
            <span className="inline-flex items-center gap-1 opacity-80">
              <Droplet className="h-3 w-3 opacity-70" aria-hidden />
              {product.identity.sizeMl}
              {tCard('sizeSuffix')}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
