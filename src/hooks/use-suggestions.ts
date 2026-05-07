"use client";

import {
  keepPreviousData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  createOnDemandSuggestion,
  getSuggestion,
  getSuggestionAiConsent,
  getSuggestionHistory,
  getSuggestionHistoryDay,
  getTodaysSuggestion,
  getRoutineBreak,
  recordSuggestionGapAction,
  regenerateSuggestion,
  resumeRoutineBreak,
  retryOnDemandSuggestion,
  snoozeRecordingReminder,
  startRoutineBreak,
  updateSuggestionAiConsent,
  updateRoutineBreak,
  useNormalRoutineForToday,
} from "@/services/suggestions.service";
import type {
  CreateOnDemandSuggestionPayload,
  RecordSuggestionGapActionPayload,
  RegenerateSuggestionPayload,
  SnoozeRecordingReminderPayload,
  RoutineBreakState,
  SuggestionAiConsent,
  SuggestionHistoryDay,
  SuggestionHistoryListQuery,
  SuggestionHistoryListResponse,
  StartRoutineBreakPayload,
  TodaysSuggestionResponse,
  UpdateSuggestionAiConsentPayload,
  UpdateRoutineBreakPayload,
} from "@/types/suggestions";

const TODAYS_SUGGESTION_REFETCH_INTERVAL_MS = 60_000;
const TODAYS_SUGGESTION_ACTIVE_REFETCH_INTERVAL_MS = 5_000;

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
    refetchInterval: (query) =>
      getTodaysSuggestionRefetchInterval(query.state.data),
  });
}

export function getTodaysSuggestionRefetchInterval(
  data: TodaysSuggestionResponse | undefined,
): number {
  return hasGeneratingSuggestion(data)
    ? TODAYS_SUGGESTION_ACTIVE_REFETCH_INTERVAL_MS
    : TODAYS_SUGGESTION_REFETCH_INTERVAL_MS;
}

function hasGeneratingSuggestion(
  data: TodaysSuggestionResponse | undefined,
): boolean {
  if (!data) return false;
  return (
    data.onDemandSuggestions.some(
      (suggestion) => suggestion.status === "generating",
    ) ||
    data.slots.some(
      (slot) =>
        slot.status === "generating" ||
        slot.suggestion?.generationStatus === "generating",
    )
  );
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

export function useCreateOnDemandSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOnDemandSuggestionPayload) =>
      createOnDemandSuggestion(payload),
    onSuccess: (suggestion) => {
      queryClient.setQueryData([QueryKey.Suggestion, suggestion.id], suggestion);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsHistory],
      });
    },
  });
}

export function useSuggestionAiConsent() {
  const isEnabled = useAuthEnabled();
  return useQuery<SuggestionAiConsent>({
    queryKey: [QueryKey.SuggestionAiConsent],
    queryFn: getSuggestionAiConsent,
    enabled: isEnabled,
  });
}

export function useUpdateSuggestionAiConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSuggestionAiConsentPayload) =>
      updateSuggestionAiConsent(payload),
    onSuccess: (consent) => {
      queryClient.setQueryData([QueryKey.SuggestionAiConsent], consent);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
    },
  });
}

export function useRetryOnDemandSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retryOnDemandSuggestion(id),
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

export function useRoutineBreak() {
  const isEnabled = useAuthEnabled();
  return useQuery<RoutineBreakState>({
    queryKey: [QueryKey.SuggestionBreak],
    queryFn: getRoutineBreak,
    enabled: isEnabled,
  });
}

export function useStartRoutineBreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartRoutineBreakPayload) =>
      startRoutineBreak(payload),
    onSuccess: () => invalidateRoutineBreakQueries(queryClient),
  });
}

export function useResumeRoutineBreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeRoutineBreak,
    onSuccess: () => invalidateRoutineBreakQueries(queryClient),
  });
}

export function useUpdateRoutineBreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRoutineBreakPayload;
    }) => updateRoutineBreak(id, payload),
    onSuccess: () => invalidateRoutineBreakQueries(queryClient),
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

function invalidateRoutineBreakQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QueryKey.SuggestionBreak] });
  void queryClient.invalidateQueries({ queryKey: [QueryKey.SuggestionsToday] });
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
