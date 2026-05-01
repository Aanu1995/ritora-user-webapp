import {
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import type {
  NotificationPreferences,
  NotificationsList,
  UpdatePreferencesPayload,
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

function normalizeNotificationPreferences(
  preferences: NotificationPreferences,
): NotificationPreferences {
  return {
    ...preferences,
    ai_polished_insights_enabled:
      preferences.ai_polished_insights_enabled ?? true,
    photo_reminder_local_time: normalizeReminderTime(
      preferences.photo_reminder_local_time,
    ),
  };
}

function normalizeReminderTime(value: string | undefined): string {
  const [hours = "08", minutes = "00"] = (value ?? "08:00").split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
