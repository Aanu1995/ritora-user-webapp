"use client";

import {
  keepPreviousData,
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
  regenerateSuggestion,
} from "@/services/suggestions.service";
import type {
  RegenerateSuggestionPayload,
  SuggestionHistoryListQuery,
  TodaysSuggestionResponse,
} from "@/types/suggestions";

/**
 * One-minute refetch on Today: a slot's `isVisible` flag flips from false
 * to true at the visibility boundary (default 2 hours before slot time).
 * Window-focus refetch keeps it fresh when the user returns to the tab.
 */
const TODAYS_SUGGESTION_REFETCH_INTERVAL_MS = 60_000;

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

export function useSuggestionHistory(query: SuggestionHistoryListQuery = {}) {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SuggestionsHistory, query],
    queryFn: () => getSuggestionHistory(query),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
  });
}

export function useSuggestionHistoryDay(date: string | null | undefined) {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SuggestionsHistoryDay, date],
    queryFn: () => getSuggestionHistoryDay(date as string),
    enabled: isEnabled && Boolean(date),
  });
}
