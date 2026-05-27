"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import { invalidateAppNavBadges } from "@/lib/query-invalidation";
import {
  JOURNAL_INSIGHT_POLL_INTERVAL_MS,
  shouldPollInsights,
} from "@/hooks/use-skin-journal-polling";
import {
  acknowledgeSimplification,
  createJournalExport,
  dismissInsight,
  getActiveSimplification,
  getJournalExport,
  getJournalStats,
  getSimplification,
  getWrapped,
  listInsights,
  listWrapped,
  markInsightSeen,
  recordInsightAction,
  startSimplification,
} from "@/services/skin-journal.service";
import type {
  InsightAction,
  InsightWindow,
  JournalExportJob,
} from "@/types/skin-journal";

export function useInsights(
  params: { window?: InsightWindow; locale?: string } = {},
) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalInsights, params],
    queryFn: ({ signal }) => listInsights(params, { signal }),
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

export function useRecordInsightAction() {
  return useMutation({
    mutationFn: (input: { id: string; action_kind: InsightAction["kind"] }) =>
      recordInsightAction(input.id, { action_kind: input.action_kind }),
  });
}

export function useWrappedList() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalWrappedList],
    queryFn: ({ signal }) => listWrapped({ signal }),
    enabled,
  });
}

export function useWrapped(id: string | null) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalWrapped, id],
    queryFn: ({ signal }) => getWrapped(id as string, { signal }),
    enabled: enabled && !!id,
  });
}

export function useActiveSimplification() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalSimplificationActive],
    queryFn: ({ signal }) => getActiveSimplification({ signal }),
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useSimplification(id: string | null) {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.SkinJournalSimplification, id],
    queryFn: ({ signal }) => getSimplification(id as string, { signal }),
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
    queryFn: ({ signal }) => getJournalStats({ signal }),
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
    queryFn: ({ signal }) => getJournalExport(id as string, { signal }),
    enabled: enabled && !!id,
  });
}
