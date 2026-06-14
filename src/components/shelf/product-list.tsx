'use client';

import { Calendar, Check, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, type MouseEvent } from 'react';
import { ProductIllustration } from './product-illustration';
import { ProductIntroductionInfoDialog } from './product-introduction-info-dialog';
import { ProductIntroductionBadge } from './product-introduction-status';
import { ProductIntroductionStatusPopover } from './product-introduction-status-popover';
import { SmoothImage } from '@/components/ui/smooth-image';
import { cn } from '@/lib/utils';
import {
  deriveShelfLife,
  formatOpenedToken,
  formatRemainingToken,
} from '@/lib/shelf-life';
import {
  ProductIntroductionStatus,
  ShelfLifeState,
  type ShelfProduct,
} from '@/types/shelf';

type Props = {
  products: ShelfProduct[];
  timeZone: string;
  selectedIds: ReadonlySet<string>;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onIntroductionStatusChange?: (
    productId: string,
    status: ProductIntroductionStatus,
  ) => void;
  isIntroductionPending?: boolean;
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
  onIntroductionStatusChange,
  isIntroductionPending = false,
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
          onIntroductionStatusChange={onIntroductionStatusChange}
          isIntroductionPending={isIntroductionPending}
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
  onIntroductionStatusChange?: (
    productId: string,
    status: ProductIntroductionStatus,
  ) => void;
  isIntroductionPending: boolean;
  timeZone: string;
};

function ProductListRow({
  product,
  isSelected,
  onOpen,
  onToggleSelect,
  onIntroductionStatusChange,
  isIntroductionPending,
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
  const suppressRowOpenUntilRef = useRef(0);

  const handleCheckboxClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleSelect(product.id);
  };
  const handleRowClick = () => {
    if (Date.now() < suppressRowOpenUntilRef.current) {
      suppressRowOpenUntilRef.current = 0;
      return;
    }

    onOpen(product.id);
  };
  const handleStatusPopoverOutsideDismiss = () => {
    suppressRowOpenUntilRef.current = Date.now() + 350;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={accessibleName}
      aria-pressed={isSelected}
      onClick={handleRowClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(product.id);
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center gap-4 px-3 py-3 transition',
        'hover:bg-accent-soft',
        'focus-visible:bg-surface-muted focus-visible:outline-none',
        isSelected && 'bg-accent-soft/60 hover:bg-accent-soft/70',
      )}
    >
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

      <div
        data-testid={`product-list-image-${product.id}`}
        className="relative flex h-16 w-[5.5rem] shrink-0 items-center justify-center"
      >
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
          {imageUrl ? (
            <SmoothImage
              src={imageUrl}
              alt=""
              sizes="48px"
              className="h-full w-full rounded-xl"
              fallback={
                <span className="flex h-full w-full items-center justify-center">
                  <ProductIllustration
                    category={product.identity.category}
                    brand={product.identity.brand}
                    className="h-[72%] w-auto"
                  />
                </span>
              }
            />
          ) : (
            <ProductIllustration
              category={product.identity.category}
              brand={product.identity.brand}
              className="h-[72%] w-auto"
            />
          )}
        </div>
        <ProductIntroductionBadge
          introduction={product.introduction}
          className="absolute bottom-0 left-1/2 max-w-[5.25rem] -translate-x-1/2 scale-[0.82] truncate bg-surface/95 shadow-sm"
        />
      </div>

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
        <div
          data-testid={`product-list-introduction-actions-${product.id}`}
          className="-mr-1.5 flex items-center gap-0.5"
        >
          <p className="min-w-0 flex-1 truncate text-xs text-muted">
            {product.identity.brand}
          </p>
          <ProductIntroductionStatusPopover
            productId={product.id}
            introduction={product.introduction}
            onChange={onIntroductionStatusChange}
            onOutsideDismiss={handleStatusPopoverOutsideDismiss}
            isPending={isIntroductionPending}
          />
          <ProductIntroductionInfoDialog
            stopPropagation
            triggerClassName="-my-1.5 h-7 w-7 shrink-0 rounded-full hover:bg-surface-muted"
          />
        </div>
      </div>

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
