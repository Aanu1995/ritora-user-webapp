import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import {
  INSIGHT_CADENCE_DEFAULT,
  INSIGHT_DIGEST_DAY_DEFAULT,
  INSIGHT_DIGEST_LOCAL_TIME_DEFAULT,
  PRODUCT_EXPIRY_NOTICE_DAYS_DEFAULT,
  InsightCadenceValue,
  type InsightCadence,
  NOTIFICATION_CHANNEL_VALUES,
  NotificationChannelValue,
  type NotificationChannel,
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
  const channels = normalizeChannels(preferences.channels, [
    NotificationChannelValue.InApp,
  ]);
  return {
    ...preferences,
    channels,
    reaction_alert_channels: normalizeSpecificChannels(
      preferences.reaction_alert_channels,
      channels,
      channels,
    ),
    simplification_alert_channels: normalizeSpecificChannels(
      preferences.simplification_alert_channels,
      channels,
      channels,
    ),
    insight_alert_channels: normalizeSpecificChannels(
      preferences.insight_alert_channels,
      channels,
      channels,
    ),
    wrapped_alert_channels: normalizeSpecificChannels(
      preferences.wrapped_alert_channels,
      channels,
      channels,
    ),
    suggestion_ready_channels: normalizeSpecificChannels(
      preferences.suggestion_ready_channels,
      channels,
      channels,
    ),
    smart_pick_ready_channels: normalizeSpecificChannels(
      preferences.smart_pick_ready_channels,
      [NotificationChannelValue.InApp],
      channels,
    ),
    slot_start_channels: normalizeSpecificChannels(
      preferences.slot_start_channels,
      channels,
      channels,
    ),
    recording_reminder_channels: normalizeSpecificChannels(
      preferences.recording_reminder_channels,
      channels,
      channels,
    ),
    product_expiry_alert_channels: normalizeSpecificChannels(
      preferences.product_expiry_alert_channels,
      [NotificationChannelValue.InApp, NotificationChannelValue.Push],
      channels,
    ),
    insight_cadence: normalizeInsightCadence(preferences.insight_cadence),
    insight_digest_day: normalizeInsightDigestDay(
      preferences.insight_digest_day,
    ),
    insight_digest_local_time: normalizeReminderTime(
      preferences.insight_digest_local_time ??
        INSIGHT_DIGEST_LOCAL_TIME_DEFAULT,
    ),
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

function normalizeChannels(
  value: NotificationChannel[] | undefined,
  fallback: NotificationChannel[],
): NotificationChannel[] {
  const source = Array.isArray(value) ? value : fallback;
  const allowed = new Set<NotificationChannel>(NOTIFICATION_CHANNEL_VALUES);
  const seen = new Set<NotificationChannel>();
  return source.filter((channel) => {
    if (!allowed.has(channel) || seen.has(channel)) return false;
    seen.add(channel);
    return true;
  });
}

function normalizeSpecificChannels(
  value: NotificationChannel[] | undefined,
  fallback: NotificationChannel[],
  globalChannels: NotificationChannel[],
): NotificationChannel[] {
  const normalized = normalizeChannels(value, fallback);
  if (globalChannels.includes(NotificationChannelValue.Push)) {
    return normalized;
  }
  return normalized.filter(
    (channel) => channel !== NotificationChannelValue.Push,
  );
}

function normalizeInsightCadence(
  value: NotificationPreferences["insight_cadence"] | undefined,
): InsightCadence {
  return value === InsightCadenceValue.Weekly ||
    value === InsightCadenceValue.Fewer
    ? value
    : INSIGHT_CADENCE_DEFAULT;
}

function normalizeInsightDigestDay(value: number | undefined): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 7
    ? value
    : INSIGHT_DIGEST_DAY_DEFAULT;
}

function normalizeReminderTime(value: string | undefined): string {
  const [hours = "08", minutes = "00"] = (value ?? "08:00").split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
