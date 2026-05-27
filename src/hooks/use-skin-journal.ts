"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import { upsertTodayWithProgress } from "@/hooks/use-skin-journal-upload";
import { invalidateAppNavBadges } from "@/lib/query-invalidation";
import {
  JOURNAL_ANALYSIS_POLL_INTERVAL_MS,
  shouldPollCalendar,
  shouldPollDay,
  shouldPollTodayEntry,
} from "@/hooks/use-skin-journal-polling";
import {
  acknowledgeEvent,
  compareDays,
  deleteEntry,
  getCalendar,
  getDay,
  getTodayEntry,
  listEvents,
  listPhotoFilters,
  listMonthEntries,
  listPhotoDates,
  listPhotos,
  recordAnalysisFeedback,
  reinterpretAnalysis,
  retryAnalysis,
  updateEntry,
} from "@/services/skin-journal.service";
import {
  PhotoFilterStaticId,
  type AnalysisFeedback,
  type AnalysisFeedbackReason,
  type AnalysisFeedbackVote,
  type JournalEventFilters,
  type PhotoDateIndex,
  type PhotoFilterId,
  type PhotoFilterIndex,
  type UpsertEntryPayload,
} from "@/types/skin-journal";

const EMPTY_EVENT_FILTERS: JournalEventFilters = {};
const JOURNAL_PHOTO_PAGE_SIZE = 24;

export {
  hasActiveAnalysisStatus,
  shouldPollCalendar,
  shouldPollDay,
} from "@/hooks/use-skin-journal-polling";
export {
  useAcknowledgeSimplification,
  useActiveSimplification,
  useCreateJournalExport,
  useDismissInsight,
  useInsights,
  useJournalExport,
  useJournalStats,
  useMarkInsightSeen,
  useRecordInsightAction,
  useSimplification,
  useStartSimplification,
  useWrapped,
  useWrappedList,
} from "@/hooks/use-skin-journal-secondary";

export function useTodayEntry() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalToday],
    queryFn: ({ signal }) => getTodayEntry({ signal }),
    enabled,
    refetchInterval: (query) =>
      shouldPollTodayEntry(query.state.data)
        ? JOURNAL_ANALYSIS_POLL_INTERVAL_MS
        : false,
  });
}

export function useCalendar(month: string) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalCalendar, month],
    queryFn: ({ signal }) => getCalendar(month, { signal }),
    enabled: enabled && !!month,
    refetchInterval: (query) =>
      shouldPollCalendar(query.state.data)
        ? JOURNAL_ANALYSIS_POLL_INTERVAL_MS
        : false,
  });
}

export function useDay(date: string | null) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalDay, date],
    queryFn: ({ signal }) => getDay(date as string, { signal }),
    enabled: enabled && !!date,
    refetchInterval: (query) =>
      shouldPollDay(query.state.data)
        ? JOURNAL_ANALYSIS_POLL_INTERVAL_MS
        : false,
  });
}

export function useMonthEntries(month: string) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalEntries, month],
    queryFn: ({ signal }) => listMonthEntries(month, { signal }),
    enabled: enabled && !!month,
  });
}

export function usePhotos(filters: {
  from?: string;
  to?: string;
  filter?: PhotoFilterId;
}, options: { enabled?: boolean } = {}) {
  const enabled = useAuthEnabled();
  const normalizedFilters = {
    ...filters,
    filter:
      filters.filter === PhotoFilterStaticId.All ? undefined : filters.filter,
  };
  return useInfiniteQuery({
    queryKey: [QueryKey.SkinJournalPhotos, normalizedFilters],
    queryFn: ({ pageParam, signal }) =>
      listPhotos({
        ...normalizedFilters,
        limit: JOURNAL_PHOTO_PAGE_SIZE,
        cursor: pageParam,
      }, { signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && options.enabled !== false,
  });
}

export function usePhotoFilters(filters: { from?: string; to?: string } = {}) {
  const enabled = useAuthEnabled();
  return useQuery<PhotoFilterIndex>({
    queryKey: [QueryKey.SkinJournalPhotoFilters, filters],
    queryFn: ({ signal }) => listPhotoFilters(filters, { signal }),
    enabled,
  });
}

export function usePhotoDates(filters: { from?: string; to?: string } = {}) {
  const enabled = useAuthEnabled();
  return useQuery<PhotoDateIndex>({
    queryKey: [QueryKey.SkinJournalPhotoDates, filters],
    queryFn: ({ signal }) => listPhotoDates(filters, { signal }),
    enabled,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalToday] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalCalendar] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalDay] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalEntries] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalPhotos] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalPhotoFilters] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalPhotoDates] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalStats] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalEvents] });
  void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalInsights] });
  invalidateAppNavBadges(qc);
}

export function useUpsertToday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertTodayWithProgress,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; payload: UpsertEntryPayload }) =>
      updateEntry(input.id, input.payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRetryAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retryAnalysis(id),
    onSuccess: (_result, id) => {
      qc.setQueryData([QueryKey.SkinJournalAnalysisFeedback, id], null);
      invalidateAll(qc);
    },
  });
}

export function useReinterpretAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reinterpretAnalysis(id),
    onSuccess: (_result, id) => {
      qc.setQueryData([QueryKey.SkinJournalAnalysisFeedback, id], null);
      invalidateAll(qc);
    },
  });
}

export function useLocalAnalysisFeedback(entryId: string | null | undefined) {
  return useQuery<AnalysisFeedback | null>({
    queryKey: [QueryKey.SkinJournalAnalysisFeedback, entryId ?? null],
    queryFn: () => null,
    enabled: false,
    initialData: null,
  });
}

export function useRecordAnalysisFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      vote: AnalysisFeedbackVote;
      reason?: AnalysisFeedbackReason | null;
      note?: string | null;
    }) => ({
      entryId: input.id,
      feedback: await recordAnalysisFeedback(input.id, {
        note: input.note,
        reason: input.reason,
        vote: input.vote,
      }),
    }),
    onSuccess: ({ entryId, feedback }) => {
      qc.setQueryData(
        [QueryKey.SkinJournalAnalysisFeedback, entryId],
        feedback,
      );
    },
  });
}

export function useCompareDays(
  from: string | null,
  to: string | null,
  options: { enabled?: boolean } = {},
) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalCompare, from, to],
    queryFn: ({ signal }) =>
      compareDays(from as string, to as string, { signal }),
    enabled: enabled && options.enabled !== false && !!from && !!to,
  });
}

export function useEvents(filters: JournalEventFilters = EMPTY_EVENT_FILTERS) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalEvents, filters],
    queryFn: ({ signal }) => listEvents(filters, { signal }),
    enabled,
  });
}

export function useAcknowledgeEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acknowledgeEvent(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalEvents] });
      invalidateAppNavBadges(qc);
    },
  });
}
