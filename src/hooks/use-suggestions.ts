"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  getSuggestion,
  getSuggestionHistory,
  getSuggestionHistoryDay,
  getTodaysSuggestion,
  recordSuggestionGapAction,
  regenerateSuggestion,
  snoozeRecordingReminder,
  useNormalRoutineForToday,
} from "@/services/suggestions.service";
import type {
  RecordSuggestionGapActionPayload,
  RegenerateSuggestionPayload,
  SnoozeRecordingReminderPayload,
  SuggestionHistoryDay,
  SuggestionHistoryListQuery,
  SuggestionHistoryListResponse,
  TodaysSuggestionResponse,
} from "@/types/suggestions";

/**
 * One-minute refetch on Today: a slot's `isVisible` flag flips from false
 * to true at the visibility boundary (default 2 hours before slot time).
 * Window-focus refetch keeps it fresh when the user returns to the tab.
 */
const TODAYS_SUGGESTION_REFETCH_INTERVAL_MS = 60_000;

const EMPTY_HISTORY_RESPONSE: SuggestionHistoryListResponse = {
  days: [],
  nextCursor: null,
  totalApplied: 0,
  totalSlots: 0,
  totalEdited: 0,
  adherencePercent: null,
};

export function useTodaysSuggestion() {
  const isEnabled = useAuthEnabled();
  return useQuery<TodaysSuggestionResponse>({
    queryKey: [QueryKey.SuggestionsToday],
    queryFn: getTodaysSuggestion,
    enabled: isEnabled,
    refetchOnWindowFocus: true,
    refetchInterval: TODAYS_SUGGESTION_REFETCH_INTERVAL_MS,
  });
}

export function useSuggestion(id: string | null | undefined) {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.Suggestion, id],
    queryFn: () => getSuggestion(id as string),
    enabled: isEnabled && Boolean(id),
  });
}

export function useRegenerateSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: RegenerateSuggestionPayload;
    }) => regenerateSuggestion(id, payload),
    onSuccess: (suggestion) => {
      queryClient.setQueryData([QueryKey.Suggestion, suggestion.id], suggestion);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
    },
  });
}

export function useNormalRoutineToday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: useNormalRoutineForToday,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
    },
  });
}

export function useRecordSuggestionGapAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordSuggestionGapActionPayload) =>
      recordSuggestionGapAction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
    },
  });
}

export function useSnoozeRecordingReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SnoozeRecordingReminderPayload) =>
      snoozeRecordingReminder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
    },
  });
}

export function useSuggestionHistory(query: SuggestionHistoryListQuery = {}) {
  const isEnabled = useAuthEnabled();
  const baseQuery = historyQueryWithoutCursor(query);
  const history = useInfiniteQuery({
    queryKey: [QueryKey.SuggestionsHistory, baseQuery],
    queryFn: ({ pageParam }) =>
      getSuggestionHistory(withHistoryCursor(baseQuery, pageParam)),
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
    queryFn: () => getSuggestionHistoryDay(date as string),
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
      const seenSlotKeys = new Set(
        existing.slots.map((slot) => slot.suggestionId ?? slot.slotId),
      );
      existing.reactionFlagged =
        existing.reactionFlagged || day.reactionFlagged;
      existing.moodScore ??= day.moodScore;
      existing.hydrationTrend ??= day.hydrationTrend;
      existing.photoEntryId ??= day.photoEntryId;
      for (const slot of day.slots) {
        const key = slot.suggestionId ?? slot.slotId;
        if (key && seenSlotKeys.has(key)) continue;
        if (key) seenSlotKeys.add(key);
        existing.slots.push(slot);
      }
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
