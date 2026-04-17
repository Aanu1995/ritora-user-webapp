'use client';

import { Archive, Check, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  selectedCount: number;
  onArchive: () => void;
  onMarkFinished: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export function BulkActionToolbar({
  selectedCount,
  onArchive,
  onMarkFinished,
  onDelete,
  onClear,
}: Props) {
  const t = useTranslations('shelf');

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none sticky bottom-4 mt-8 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 pl-4 text-background shadow-[var(--shadow-hero)]">
        <span className="text-sm font-semibold">
          {t('bulk.selected', { count: selectedCount })}
        </span>
        <ActionButton
          label={t('actions.archive')}
          tooltip={t('bulk.archiveTooltip')}
          onClick={onArchive}
        >
          <Archive className="h-3.5 w-3.5" />
        </ActionButton>
        <ActionButton
          label={t('actions.markFinished')}
          tooltip={t('bulk.finishedTooltip')}
          onClick={onMarkFinished}
        >
          <Check className="h-3.5 w-3.5" />
        </ActionButton>
        <ActionButton
          label={t('actions.delete')}
          tooltip={t('bulk.deleteTooltip')}
          onClick={onDelete}
          variant="danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ActionButton>
        <button
          type="button"
          aria-label={t('actions.clearSelection')}
          onClick={onClear}
          className="rounded-full p-1.5 text-background/70 hover:bg-background/10 hover:text-background"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

type ActionProps = {
  label: string;
  tooltip: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
};

function ActionButton({
  label,
  tooltip,
  onClick,
  children,
  variant = 'default',
}: ActionProps) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-background/20 px-3 py-1.5 text-[13px] transition',
        'hover:bg-background/10',
        variant === 'danger' && 'text-danger',
      )}
    >
      {children}
      {label}
    </button>
  );
}
