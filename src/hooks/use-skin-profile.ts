'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { QueryKey } from '@/constants/query-keys';
import { getApiErrorStatus } from '@/lib/api-error';
import * as skinProfileService from '@/services/skin-profile.service';
import type { SkinProfileInput } from '@/types/skin-profile';

export function useSkinProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.SkinProfile],
    queryFn: () => skinProfileService.getSkinProfile(),
    enabled: isAuthenticated,
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
    queryFn: () => skinProfileService.getSkinProfileOptions(),
    staleTime: Infinity,
  });
}

export function useCreateSkinProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SkinProfileInput) =>
      skinProfileService.createSkinProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData([QueryKey.SkinProfile], profile);
    },
  });
}

export function useUpdateSkinProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SkinProfileInput) =>
      skinProfileService.updateSkinProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData([QueryKey.SkinProfile], profile);
    },
  });
}
