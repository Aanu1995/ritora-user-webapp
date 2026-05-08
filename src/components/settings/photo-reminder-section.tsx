"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { firstFieldError } from "@/lib/form-errors";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationChannelValue } from "@/types/notifications";
import {
  getTimeFieldValue,
  reminderTimePattern,
  updateChannel,
  type SectionProps,
} from "@/components/settings/notification-form-controls";

export function PhotoReminderSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  const user = useAuthStore((s) => s.user);
  const inApp = values.channels.includes(NotificationChannelValue.InApp);
  const email = values.channels.includes(NotificationChannelValue.Email);
  const push = values.channels.includes(NotificationChannelValue.Push);
  const channelDisabled = isSaving || !values.photo_reminder_enabled;
  const pushChannelDisabled =
    channelDisabled || !push;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">{t("photoReminderTitle")}</p>
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
            <p className="text-sm text-muted">{t("photoReminderBody")}</p>
            <Switch
              aria-label={t("photoReminderTitle")}
              disabled={isSaving}
              checked={values.photo_reminder_enabled}
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
                value={getTimeFieldValue(field.state.value, "08:00")}
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
              <label
                className={`mt-1 flex items-center gap-2 text-sm ${
                  channelDisabled ? "text-muted" : ""
                }`}
              >
                <Checkbox
                  disabled={channelDisabled}
                  checked={inApp}
                  onCheckedChange={(checked) => {
                    const channels = updateChannel(
                      values.channels,
                      NotificationChannelValue.InApp,
                      checked === true,
                    );
                    field.handleChange(channels);
                    persistPatch({ ...values, channels }, { channels });
                  }}
                />
                {t("channelInApp")}
              </label>
              <label
                className={`mt-2 flex items-center gap-2 text-sm ${
                  channelDisabled ? "text-muted" : ""
                }`}
              >
                <Checkbox
                  disabled={channelDisabled}
                  checked={email}
                  onCheckedChange={(checked) => {
                    const channels = updateChannel(
                      values.channels,
                      NotificationChannelValue.Email,
                      checked === true,
                    );
                    field.handleChange(channels);
                    persistPatch({ ...values, channels }, { channels });
                  }}
                />
                {t("channelEmail")}
              </label>
              <label
                className={`mt-2 flex items-center gap-2 text-sm ${
                  pushChannelDisabled ? "text-muted" : ""
                }`}
              >
                <Checkbox
                  disabled={pushChannelDisabled}
                  checked={push}
                  onCheckedChange={(checked) => {
                    const channels = updateChannel(
                      values.channels,
                      NotificationChannelValue.Push,
                      checked === true,
                    );
                    field.handleChange(channels);
                    persistPatch({ ...values, channels }, { channels });
                  }}
                />
                {t("channelPush")}
              </label>
            </div>
          )}
        </form.Field>
      </div>
    </section>
  );
}
