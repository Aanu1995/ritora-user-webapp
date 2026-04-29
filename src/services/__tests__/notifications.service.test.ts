jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { getRequest, patchRequest, postRequest } from '@/lib/api';
import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from '@/services/notifications.service';

afterEach(() => jest.clearAllMocks());

describe('notifications.service', () => {
  it('lists notifications with the cursor pagination contract used by Shelf', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      items: [],
      nextCursor: null,
      unread_count: 0,
    });

    await listNotifications('cursor-1', new AbortController().signal);

    expect(getRequest).toHaveBeenCalledWith('/notifications', {
      params: { cursor: 'cursor-1' },
      signal: expect.any(AbortSignal),
    });
  });

  it('integrates read and preferences endpoints', async () => {
    (postRequest as jest.Mock).mockResolvedValue(undefined);
    (getRequest as jest.Mock).mockResolvedValue({
      photo_reminder_enabled: true,
    });
    (patchRequest as jest.Mock).mockResolvedValue({
      photo_reminder_enabled: false,
    });

    await markNotificationRead('notification-1');
    await markAllNotificationsRead();
    await getNotificationPreferences();
    await updateNotificationPreferences({ photo_reminder_enabled: false });

    expect(postRequest).toHaveBeenCalledWith('/notifications/notification-1/read', {});
    expect(postRequest).toHaveBeenCalledWith('/notifications/read-all', {});
    expect(getRequest).toHaveBeenCalledWith('/notifications/preferences');
    expect(patchRequest).toHaveBeenCalledWith('/notifications/preferences', {
      photo_reminder_enabled: false,
    });
  });

  it('normalizes database time values in notification preferences', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      photo_reminder_local_time: '08:00:00',
      photo_reminder_enabled: true,
      channels: ['in_app'],
      reaction_alerts_enabled: true,
      simplification_alerts_enabled: true,
      insight_alerts_enabled: true,
      wrapped_alerts_enabled: true,
      photo_tutorial_completed: false,
    });

    const preferences = await getNotificationPreferences();

    expect(preferences.photo_reminder_local_time).toBe('08:00');
  });
});
