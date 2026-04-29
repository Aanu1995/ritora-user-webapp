"use client";

import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "@/services/notifications.service";
import type {
  NotificationBuckets,
  NotificationsList,
  UpdatePreferencesPayload,
} from "@/types/notifications";
import { invalidateAppNavBadges } from "@/lib/query-invalidation";

const EMPTY_NOTIFICATION_BUCKETS: NotificationBuckets = {
  unread: [],
  read: [],
  unread_count: 0,
};

export function getNextNotificationsPageParam(
  lastPage: NotificationsList,
): string | undefined {
  return lastPage.nextCursor ?? undefined;
}

export function mergeNotificationPages(
  pages: NotificationsList[] | undefined,
): NotificationBuckets {
  if (!pages?.length) {
    return EMPTY_NOTIFICATION_BUCKETS;
  }

  const seenIds = new Set<string>();
  const unread: NotificationBuckets["unread"] = [];
  const read: NotificationBuckets["read"] = [];

  for (const page of pages) {
    for (const notification of page.items) {
      if (seenIds.has(notification.id)) {
        continue;
      }
      seenIds.add(notification.id);
      if (notification.read_at) {
        read.push(notification);
      } else {
        unread.push(notification);
      }
    }
  }

  return {
    unread,
    read,
    unread_count: pages[0]?.unread_count ?? unread.length,
  };
}

export function useNotifications() {
  const enabled = useAuthEnabled();
  const query = useInfiniteQuery({
    queryKey: [QueryKey.Notifications],
    queryFn: ({ pageParam, signal }) => listNotifications(pageParam, signal),
    enabled,
    initialPageParam: null as string | null,
    getNextPageParam: getNextNotificationsPageParam,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  return {
    ...query,
    data: mergeNotificationPages(query.data?.pages),
  };
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QueryKey.Notifications] });
      invalidateAppNavBadges(qc);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QueryKey.Notifications] });
      invalidateAppNavBadges(qc);
    },
  });
}

export function useNotificationPreferences() {
  const enabled = useAuthEnabled();
  return useQuery({
    queryKey: [QueryKey.NotificationPreferences],
    queryFn: () => getNotificationPreferences(),
    enabled,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePreferencesPayload) =>
      updateNotificationPreferences(payload),
    onSuccess: (data) => {
      qc.setQueryData([QueryKey.NotificationPreferences], data);
    },
  });
}
