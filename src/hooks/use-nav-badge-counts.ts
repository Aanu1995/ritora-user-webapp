"use client";

import { useQuery } from "@tanstack/react-query";
import { AppRoute } from "@/constants/app-routes";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import { getAppNavBadges } from "@/services/nav-badges.service";
import type { AppNavBadges } from "@/types/nav-badges";

export type NavBadgeCounts = Partial<Record<AppRoute, number>>;

const NAV_BADGE_REFETCH_INTERVAL_MS = 60_000;
const EMPTY_NAV_BADGE_COUNTS: NavBadgeCounts = {};

/**
 * Returns unread/attention counts for sidebar nav items.
 *
 * - Notifications: unread in-app notifications
 * - Skin Journal: unresolved warning/critical journal attention
 */
export function useNavBadgeCounts(): NavBadgeCounts {
  const enabled = useAuthEnabled();
  const query = useQuery({
    queryKey: [QueryKey.AppNavBadges],
    queryFn: () => getAppNavBadges(),
    enabled,
    staleTime: 30_000,
    refetchInterval: NAV_BADGE_REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  return enabled && query.data
    ? mapAppNavBadgesToNavRoutes(query.data)
    : EMPTY_NAV_BADGE_COUNTS;
}

export function mapAppNavBadgesToNavRoutes(
  badges: AppNavBadges,
): NavBadgeCounts {
  return {
    [AppRoute.Notifications]: badges.notifications_unread_count,
    [AppRoute.Journal]: badges.skin_journal_warning_count,
  };
}
