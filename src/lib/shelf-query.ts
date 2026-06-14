'use client';

import { QueryKey } from '@/constants/query-keys';
import {
  ShelfIntroductionStatusFilter,
  type ShelfListFilters,
  ShelfStatFilter,
} from '@/types/shelf';

type ShelfQueryDateContext = {
  timeZone: string;
  todayDate: string;
};

export function isShelfStatDateSensitive(stat: ShelfStatFilter): boolean {
  return (
    stat === ShelfStatFilter.Expired ||
    stat === ShelfStatFilter.NearingExpiry
  );
}

export function buildShelfProductsQueryKey(
  filters: ShelfListFilters,
  dateContext: ShelfQueryDateContext,
): string[] {
  const introductionStatus =
    filters.introductionStatus ?? ShelfIntroductionStatusFilter.All;
  const queryKey = [
    QueryKey.Shelf,
    filters.stat,
    filters.category,
    introductionStatus,
    filters.search,
    filters.sort,
  ];

  if (isShelfStatDateSensitive(filters.stat)) {
    queryKey.push(dateContext.timeZone, dateContext.todayDate);
  }

  return queryKey;
}

export function buildShelfStatsQueryKey(
  dateContext: ShelfQueryDateContext,
): string[] {
  return [
    QueryKey.Shelf,
    'stats',
    dateContext.timeZone,
    dateContext.todayDate,
  ];
}
