"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import { getApiErrorStatus } from "@/lib/api-error";
import {
  createSkinProfile,
  deleteSkinProfileHealthContext,
  deleteSkinProfileHormonalContext,
  getSkinProfile,
  getSkinProfileAccessLogs,
  getSkinProfileOptions,
  updateSkinProfile,
} from "@/services/skin-profile.service";
import type { SkinProfileInput } from "@/types/skin-profile";

type UseSkinProfileOptions = {
  enabled?: boolean;
};

export function useSkinProfile(options?: UseSkinProfileOptions) {
  const isEnabled = useAuthEnabled(options?.enabled ?? true);

  return useQuery({
    queryKey: [QueryKey.SkinProfile],
    queryFn: () => getSkinProfile(),
    enabled: isEnabled,
    retry: (failureCount, error) => {
      if (getApiErrorStatus(error) === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function useSkinProfileOptions() {
  return useQuery({
    queryKey: [QueryKey.SkinProfileOptions],
    queryFn: () => getSkinProfileOptions(),
    staleTime: Infinity,
  });
}

export function useSkinProfileAccessLogs(options?: UseSkinProfileOptions) {
  const isEnabled = useAuthEnabled(options?.enabled ?? true);

  return useQuery({
    queryKey: [QueryKey.SkinProfileAccessLogs],
    queryFn: () => getSkinProfileAccessLogs(),
    enabled: isEnabled,
  });
}

export function useCreateSkinProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SkinProfileInput) => createSkinProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData([QueryKey.SkinProfile], profile);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SkinProfileAccessLogs],
      });
    },
  });
}

export function useUpdateSkinProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SkinProfileInput) => updateSkinProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData([QueryKey.SkinProfile], profile);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SkinProfileAccessLogs],
      });
    },
  });
}

export function useDeleteSkinProfileHealthContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSkinProfileHealthContext(),
    onSuccess: (profile) => {
      queryClient.setQueryData([QueryKey.SkinProfile], profile);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SkinProfileAccessLogs],
      });
    },
  });
}

export function useDeleteSkinProfileHormonalContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSkinProfileHormonalContext(),
    onSuccess: (profile) => {
      queryClient.setQueryData([QueryKey.SkinProfile], profile);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.SkinProfileAccessLogs],
      });
    },
  });
}
