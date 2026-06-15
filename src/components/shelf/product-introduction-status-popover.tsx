'use client';

import { Check, Loader2, MoreVertical } from 'lucide-react';
import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  ProductIntroductionStatus,
  type ProductIntroduction,
} from '@/types/shelf';
import {
  PRODUCT_INTRODUCTION_JOURNEY,
  PRODUCT_INTRODUCTION_OFF_RAMP,
  PRODUCT_INTRODUCTION_STATUS_META,
  PRODUCT_INTRODUCTION_TONE,
} from './product-introduction-status-data';

type ProductIntroductionStatusPopoverProps = {
  productId: string;
  introduction?: ProductIntroduction | null;
  className?: string;
  triggerClassName?: string;
  isPending?: boolean;
  onChange?: (productId: string, status: ProductIntroductionStatus) => void;
  onOutsideDismiss?: () => void;
};

export function ProductIntroductionStatusPopover({
  productId,
  introduction,
  className,
  triggerClassName,
  isPending = false,
  onChange,
  onOutsideDismiss,
}: ProductIntroductionStatusPopoverProps) {
  const tStatus = useTranslations('shelf.introduction.status');
  const tQuick = useTranslations('shelf.introduction.quick');
  const [open, setOpen] = useState(false);
  const currentStatus =
    introduction?.status ?? ProductIntroductionStatus.Tolerated;

  const stopCardEvent = (
    event:
      | KeyboardEvent<HTMLButtonElement>
      | MouseEvent<HTMLButtonElement>
      | PointerEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };

  const handleStatusChange = (nextStatus: ProductIntroductionStatus) => {
    if (nextStatus === currentStatus || isPending || !onChange) {
      return;
    }

    onChange(productId, nextStatus);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={tQuick('openLabel', {
            status: tStatus(currentStatus),
          })}
          onClick={stopCardEvent}
          onKeyDown={stopCardEvent}
          onPointerDown={stopCardEvent}
          className={cn(
            '-my-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted',
            'transition hover:bg-surface-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
            triggerClassName,
          )}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <MoreVertical className="h-4 w-4" aria-hidden />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn('w-[min(21rem,calc(100vw-2rem))] p-0', className)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onInteractOutside={(event) => {
          onOutsideDismiss?.();
          event.detail.originalEvent.preventDefault();
          event.detail.originalEvent.stopPropagation();
          setOpen(false);
        }}
      >
        <div className="border-b border-border px-4 pb-3 pt-3.5">
          <p className="text-sm font-semibold text-foreground">
            {tQuick('title')}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {tQuick('description')}
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          <StatusGroup
            label={tQuick('groupActive')}
            statuses={PRODUCT_INTRODUCTION_JOURNEY}
            currentStatus={currentStatus}
            isPending={isPending}
            tStatus={tStatus}
            onSelect={handleStatusChange}
          />
          <StatusGroup
            label={tQuick('groupAside')}
            statuses={PRODUCT_INTRODUCTION_OFF_RAMP}
            currentStatus={currentStatus}
            isPending={isPending}
            tStatus={tStatus}
            onSelect={handleStatusChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StatusGroup({
  label,
  statuses,
  currentStatus,
  isPending,
  tStatus,
  onSelect,
}: {
  label: string;
  statuses: readonly ProductIntroductionStatus[];
  currentStatus: ProductIntroductionStatus;
  isPending: boolean;
  tStatus: ReturnType<typeof useTranslations>;
  onSelect: (status: ProductIntroductionStatus) => void;
}) {
  return (
    <div className="pb-1 last:pb-0">
      <p className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <div className="space-y-0.5">
        {statuses.map((status) => (
          <StatusChoice
            key={status}
            status={status}
            isSelected={status === currentStatus}
            isPending={isPending}
            label={tStatus(status)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function StatusChoice({
  status,
  isSelected,
  isPending,
  label,
  onSelect,
}: {
  status: ProductIntroductionStatus;
  isSelected: boolean;
  isPending: boolean;
  label: string;
  onSelect: (status: ProductIntroductionStatus) => void;
}) {
  const tQuick = useTranslations('shelf.introduction.quick');
  const meta = PRODUCT_INTRODUCTION_STATUS_META[status];
  const tone = PRODUCT_INTRODUCTION_TONE[meta.tone];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      disabled={isPending || isSelected}
      aria-label={tQuick('selectLabel', { status: label })}
      aria-pressed={isSelected}
      onClick={() => onSelect(status)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        isSelected
          ? 'bg-accent-soft'
          : 'hover:bg-surface-muted disabled:opacity-100',
        isPending && 'cursor-not-allowed',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
          tone.tile,
        )}
      >
        {isPending && isSelected ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-sm font-semibold',
            isSelected ? 'text-accent-strong' : 'text-foreground',
          )}
        >
          {label}
        </span>
        <span className="block text-xs leading-snug text-muted">
          {tQuick(`details.${status}`)}
        </span>
      </span>
      {isSelected ? (
        <Check
          className="h-4 w-4 shrink-0 text-accent-strong"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}
