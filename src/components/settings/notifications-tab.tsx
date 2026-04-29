"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePicker } from "@/components/ui/time-picker";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useAuthStore } from "@/stores/auth-store";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notifications";
import { NotificationSettingsSkeleton } from "@/components/settings/notification-settings-skeleton";
import { firstFieldError } from "@/lib/form-errors";
import {
  NOTIFICATION_CHANNEL_VALUES,
  NotificationChannelValue,
  type NotificationChannel,
  type NotificationPreferences,
  type UpdatePreferencesPayload,
} from "@/types/notifications";

const reminderTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const notificationPreferencesSchema = z.object({
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
  wrapped_alerts_enabled: z.boolean(),
  photo_tutorial_completed: z.boolean(),
});

function updateChannel(
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

function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferences;
}) {
  const t = useTranslations("settingsNotifications");
  const updatePrefs = useUpdateNotificationPreferences();
  const user = useAuthStore((s) => s.user);
  const isSaving = updatePrefs.isPending;

  const form = useForm({
    defaultValues: preferences,
    validators: {
      onChange: notificationPreferencesSchema,
      onSubmit: notificationPreferencesSchema,
    },
  });

  const persistPatch = (
    nextValues: NotificationPreferences,
    patch: UpdatePreferencesPayload,
  ) => {
    const parsed = notificationPreferencesSchema.safeParse(nextValues);
    if (!parsed.success) {
      return;
    }
    updatePrefs.mutate(patch, {
      onError: () => {
        form.reset(preferences);
        toast.error(t("updateFailed"));
      },
    });
  };

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(event) => event.preventDefault()}
      noValidate
    >
      <form.Subscribe selector={(state) => state.values}>
        {(values) => {
          const inApp = values.channels.includes(NotificationChannelValue.InApp);
          const email = values.channels.includes(NotificationChannelValue.Email);

          return (
            <>
              <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-semibold">
                    {t("photoReminderTitle")}
                  </p>
                  {isSaving ? (
                    <LoadingIndicator
                      size="sm"
                      label={t("saving")}
                      className="inline-flex items-center gap-1.5 text-xs text-muted"
                    />
                  ) : null}
                </div>
                <form.Field name="photo_reminder_enabled">
                  {(field) => (
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm text-muted">
                        {t("photoReminderBody")}
                      </p>
                      <Switch
                        aria-label={t("photoReminderTitle")}
                        disabled={isSaving}
                        checked={field.state.value}
                        onCheckedChange={(checked) => {
                          const nextValues = {
                            ...values,
                            photo_reminder_enabled: checked,
                          };
                          field.handleChange(checked);
                          persistPatch(nextValues, {
                            photo_reminder_enabled: checked,
                          });
                        }}
                      />
                    </div>
                  )}
                </form.Field>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <form.Field name="photo_reminder_local_time">
                    {(field) => (
                      <div>
                        <label
                          htmlFor={field.name}
                          className="mb-1 block text-sm font-medium"
                        >
                          {t("reminderTime")}
                        </label>
                        <TimePicker
                          id={field.name}
                          value={field.state.value?.slice(0, 5) ?? "08:00"}
                          onChange={(value) => {
                            field.handleChange(value);
                            if (!reminderTimePattern.test(value)) {
                              return;
                            }
                            persistPatch(
                              { ...values, photo_reminder_local_time: value },
                              { photo_reminder_local_time: value },
                            );
                          }}
                          onBlur={field.handleBlur}
                          disabled={isSaving || !values.photo_reminder_enabled}
                          invalid={field.state.meta.errors.length > 0}
                          ariaLabel={t("reminderTime")}
                          ariaDescribedBy={`${field.name}-hint`}
                          className="h-10 rounded-lg px-2.5 py-2 text-sm"
                        />
                        {field.state.meta.errors.length > 0 ? (
                          <p className="mt-1 text-sm text-danger" role="alert">
                            {firstFieldError(field.state.meta.errors, t)}
                          </p>
                        ) : null}
                        <p
                          id={`${field.name}-hint`}
                          className="mt-1.5 text-sm text-muted"
                        >
                          {t("reminderTimeNote", {
                            timeZone: user?.timeZone ?? "UTC",
                          })}
                        </p>
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="channels">
                    {(field) => (
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          {t("channels")}
                        </label>
                        <label className="mt-1 flex items-center gap-2 text-sm">
                          <Checkbox
                            disabled={isSaving}
                            checked={inApp}
                            onCheckedChange={(checked) => {
                              const channels = updateChannel(
                                values.channels,
                                NotificationChannelValue.InApp,
                                checked === true,
                              );
                              field.handleChange(channels);
                              persistPatch(
                                { ...values, channels },
                                { channels },
                              );
                            }}
                          />
                          {t("channelInApp")}
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-sm">
                          <Checkbox
                            disabled={isSaving}
                            checked={email}
                            onCheckedChange={(checked) => {
                              const channels = updateChannel(
                                values.channels,
                                NotificationChannelValue.Email,
                                checked === true,
                              );
                              field.handleChange(channels);
                              persistPatch(
                                { ...values, channels },
                                { channels },
                              );
                            }}
                          />
                          {t("channelEmail")}
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-sm text-muted">
                          <Checkbox checked={false} disabled />
                          {t("channelPush")}
                        </label>
                      </div>
                    )}
                  </form.Field>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <p className="text-base font-semibold">
                  {t("reactionAlertsTitle")}
                </p>
                <NotificationSwitch
                  label={t("reactionAlertsBody")}
                  checked={values.reaction_alerts_enabled}
                  disabled={isSaving}
                  onCheckedChange={(checked) => {
                    form.setFieldValue("reaction_alerts_enabled", checked);
                    persistPatch(
                      { ...values, reaction_alerts_enabled: checked },
                      { reaction_alerts_enabled: checked },
                    );
                  }}
                />
                <NotificationSwitch
                  label={t("autoSimplifyBody")}
                  checked={values.simplification_alerts_enabled}
                  disabled={isSaving}
                  onCheckedChange={(checked) => {
                    form.setFieldValue(
                      "simplification_alerts_enabled",
                      checked,
                    );
                    persistPatch(
                      {
                        ...values,
                        simplification_alerts_enabled: checked,
                      },
                      { simplification_alerts_enabled: checked },
                    );
                  }}
                />
                <p className="mt-1 text-sm text-muted">
                  {t("autoSimplifyNote")}
                </p>
              </section>

              <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <p className="text-base font-semibold">{t("insightsTitle")}</p>
                <NotificationSwitch
                  label={t("insightAlertsBody")}
                  checked={values.insight_alerts_enabled}
                  disabled={isSaving}
                  onCheckedChange={(checked) => {
                    form.setFieldValue("insight_alerts_enabled", checked);
                    persistPatch(
                      { ...values, insight_alerts_enabled: checked },
                      { insight_alerts_enabled: checked },
                    );
                  }}
                />
                <NotificationSwitch
                  label={t("wrappedAlertsBody")}
                  checked={values.wrapped_alerts_enabled}
                  disabled={isSaving}
                  onCheckedChange={(checked) => {
                    form.setFieldValue("wrapped_alerts_enabled", checked);
                    persistPatch(
                      { ...values, wrapped_alerts_enabled: checked },
                      { wrapped_alerts_enabled: checked },
                    );
                  }}
                />
              </section>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}

function NotificationSwitch({
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 py-2">
      <p className="text-sm text-muted">{label}</p>
      <Switch
        aria-label={label}
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export function NotificationsTab() {
  const t = useTranslations("settingsNotifications");
  const authLoading = useAuthStore((s) => s.isLoading);
  const preferencesQuery = useNotificationPreferences();
  const prefs = preferencesQuery.data;

  if (authLoading || (!prefs && preferencesQuery.isLoading)) {
    return <NotificationSettingsSkeleton includeHeader={false} />;
  }

  if (!prefs) {
    return (
      <RetryPanel
        title={t("errors.loadTitle")}
        description={t("errors.loadBody")}
        actionLabel={t("errors.retry")}
        onAction={() => {
          void preferencesQuery.refetch();
        }}
      />
    );
  }

  return <NotificationPreferencesForm preferences={prefs} />;
}
