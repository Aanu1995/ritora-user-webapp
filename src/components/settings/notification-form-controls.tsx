"use client";

import { AlertTriangle, BellRing, Inbox, Mail } from "lucide-react";
import type { ComponentType, ReactElement } from "react";
import type { useTranslations } from "next-intl";
import { z } from "@/lib/zod";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FieldIssue } from "@/lib/form-errors";
import {
  NOTIFICATION_CHANNEL_VALUES,
  INSIGHT_CADENCE_VALUES,
  NotificationChannelValue,
  PRODUCT_EXPIRY_NOTICE_DAYS_MAX,
  PRODUCT_EXPIRY_NOTICE_DAYS_MIN,
  SUGGESTION_LEAD_TIME_MAX_MINUTES,
  SUGGESTION_LEAD_TIME_MIN_MINUTES,
  type NotificationChannel,
  type NotificationPreferences,
  type UpdatePreferencesPayload,
} from "@/types/notifications";

export const reminderTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const notificationChannelsSchema = z
  .array(z.enum(NOTIFICATION_CHANNEL_VALUES))
  .max(NOTIFICATION_CHANNEL_VALUES.length, "validation.invalidChannels")
  .refine((channels) => new Set(channels).size === channels.length, {
    message: "validation.invalidChannels",
  });

const NOTIFICATION_CHANNEL_DISPLAY_ORDER = [
  NotificationChannelValue.InApp,
  NotificationChannelValue.Email,
  NotificationChannelValue.Push,
] as const;

export const notificationPreferencesSchema = z.object({
  photo_reminder_local_time: z
    .string()
    .regex(reminderTimePattern, "validation.invalidReminderTime"),
  photo_reminder_enabled: z.boolean(),
  channels: notificationChannelsSchema,
  reaction_alert_channels: notificationChannelsSchema,
  reaction_alerts_enabled: z.boolean(),
  simplification_alert_channels: notificationChannelsSchema,
  simplification_alerts_enabled: z.boolean(),
  insight_alert_channels: notificationChannelsSchema,
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
  wrapped_alert_channels: notificationChannelsSchema,
  wrapped_alerts_enabled: z.boolean(),
  photo_tutorial_completed: z.boolean(),
  suggestion_ready_channels: notificationChannelsSchema,
  suggestion_ready_enabled: z.boolean(),
  smart_pick_ready_channels: notificationChannelsSchema,
  smart_pick_ready_enabled: z.boolean(),
  slot_start_channels: notificationChannelsSchema,
  slot_start_enabled: z.boolean(),
  recording_reminder_channels: notificationChannelsSchema,
  recording_reminder_enabled: z.boolean(),
  product_expiry_alert_channels: notificationChannelsSchema,
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

export type NotificationChannelFieldName = Extract<
  keyof NotificationPreferences,
  | "channels"
  | "reaction_alert_channels"
  | "simplification_alert_channels"
  | "insight_alert_channels"
  | "wrapped_alert_channels"
  | "suggestion_ready_channels"
  | "smart_pick_ready_channels"
  | "slot_start_channels"
  | "recording_reminder_channels"
  | "product_expiry_alert_channels"
>;

export function NotificationChannelPicker({
  fieldName,
  label,
  values,
  isSaving,
  form,
  t,
  persistPatch,
  disabled = false,
  allowedChannels = NOTIFICATION_CHANNEL_DISPLAY_ORDER,
  pushDisabled = false,
}: {
  fieldName: NotificationChannelFieldName;
  label: string;
  values: NotificationPreferences;
  isSaving: boolean;
  form: FormApi;
  t: ReturnType<typeof useTranslations>;
  persistPatch: (
    nextValues: NotificationPreferences,
    patch: UpdatePreferencesPayload,
  ) => Promise<NotificationPreferences | null>;
  disabled?: boolean;
  allowedChannels?: readonly NotificationChannel[];
  pushDisabled?: boolean;
}) {
  // Hide channels entirely when the parent toggle is off — they're noise then.
  if (disabled) {
    return null;
  }

  const allowedChannelSet = new Set<NotificationChannel>(allowedChannels);
  const currentChannels = (values[fieldName] as NotificationChannel[]).filter(
    (channel) => allowedChannelSet.has(channel),
  );
  const persistChannels = (channels: NotificationChannel[]) => {
    const nextValues = { ...values, [fieldName]: channels };
    form.setFieldValue(fieldName, channels);
    persistPatch(nextValues, {
      [fieldName]: channels,
    } as UpdatePreferencesPayload);
  };

  const hasNoChannels = currentChannels.length === 0;

  return (
    <form.Field name={fieldName}>
      {() => (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {allowedChannels.map((channel) => {
            const checked = currentChannels.includes(channel);
            const isPush = channel === NotificationChannelValue.Push;
            const channelDisabled =
              isSaving || (isPush && pushDisabled && !checked);
            const channelLabel = notificationChannelLabel(t, channel);
            const Icon = channelIcon(channel);
            return (
              <button
                key={`${fieldName}:${channel}`}
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={t("channelToggleLabel", {
                  channel: channelLabel,
                  notification: label,
                })}
                disabled={channelDisabled}
                onClick={() => {
                  persistChannels(
                    updateChannel(currentChannels, channel, !checked),
                  );
                }}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  checked
                    ? "border-accent/30 bg-accent-soft text-accent-strong"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {channelLabel}
              </button>
            );
          })}
          {hasNoChannels ? (
            <span
              role="alert"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-danger"
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {t("noChannelsWarning")}
            </span>
          ) : null}
        </div>
      )}
    </form.Field>
  );
}

function notificationChannelLabel(
  t: ReturnType<typeof useTranslations>,
  channel: NotificationChannel,
): string {
  if (channel === NotificationChannelValue.Email) return t("channelEmail");
  if (channel === NotificationChannelValue.Push) return t("channelPush");
  return t("channelInApp");
}

function channelIcon(channel: NotificationChannel) {
  if (channel === NotificationChannelValue.Email) return Mail;
  if (channel === NotificationChannelValue.Push) return BellRing;
  return Inbox;
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
  controlsDisabled: boolean;
  form: FormApi;
  t: ReturnType<typeof useTranslations>;
  persistPatch: (
    nextValues: NotificationPreferences,
    patch: UpdatePreferencesPayload,
  ) => Promise<NotificationPreferences | null>;
};
