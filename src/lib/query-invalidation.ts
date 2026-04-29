import type { QueryClient } from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";

export function invalidateAppNavBadges(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QueryKey.AppNavBadges] });
}
