'use client';

import { Calendar, Check, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import Image from 'next/image';
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
  products: ShelfProduct[];
  timeZone: string;
  selectedIds: ReadonlySet<string>;
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

export function ProductList({
  products,
  timeZone,
  selectedIds,
  onOpen,
  onToggleSelect,
}: Props) {
  return (
    <div
      data-testid="product-list"
      className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {products.map((product) => (
        <ProductListRow
          key={product.id}
          product={product}
          timeZone={timeZone}
          isSelected={selectedIds.has(product.id)}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}

type RowProps = {
  product: ShelfProduct;
  isSelected: boolean;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
  timeZone: string;
};

function ProductListRow({
  product,
  isSelected,
  onOpen,
  onToggleSelect,
  timeZone,
}: RowProps) {
  const tCat = useTranslations('shelf.category');
  const tCard = useTranslations('shelf.card');

  const life = deriveShelfLife(product, { timeZone });
  const openedToken = formatOpenedToken(product, { timeZone });
  const remainingToken = formatRemainingToken(life);
  const isAging = life.state === ShelfLifeState.Aging;
  const isExpired = life.state === ShelfLifeState.Expired;
  const imageUrl = product.identity.imageUrls[0] ?? null;
  const accessibleName = `${product.identity.brand}, ${product.identity.name}`;

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
      onClick={() => onOpen(product.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(product.id);
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center gap-4 px-3 py-3 transition',
        'hover:bg-surface-muted',
        'focus-visible:bg-surface-muted focus-visible:outline-none',
        isSelected && 'bg-accent-soft/60 hover:bg-accent-soft/70',
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Select ${accessibleName}`}
        onClick={handleCheckboxClick}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong',
          isSelected
            ? 'border-accent-strong bg-accent-strong text-surface opacity-100'
            : 'border-border-strong bg-surface text-transparent opacity-0 group-hover:opacity-100',
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>

      {/* Thumbnail */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <ProductIllustration
            category={product.identity.category}
            brand={product.identity.brand}
            className="h-[72%] w-auto"
          />
        )}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              STATE_DOT_CLASS[life.state],
            )}
            aria-hidden
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
            {tCat(product.identity.category)}
          </span>
        </div>
        <p className="truncate text-[15px] font-semibold -tracking-[0.005em]">
          {product.identity.name}
        </p>
        <p className="truncate text-xs text-muted">
          {product.identity.brand}
        </p>
      </div>

      {/* Meta tokens */}
      <div className="hidden items-center gap-3 text-xs text-muted sm:flex">
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
              'inline-flex items-center gap-1 tabular-nums',
              isAging && 'text-warning',
              isExpired && 'text-danger',
            )}
          >
            <Clock className="h-3 w-3 opacity-70" />
            {remainingToken}
          </span>
        ) : null}
        {product.identity.sizeMl ? (
          <span className="tabular-nums opacity-80">
            {product.identity.sizeMl}
            {tCard('sizeSuffix')}
          </span>
        ) : null}
      </div>
    </div>
  );
}
