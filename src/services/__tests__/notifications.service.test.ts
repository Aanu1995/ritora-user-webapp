jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { deleteRequest, getRequest, patchRequest, postRequest } from '@/lib/api';
import {
  getNotificationPreferences,
  getPushStatus,
  getPushPublicKey,
  listPushSubscriptions,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushSubscription,
  revokePushSubscription,
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

  it('integrates push subscription endpoints', async () => {
    (getRequest as jest.Mock)
      .mockResolvedValueOnce({ publicKey: 'public-key' })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        active_subscriptions: 0,
        web_push_subscriptions: 0,
        mobile_subscriptions: 0,
        failing_subscriptions: 0,
        recent_delivery_statuses: {
          sending: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
        },
        pending_retries: 0,
        exhausted_failures: 0,
        stale_sending: 0,
      });
    (postRequest as jest.Mock).mockResolvedValue({ id: 'sub-1' });
    (deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await getPushPublicKey();
    await listPushSubscriptions();
    await getPushStatus();
    await registerPushSubscription({
      provider: 'web_push',
      platform: 'web',
      endpoint: 'https://push.example/sub-1',
      keys: { p256dh: 'p256dh', auth: 'auth' },
    });
    await revokePushSubscription('sub-1');

    expect(getRequest).toHaveBeenCalledWith('/notifications/push/public-key');
    expect(getRequest).toHaveBeenCalledWith('/notifications/push/subscriptions');
    expect(getRequest).toHaveBeenCalledWith('/notifications/push/status');
    expect(postRequest).toHaveBeenCalledWith(
      '/notifications/push/subscriptions',
      expect.objectContaining({ provider: 'web_push' }),
    );
    expect(deleteRequest).toHaveBeenCalledWith(
      '/notifications/push/subscriptions/sub-1',
    );
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
    expect(preferences.smart_pick_ready_enabled).toBe(false);
    expect(preferences.product_expiry_alerts_enabled).toBe(true);
    expect(preferences.product_expiry_notice_days).toBe(14);
    expect(preferences.insight_cadence).toBe('weekly');
    expect(preferences.insight_digest_day).toBe(1);
    expect(preferences.insight_digest_local_time).toBe('09:00');
  });
});
