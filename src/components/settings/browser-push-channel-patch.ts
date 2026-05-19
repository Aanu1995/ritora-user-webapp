import type {
  NotificationChannel,
  NotificationPreferences,
  UpdatePreferencesPayload,
} from "@/types/notifications";
import { NotificationChannelValue } from "@/types/notifications";
import {
  updateChannel,
  type SectionProps,
} from "@/components/settings/notification-form-controls";

const PUSH_SCOPED_CHANNEL_FIELDS = [
  "channels",
  "reaction_alert_channels",
  "simplification_alert_channels",
  "insight_alert_channels",
  "wrapped_alert_channels",
  "suggestion_ready_channels",
  "smart_pick_ready_channels",
  "slot_start_channels",
  "recording_reminder_channels",
  "product_expiry_alert_channels",
] as const;

type PushScopedChannelField = (typeof PUSH_SCOPED_CHANNEL_FIELDS)[number];

export function buildPushChannelPatch(
  values: NotificationPreferences,
  enabled: boolean,
): {
  nextValues: NotificationPreferences;
  patch: UpdatePreferencesPayload;
} {
  const nextValues = { ...values };
  const channelPatch: Partial<
    Record<PushScopedChannelField, NotificationChannel[]>
  > = {};
  const setChannel = (
    field: PushScopedChannelField,
    channels: NotificationChannel[],
  ) => {
    nextValues[field] = channels;
    channelPatch[field] = channels;
  };

  setChannel(
    "channels",
    updateChannel(values.channels, NotificationChannelValue.Push, enabled),
  );

  if (!enabled) {
    for (const field of PUSH_SCOPED_CHANNEL_FIELDS) {
      if (field === "channels") continue;
      const channels = updateChannel(
        values[field],
        NotificationChannelValue.Push,
        false,
      );
      if (channels.length !== values[field].length) {
        setChannel(field, channels);
      }
    }
  }

  return { nextValues, patch: channelPatch };
}

export function pickPushScopedChannels(
  preferences: NotificationPreferences,
): UpdatePreferencesPayload {
  const channelPatch: Partial<
    Record<PushScopedChannelField, NotificationChannel[]>
  > = {};
  for (const field of PUSH_SCOPED_CHANNEL_FIELDS) {
    channelPatch[field] = preferences[field];
  }
  return channelPatch;
}

export function applyChannelPatchToForm(
  setFieldValue: SectionProps["form"]["setFieldValue"],
  patch: UpdatePreferencesPayload,
) {
  for (const field of PUSH_SCOPED_CHANNEL_FIELDS) {
    const channels = patch[field];
    if (channels !== undefined) {
      setFieldValue(field, channels);
    }
  }
}
