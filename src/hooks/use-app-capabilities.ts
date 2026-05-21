"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { getAppCapabilities } from "@/services/app-capabilities.service";

export function useAppCapabilities() {
  return useQuery({
    queryKey: [QueryKey.AppCapabilities],
    queryFn: () => getAppCapabilities(),
    staleTime: 30_000,
  });
}
