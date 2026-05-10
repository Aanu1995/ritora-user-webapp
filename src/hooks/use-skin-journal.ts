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
  JOURNAL_INSIGHT_POLL_INTERVAL_MS,
  shouldPollCalendar,
  shouldPollDay,
  shouldPollInsights,
  shouldPollTodayEntry,
} from "@/hooks/use-skin-journal-polling";
import {
  acknowledgeEvent,
  acknowledgeSimplification,
  compareDays,
  createJournalExport,
  deleteEntry,
  dismissInsight,
  getActiveSimplification,
  getCalendar,
  getDay,
  getJournalStats,
  getJournalExport,
  getWrapped,
  getSimplification,
  getTodayEntry,
  listEvents,
  listPhotoFilters,
  listInsights,
  listMonthEntries,
  listPhotoDates,
  listPhotos,
  listWrapped,
  markInsightSeen,
  retryAnalysis,
  startSimplification,
  updateEntry,
} from "@/services/skin-journal.service";
import {
  PhotoFilterStaticId,
  type CalendarPayload,
  type DayDetail,
  type InsightWindow,
  type JournalEventFilters,
  type JournalExportJob,
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

export function useTodayEntry() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalToday],
    queryFn: () => getTodayEntry(),
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
    queryFn: () => getCalendar(month),
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
    queryFn: () => getDay(date as string),
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
    queryFn: () => listMonthEntries(month),
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
    queryFn: ({ pageParam }) =>
      listPhotos({
        ...normalizedFilters,
        limit: JOURNAL_PHOTO_PAGE_SIZE,
        cursor: pageParam,
    }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && options.enabled !== false,
  });
}

export function usePhotoFilters(filters: { from?: string; to?: string } = {}) {
  const enabled = useAuthEnabled();
  return useQuery<PhotoFilterIndex>({
    queryKey: [QueryKey.SkinJournalPhotoFilters, filters],
    queryFn: () => listPhotoFilters(filters),
    enabled,
  });
}

export function usePhotoDates(filters: { from?: string; to?: string } = {}) {
  const enabled = useAuthEnabled();
  return useQuery<PhotoDateIndex>({
    queryKey: [QueryKey.SkinJournalPhotoDates, filters],
    queryFn: () => listPhotoDates(filters),
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
    onSuccess: () => invalidateAll(qc),
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
    queryFn: () => compareDays(from as string, to as string),
    enabled: enabled && options.enabled !== false && !!from && !!to,
  });
}

export function useEvents(filters: JournalEventFilters = EMPTY_EVENT_FILTERS) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalEvents, filters],
    queryFn: () => listEvents(filters),
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

export function useInsights(
  params: { window?: InsightWindow; locale?: string } = {},
) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalInsights, params],
    queryFn: () => listInsights(params),
    enabled,
    refetchInterval: (query) =>
      shouldPollInsights(query.state.data)
        ? JOURNAL_INSIGHT_POLL_INTERVAL_MS
        : false,
  });
}

export function useDismissInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissInsight(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [QueryKey.SkinJournalInsights] }),
  });
}

export function useMarkInsightSeen() {
  return useMutation({
    mutationFn: (id: string) => markInsightSeen(id),
  });
}

export function useWrappedList() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalWrappedList],
    queryFn: () => listWrapped(),
    enabled,
  });
}

export function useWrapped(id: string | null) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalWrapped, id],
    queryFn: () => getWrapped(id as string),
    enabled: enabled && !!id,
  });
}

export function useActiveSimplification() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalSimplificationActive],
    queryFn: () => getActiveSimplification(),
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useSimplification(id: string | null) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalSimplification, id],
    queryFn: () => getSimplification(id as string),
    enabled: enabled && !!id,
  });
}

export function useStartSimplification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      triggered_by_event_id?: string | null;
      reason?: string;
    }) => startSimplification(input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [QueryKey.SkinJournalSimplificationActive],
      });
      invalidateAppNavBadges(qc);
    },
  });
}

export function useAcknowledgeSimplification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acknowledgeSimplification(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [QueryKey.SkinJournalSimplificationActive],
      });
      void qc.invalidateQueries({
        queryKey: [QueryKey.SkinJournalSimplification],
      });
      invalidateAppNavBadges(qc);
    },
  });
}

export function useJournalStats() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalStats],
    queryFn: () => getJournalStats(),
    enabled,
  });
}

export function useCreateJournalExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { from: string; to: string }) =>
      createJournalExport(input),
    onSuccess: (job: JournalExportJob) => {
      qc.setQueryData([QueryKey.SkinJournalExport, job.id], job);
      void qc.invalidateQueries({ queryKey: [QueryKey.Notifications] });
    },
  });
}

export function useJournalExport(id: string | null) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalExport, id],
    queryFn: () => getJournalExport(id as string),
    enabled: enabled && !!id,
  });
}
