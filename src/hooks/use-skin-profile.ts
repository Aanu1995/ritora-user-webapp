'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { QueryKey } from '@/constants/query-keys';
import * as skinProfileService from '@/services/skin-profile.service';
import type { SkinProfileInput } from '@/types/skin-profile';

export function useSkinProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.SkinProfile],
    queryFn: () => skinProfileService.getSkinProfile(),
    enabled: isAuthenticated,
    retry: false,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.SkinProfile] });
    },
  });
}

export function useUpdateSkinProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SkinProfileInput) =>
      skinProfileService.updateSkinProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.SkinProfile] });
    },
  });
}
