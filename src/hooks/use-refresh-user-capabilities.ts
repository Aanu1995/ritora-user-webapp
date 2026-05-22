"use client";

import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { getCurrentUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { isRestrictionApiError } from "@/lib/restriction-errors";

export function useRefreshUserCapabilitiesOnRestriction() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return (error: unknown): boolean => {
    if (!isRestrictionApiError(error)) {
      return false;
    }

    void queryClient
      .fetchQuery({
        queryKey: [QueryKey.AuthMe],
        queryFn: ({ signal }) => getCurrentUser({ signal }),
      })
      .then((user) => {
        setUser(user);
      })
      .catch(() => undefined);

    return true;
  };
}
