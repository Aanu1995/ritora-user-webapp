"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  getSuggestionHistory,
  getSuggestionHistoryDay,
} from "@/services/suggestions.service";
import type {
  SuggestionHistoryDay,
  SuggestionHistoryListQuery,
  SuggestionHistoryListResponse,
} from "@/types/suggestions";

const EMPTY_HISTORY_RESPONSE: SuggestionHistoryListResponse = {
  days: [],
  nextCursor: null,
  totalApplied: 0,
  totalSlots: 0,
  totalEdited: 0,
  adherencePercent: null,
};

export function useSuggestionHistory(
  query: SuggestionHistoryListQuery = {},
) {
  const isEnabled = useAuthEnabled();
  const baseQuery = historyQueryWithoutCursor(query);
  const history = useInfiniteQuery({
    queryKey: [QueryKey.SuggestionsHistory, baseQuery],
    queryFn: ({ pageParam, signal }) =>
      getSuggestionHistory(withHistoryCursor(baseQuery, pageParam), { signal }),
    enabled: isEnabled,
    initialPageParam: null as string | null,
    getNextPageParam: getNextSuggestionHistoryPageParam,
    placeholderData: keepPreviousData,
  });
  return {
    ...history,
    data: mergeSuggestionHistoryPages(history.data?.pages),
  };
}

export function useSuggestionHistoryDay(date: string | null | undefined) {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SuggestionsHistoryDay, date],
    queryFn: ({ signal }) =>
      getSuggestionHistoryDay(date as string, { signal }),
    enabled: isEnabled && Boolean(date),
  });
}

export function getNextSuggestionHistoryPageParam(
  lastPage: SuggestionHistoryListResponse,
): string | undefined {
  return lastPage.nextCursor ?? undefined;
}

export function mergeSuggestionHistoryPages(
  pages: SuggestionHistoryListResponse[] | undefined,
): SuggestionHistoryListResponse {
  if (!pages?.length) return EMPTY_HISTORY_RESPONSE;
  const dayByDate = new Map<string, SuggestionHistoryDay>();
  let totalApplied = 0;
  let totalSlots = 0;
  let totalEdited = 0;

  for (const page of pages) {
    totalApplied += page.totalApplied;
    totalSlots += page.totalSlots;
    totalEdited += page.totalEdited ?? 0;
    for (const day of page.days) {
      const existing = dayByDate.get(day.date);
      if (!existing) {
        dayByDate.set(day.date, { ...day, slots: [...day.slots] });
        continue;
      }
      mergeHistoryDay(existing, day);
    }
  }

  const days = Array.from(dayByDate.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
  for (const day of days) {
    day.slots.sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }

  return {
    days,
    nextCursor: pages.at(-1)?.nextCursor ?? null,
    totalApplied,
    totalSlots,
    totalEdited,
    adherencePercent:
      totalSlots > 0 ? Math.round((totalApplied / totalSlots) * 100) : null,
  };
}

function mergeHistoryDay(
  existing: SuggestionHistoryDay,
  incoming: SuggestionHistoryDay,
): void {
  const seenSlotKeys = new Set(
    existing.slots.map((slot) => slot.suggestionId ?? slot.slotId),
  );
  existing.reactionFlagged =
    existing.reactionFlagged || incoming.reactionFlagged;
  existing.moodScore ??= incoming.moodScore;
  existing.hydrationTrend ??= incoming.hydrationTrend;
  existing.photoEntryId ??= incoming.photoEntryId;
  existing.environmentSummary ??= incoming.environmentSummary;

  for (const slot of incoming.slots) {
    const key = slot.suggestionId ?? slot.slotId;
    if (key && seenSlotKeys.has(key)) continue;
    if (key) seenSlotKeys.add(key);
    existing.slots.push(slot);
  }
}

function historyQueryWithoutCursor(
  query: SuggestionHistoryListQuery,
): SuggestionHistoryListQuery {
  const rest = { ...query };
  delete rest.cursor;
  return rest;
}

function withHistoryCursor(
  query: SuggestionHistoryListQuery,
  cursor: string | null,
): SuggestionHistoryListQuery {
  return cursor ? { ...query, cursor } : query;
}
