"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  editApplication,
  getApplicationLog,
  getApplicationLogVersions,
  recordApplication,
} from "@/services/application-tracking.service";
import type {
  ApplicationLog,
  EditApplicationPayload,
  RecordApplicationPayload,
} from "@/types/application-tracking";

function invalidateAfterRecord(
  queryClient: ReturnType<typeof useQueryClient>,
  log: ApplicationLog,
) {
  queryClient.setQueryData([QueryKey.ApplicationLog, log.id], log);
  void queryClient.invalidateQueries({ queryKey: [QueryKey.SuggestionsToday] });
  void queryClient.invalidateQueries({
    queryKey: [QueryKey.SuggestionsHistory],
  });
  void queryClient.invalidateQueries({
    queryKey: [QueryKey.SuggestionsHistoryDay],
  });
}

export function useRecordApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordApplicationPayload) =>
      recordApplication(payload),
    onSuccess: (log) => invalidateAfterRecord(queryClient, log),
  });
}

export function useEditApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: EditApplicationPayload;
    }) => editApplication(id, payload),
    onSuccess: (log) => {
      invalidateAfterRecord(queryClient, log);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.ApplicationLogVersions, log.id],
      });
    },
  });
}

export function useApplicationLog(id: string | null | undefined) {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.ApplicationLog, id],
    queryFn: ({ signal }) => getApplicationLog(id as string, { signal }),
    enabled: isEnabled && Boolean(id),
  });
}

export function useApplicationLogVersions(id: string | null | undefined) {
  const isEnabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.ApplicationLogVersions, id],
    queryFn: ({ signal }) =>
      getApplicationLogVersions(id as string, { signal }),
    enabled: isEnabled && Boolean(id),
  });
}
