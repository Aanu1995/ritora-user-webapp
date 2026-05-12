import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import {
  PRODUCT_EXPIRY_NOTICE_DAYS_DEFAULT,
  type NotificationPreferences,
  type NotificationsList,
  type PushStatusSummary,
  type PushSubscriptionRegistration,
  type PushSubscriptionSummary,
  type UpdatePreferencesPayload,
} from "@/types/notifications";

export async function listNotifications(
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<NotificationsList> {
  return getRequest(ApiPath.Notifications, {
    params: {
      ...(cursor ? { cursor } : {}),
    },
    signal,
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  await postRequest<unknown>(ApiPath.NotificationRead(id), {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await postRequest<unknown>(ApiPath.NotificationsReadAll, {});
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const preferences = await getRequest<NotificationPreferences>(
    ApiPath.NotificationPreferences,
  );
  return normalizeNotificationPreferences(preferences);
}

export async function updateNotificationPreferences(
  payload: UpdatePreferencesPayload,
): Promise<NotificationPreferences> {
  const preferences = await patchRequest<NotificationPreferences>(
    ApiPath.NotificationPreferences,
    payload,
  );
  return normalizeNotificationPreferences(preferences);
}

export async function getPushPublicKey(): Promise<string> {
  const response = await getRequest<{ publicKey: string }>(
    ApiPath.NotificationPushPublicKey,
  );
  return response.publicKey;
}

export async function listPushSubscriptions(): Promise<
  PushSubscriptionSummary[]
> {
  return getRequest<PushSubscriptionSummary[]>(
    ApiPath.NotificationPushSubscriptions,
  );
}

export async function getPushStatus(): Promise<PushStatusSummary> {
  return getRequest<PushStatusSummary>(ApiPath.NotificationPushStatus);
}

export async function registerPushSubscription(
  payload: PushSubscriptionRegistration,
): Promise<PushSubscriptionSummary> {
  return postRequest<PushSubscriptionSummary>(
    ApiPath.NotificationPushSubscriptions,
    payload,
  );
}

export async function revokePushSubscription(id: string): Promise<void> {
  await deleteRequest<unknown>(ApiPath.NotificationPushSubscription(id));
}

function normalizeNotificationPreferences(
  preferences: NotificationPreferences,
): NotificationPreferences {
  return {
    ...preferences,
    ai_polished_insights_enabled:
      preferences.ai_polished_insights_enabled ?? true,
    smart_pick_ready_enabled: preferences.smart_pick_ready_enabled ?? false,
    product_expiry_alerts_enabled:
      preferences.product_expiry_alerts_enabled ?? true,
    product_expiry_notice_days:
      preferences.product_expiry_notice_days ??
      PRODUCT_EXPIRY_NOTICE_DAYS_DEFAULT,
    photo_reminder_local_time: normalizeReminderTime(
      preferences.photo_reminder_local_time,
    ),
  };
}

function normalizeReminderTime(value: string | undefined): string {
  const [hours = "08", minutes = "00"] = (value ?? "08:00").split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
