'use client';

import { Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ProductCategory,
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfViewMode,
} from '@/types/shelf';

type Counts = Partial<Record<ShelfStatFilter, number>>;

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  status: ShelfStatFilter;
  onStatusChange: (next: ShelfStatFilter) => void;
  counts: Counts;

  category: ProductCategory | ShelfCategoryFilter.All;
  onCategoryChange: (next: ProductCategory | ShelfCategoryFilter.All) => void;

  sort: ShelfSort;
  onSortChange: (next: ShelfSort) => void;

  view: ShelfViewMode;
  onViewChange: (next: ShelfViewMode) => void;
};

const STATUS_ORDER: ShelfStatFilter[] = [
  ShelfStatFilter.All,
  ShelfStatFilter.InUse,
  ShelfStatFilter.Unopened,
  ShelfStatFilter.NearingExpiry,
  ShelfStatFilter.Expired,
  ShelfStatFilter.Archived,
];

const CATEGORY_ORDER: ProductCategory[] = [
  ProductCategory.Cleanser,
  ProductCategory.Toner,
  ProductCategory.Essence,
  ProductCategory.Serum,
  ProductCategory.Moisturizer,
  ProductCategory.SunProtection,
  ProductCategory.Mask,
  ProductCategory.Exfoliant,
  ProductCategory.EyeCare,
  ProductCategory.LipCare,
  ProductCategory.Treatment,
  ProductCategory.Other,
];

const SORT_ORDER: ShelfSort[] = [
  ShelfSort.RecentlyAdded,
  ShelfSort.ExpiringSoon,
  ShelfSort.Alphabetical,
  ShelfSort.CategoryGrouped,
];

const STATUS_KEY: Record<ShelfStatFilter, string> = {
  [ShelfStatFilter.All]: 'all',
  [ShelfStatFilter.InUse]: 'inUse',
  [ShelfStatFilter.Unopened]: 'unopened',
  [ShelfStatFilter.NearingExpiry]: 'nearingExpiry',
  [ShelfStatFilter.Expired]: 'expired',
  [ShelfStatFilter.Archived]: 'archived',
};

const SORT_KEY: Record<ShelfSort, string> = {
  [ShelfSort.RecentlyAdded]: 'recentlyAdded',
  [ShelfSort.ExpiringSoon]: 'expiringSoon',
  [ShelfSort.Alphabetical]: 'alphabetical',
  [ShelfSort.CategoryGrouped]: 'categoryGrouped',
};

const PILL_TRIGGER =
  'h-10 w-auto min-w-0 rounded-full border-border-strong bg-surface px-3 text-sm font-medium hover:bg-surface-muted';

export function ShelfFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  counts,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: Props) {
  const t = useTranslations('shelf');
  const tStatus = useTranslations('shelf.stat');
  const tCategory = useTranslations('shelf.category');
  const tSort = useTranslations('shelf.sort');

  const statusCount = counts[status];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-2 sm:contents">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm focus-within:border-accent-strong sm:min-w-[220px]">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </label>

        <div className="inline-flex shrink-0 overflow-hidden rounded-full border border-border-strong bg-surface sm:order-last">
          <ViewButton
            active={view === ShelfViewMode.Grid}
            label={t('view.grid')}
            onClick={() => onViewChange(ShelfViewMode.Grid)}
          >
            <Grid className="h-4 w-4" />
          </ViewButton>
          <ViewButton
            active={view === ShelfViewMode.List}
            label={t('view.list')}
            onClick={() => onViewChange(ShelfViewMode.List)}
          >
            <List className="h-4 w-4" />
          </ViewButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as ShelfStatFilter)}
      >
        <SelectTrigger
          aria-label={tStatus('all')}
          className={PILL_TRIGGER}
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          <SelectValue>
            <span className="font-medium">
              {tStatus(STATUS_KEY[status])}
            </span>
            {status !== ShelfStatFilter.All && statusCount !== undefined ? (
              <span className="ml-1.5 rounded-full bg-accent-soft px-1.5 text-[11px] font-bold text-accent-strong">
                {statusCount}
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_ORDER.map((option) => (
            <SelectItem key={option} value={option}>
              {tStatus(STATUS_KEY[option])}
              {counts[option] !== undefined ? (
                <span className="ml-2 text-xs text-muted">
                  {counts[option]}
                </span>
              ) : null}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={category}
        onValueChange={(value) =>
          onCategoryChange(value as ProductCategory | ShelfCategoryFilter.All)
        }
      >
        <SelectTrigger
          aria-label={tCategory('all')}
          className={PILL_TRIGGER}
        >
          <SelectValue>
            <span className="font-medium">
              {tCategory(
                category === ShelfCategoryFilter.All ? 'all' : category,
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ShelfCategoryFilter.All}>{tCategory('all')}</SelectItem>
          {CATEGORY_ORDER.map((option) => (
            <SelectItem key={option} value={option}>
              {tCategory(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(value) => onSortChange(value as ShelfSort)}
      >
        <SelectTrigger
          aria-label={tSort('label')}
          className={PILL_TRIGGER}
        >
          <SelectValue>
            <span className="font-medium">{tSort(SORT_KEY[sort])}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_ORDER.map((option) => (
            <SelectItem key={option} value={option}>
              {tSort(SORT_KEY[option])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      </div>
    </div>
  );
}

type ViewButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

function ViewButton({ active, label, onClick, children }: ViewButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center px-3 text-muted transition',
        active && 'bg-foreground text-background',
      )}
    >
      {children}
    </button>
  );
}
