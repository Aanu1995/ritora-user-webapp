import { useShelfUiStore } from '@/stores/shelf-ui-store';
import {
  ProductIntroductionStatus,
  ProductCategory,
  ShelfCategoryFilter,
  ShelfIntroductionStatusFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfViewMode,
} from '@/types/shelf';

afterEach(() => {
  useShelfUiStore.setState({
    selectedIds: new Set<string>(),
    sort: ShelfSort.RecentlyAdded,
    view: ShelfViewMode.Grid,
    stat: ShelfStatFilter.All,
    introductionStatus: ShelfIntroductionStatusFilter.All,
    activeCategory: ShelfCategoryFilter.All,
    search: '',
  });
});

describe('useShelfUiStore', () => {
  it('toggles selection and clears it', () => {
    useShelfUiStore.getState().toggleSelected('product-1');
    expect(useShelfUiStore.getState().selectedIds.has('product-1')).toBe(true);

    useShelfUiStore.getState().toggleSelected('product-1');
    expect(useShelfUiStore.getState().selectedIds.size).toBe(0);

    useShelfUiStore.getState().toggleSelected('product-2');
    useShelfUiStore.getState().clearSelection();
    expect(useShelfUiStore.getState().selectedIds.size).toBe(0);
  });

  it('clears selection when filters change', () => {
    useShelfUiStore.setState({
      selectedIds: new Set(['product-1', 'product-2']),
    });

    useShelfUiStore.getState().setStat(ShelfStatFilter.Archived);
    expect(useShelfUiStore.getState().selectedIds.size).toBe(0);

    useShelfUiStore.setState({
      selectedIds: new Set(['product-1']),
    });
    useShelfUiStore.getState().setActiveCategory(ProductCategory.Serum);
    expect(useShelfUiStore.getState().selectedIds.size).toBe(0);

    useShelfUiStore.setState({
      selectedIds: new Set(['product-1']),
    });
    useShelfUiStore.getState().setIntroductionStatus(
      ProductIntroductionStatus.Paused,
    );
    expect(useShelfUiStore.getState().selectedIds.size).toBe(0);

    useShelfUiStore.setState({
      selectedIds: new Set(['product-1']),
    });
    useShelfUiStore.getState().setSearch('retinol');
    expect(useShelfUiStore.getState().selectedIds.size).toBe(0);
  });

  it('updates non-filter preferences without resetting unrelated values', () => {
    useShelfUiStore.getState().setSort(ShelfSort.ExpiringSoon);
    useShelfUiStore.getState().setView(ShelfViewMode.List);

    expect(useShelfUiStore.getState().sort).toBe(ShelfSort.ExpiringSoon);
    expect(useShelfUiStore.getState().view).toBe(ShelfViewMode.List);
    expect(useShelfUiStore.getState().stat).toBe(ShelfStatFilter.All);
  });
});
