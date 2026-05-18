"use client";

import type { ComponentType, ReactElement } from "react";
import type { useTranslations } from "next-intl";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import type { FieldIssue } from "@/lib/form-errors";
import {
  NOTIFICATION_CHANNEL_VALUES,
  INSIGHT_CADENCE_VALUES,
  PRODUCT_EXPIRY_NOTICE_DAYS_MAX,
  PRODUCT_EXPIRY_NOTICE_DAYS_MIN,
  SUGGESTION_LEAD_TIME_MAX_MINUTES,
  SUGGESTION_LEAD_TIME_MIN_MINUTES,
  type NotificationChannel,
  type NotificationPreferences,
  type UpdatePreferencesPayload,
} from "@/types/notifications";

export const reminderTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const notificationPreferencesSchema = z.object({
  photo_reminder_local_time: z
    .string()
    .regex(reminderTimePattern, "validation.invalidReminderTime"),
  photo_reminder_enabled: z.boolean(),
  channels: z
    .array(z.enum(NOTIFICATION_CHANNEL_VALUES))
    .max(NOTIFICATION_CHANNEL_VALUES.length, "validation.invalidChannels")
    .refine((channels) => new Set(channels).size === channels.length, {
      message: "validation.invalidChannels",
    }),
  reaction_alerts_enabled: z.boolean(),
  simplification_alerts_enabled: z.boolean(),
  insight_alerts_enabled: z.boolean(),
  insight_cadence: z.enum(INSIGHT_CADENCE_VALUES),
  insight_digest_day: z
    .number()
    .int()
    .min(1, "validation.invalidInsightDigestDay")
    .max(7, "validation.invalidInsightDigestDay"),
  insight_digest_local_time: z
    .string()
    .regex(reminderTimePattern, "validation.invalidInsightDigestTime"),
  wrapped_alerts_enabled: z.boolean(),
  photo_tutorial_completed: z.boolean(),
  suggestion_ready_enabled: z.boolean(),
  smart_pick_ready_enabled: z.boolean(),
  slot_start_enabled: z.boolean(),
  recording_reminder_enabled: z.boolean(),
  product_expiry_alerts_enabled: z.boolean(),
  product_expiry_notice_days: z
    .number()
    .int()
    .min(PRODUCT_EXPIRY_NOTICE_DAYS_MIN, "validation.invalidExpiryNoticeDays")
    .max(PRODUCT_EXPIRY_NOTICE_DAYS_MAX, "validation.invalidExpiryNoticeDays"),
  suggestion_lead_time_minutes: z
    .number()
    .int()
    .min(SUGGESTION_LEAD_TIME_MIN_MINUTES, "validation.invalidLeadTime")
    .max(SUGGESTION_LEAD_TIME_MAX_MINUTES, "validation.invalidLeadTime"),
  quiet_hours_enabled: z.boolean(),
  quiet_hours_start: z
    .string()
    .regex(reminderTimePattern, "validation.invalidQuietHours"),
  quiet_hours_end: z
    .string()
    .regex(reminderTimePattern, "validation.invalidQuietHours"),
});

export function updateChannel(
  channels: NotificationChannel[],
  channel: NotificationChannel,
  enabled: boolean,
): NotificationChannel[] {
  const next = new Set(channels);
  if (enabled) {
    next.add(channel);
  } else {
    next.delete(channel);
  }
  return NOTIFICATION_CHANNEL_VALUES.filter((value) => next.has(value));
}

export function getTimeFieldValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.slice(0, 5) : fallback;
}

export function NotificationSwitch({
  label,
  body,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  body?: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {body ? (
          <p className="mt-0.5 text-xs leading-snug text-muted">{body}</p>
        ) : null}
      </div>
      <Switch
        aria-label={label}
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export type FormApi = {
  setFieldValue: (
    name: keyof NotificationPreferences,
    value: NotificationPreferences[keyof NotificationPreferences],
  ) => void;
  Field: ComponentType<{
    name: keyof NotificationPreferences;
    children: (field: {
      name: string;
      state: {
        value: NotificationPreferences[keyof NotificationPreferences];
        meta: { errors: FieldIssue[] };
      };
      handleChange: (
        value: NotificationPreferences[keyof NotificationPreferences],
      ) => void;
      handleBlur: () => void;
    }) => ReactElement;
  }>;
};

export type SectionProps = {
  values: NotificationPreferences;
  isSaving: boolean;
  form: FormApi;
  t: ReturnType<typeof useTranslations>;
  persistPatch: (
    nextValues: NotificationPreferences,
    patch: UpdatePreferencesPayload,
  ) => Promise<NotificationPreferences | null>;
};
