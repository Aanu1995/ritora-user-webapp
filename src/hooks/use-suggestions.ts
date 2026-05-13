"use client";

import {
  type QueryClient,
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
  StartRoutineBreakPayload,
  TodaysSuggestionResponse,
  UpdateSuggestionAiConsentPayload,
  UpdateRoutineBreakPayload,
} from "@/types/suggestions";

const TODAYS_SUGGESTION_REFETCH_INTERVAL_MS = 60_000;
const TODAYS_SUGGESTION_ACTIVE_REFETCH_INTERVAL_MS = 5_000;
const TODAYS_SUGGESTION_MIN_REFETCH_INTERVAL_MS = 5_000;
const TODAYS_SUGGESTION_ENVIRONMENT_REFETCH_INTERVAL_MS = 60 * 60_000;

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
  nowMs = Date.now(),
): number | false {
  if (!data) return false;
  if (hasGeneratingSuggestion(data)) {
    return TODAYS_SUGGESTION_ACTIVE_REFETCH_INTERVAL_MS;
  }

  const nextRefetchIntervals = [
    getLockedSlotRefetchInterval(data, nowMs),
    getEnvironmentRefetchInterval(data, nowMs),
  ]
    .filter((value): value is number => value !== null)
    .sort((first, second) => first - second)[0];

  return nextRefetchIntervals ?? false;
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

function getNextLockedSlotVisibleAtMs(
  data: TodaysSuggestionResponse,
  nowMs: number,
): number | null {
  const futureVisibleTimes = data.slots
    .filter((slot) => slot.status === "locked")
    .map((slot) => Date.parse(slot.visibleAt))
    .filter(
      (visibleAtMs) => Number.isFinite(visibleAtMs) && visibleAtMs > nowMs,
    )
    .sort((first, second) => first - second);

  return futureVisibleTimes[0] ?? null;
}

function getLockedSlotRefetchInterval(
  data: TodaysSuggestionResponse,
  nowMs: number,
): number | null {
  const nextVisibleAtMs = getNextLockedSlotVisibleAtMs(data, nowMs);
  if (nextVisibleAtMs === null) return null;

  return Math.min(
    Math.max(
      nextVisibleAtMs - nowMs,
      TODAYS_SUGGESTION_MIN_REFETCH_INTERVAL_MS,
    ),
    TODAYS_SUGGESTION_REFETCH_INTERVAL_MS,
  );
}

function getEnvironmentRefetchInterval(
  data: TodaysSuggestionResponse,
  nowMs: number,
): number | null {
  const generatedAt = data.environmentSummary?.generatedAt;
  if (!generatedAt) return null;

  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) return null;

  return Math.max(
    generatedAtMs + TODAYS_SUGGESTION_ENVIRONMENT_REFETCH_INTERVAL_MS - nowMs,
    TODAYS_SUGGESTION_MIN_REFETCH_INTERVAL_MS,
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
      queryClient.setQueryData(
        [QueryKey.Suggestion, suggestion.id],
        suggestion,
      );
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
      queryClient.setQueryData(
        [QueryKey.Suggestion, suggestion.id],
        suggestion,
      );
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
      queryClient.setQueryData(
        [QueryKey.Suggestion, suggestion.id],
        suggestion,
      );
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
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SmartPicksOverview],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SmartPicksWishlist],
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
    onSuccess: (_response, payload) => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SuggestionsToday],
      });
      if (payload.sourceType === "smart_pick") {
        void queryClient.invalidateQueries({
          queryKey: [QueryKey.SmartPicksOverview],
        });
        void queryClient.invalidateQueries({
          queryKey: [QueryKey.SmartPicksWishlist],
        });
      }
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

export {
  getNextSuggestionHistoryPageParam,
  mergeSuggestionHistoryPages,
  useSuggestionHistory,
  useSuggestionHistoryDay,
} from "@/hooks/use-suggestion-history";
