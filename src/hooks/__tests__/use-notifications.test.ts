import {
  getNextNotificationsPageParam,
  mergeNotificationPages,
} from '@/hooks/use-notifications';
import type {
  InAppNotification,
  NotificationsList,
} from '@/types/notifications';

function notification(
  id: string,
  readAt: string | null,
): InAppNotification {
  return {
    id,
    kind: 'photo_reminder',
    title_key: 'skinJournal.notifications.photoReminder.title',
    body_key: 'skinJournal.notifications.photoReminder.body',
    severity: 'info',
    payload: null,
    deep_link: null,
    read_at: readAt,
    created_at: '2026-04-29T08:00:00.000Z',
  };
}

function page(
  items: InAppNotification[],
  nextCursor: string | null,
  unreadCount = 0,
): NotificationsList {
  return {
    items,
    nextCursor,
    unread_count: unreadCount,
  };
}

describe('notification pagination helpers', () => {
  it('passes the backend cursor to TanStack Query for the next page', () => {
    expect(getNextNotificationsPageParam(page([], 'cursor-2'))).toBe(
      'cursor-2',
    );
    expect(getNextNotificationsPageParam(page([], null))).toBeUndefined();
  });

  it('merges cursor pages into unread and read sections without duplicates', () => {
    const result = mergeNotificationPages([
      page([notification('n1', null), notification('n2', null)], 'cursor-2', 3),
      page(
        [
          notification('n2', null),
          notification('n3', '2026-04-29T09:00:00.000Z'),
        ],
        null,
        3,
      ),
    ]);

    expect(result.unread.map((item) => item.id)).toEqual(['n1', 'n2']);
    expect(result.read.map((item) => item.id)).toEqual(['n3']);
    expect(result.unread_count).toBe(3);
  });
});
