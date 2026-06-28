import { QueryKey } from '@/constants/query-keys';
import { SHELF_PRODUCTS_PAGE_SIZE } from '@/constants/shelf-pagination';
import {
  buildShelfProductsQueryKey,
  isShelfStatDateSensitive,
} from '@/lib/shelf-query';
import {
  ProductIntroductionStatus,
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
} from '@/types/shelf';

describe('shelf-query', () => {
  it('includes the introduction status filter in the products query key', () => {
    const queryKey = buildShelfProductsQueryKey(
      {
        stat: ShelfStatFilter.All,
        category: ShelfCategoryFilter.All,
        introductionStatus: ProductIntroductionStatus.Paused,
        search: '',
        sort: ShelfSort.RecentlyAdded,
      },
      {
        timeZone: 'Europe/Stockholm',
        todayDate: '2026-06-14',
      },
    );

    expect(queryKey).toEqual([
      QueryKey.Shelf,
      ShelfStatFilter.All,
      ShelfCategoryFilter.All,
      ProductIntroductionStatus.Paused,
      '',
      ShelfSort.RecentlyAdded,
      SHELF_PRODUCTS_PAGE_SIZE,
    ]);
  });

  it('keeps date context only for date-sensitive shelf stat filters', () => {
    expect(isShelfStatDateSensitive(ShelfStatFilter.All)).toBe(false);
    expect(isShelfStatDateSensitive(ShelfStatFilter.NearingExpiry)).toBe(true);
  });
});
