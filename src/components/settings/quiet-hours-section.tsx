"use client";

import { TimePicker } from "@/components/ui/time-picker";
import { useAuthStore } from "@/stores/auth-store";
import {
  getTimeFieldValue,
  NotificationSwitch,
  reminderTimePattern,
  type SectionProps,
} from "@/components/settings/notification-form-controls";

export function QuietHoursSection({
  values,
  isSaving,
  controlsDisabled,
  form,
  t,
  persistPatch,
}: SectionProps) {
  const user = useAuthStore((s) => s.user);
  const disabled = isSaving || controlsDisabled;
  return (
    <section className="rounded-2xl border border-[color:rgba(47,122,82,0.3)] bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">{t("quietHoursTitle")}</p>
      </div>
      <p className="mt-2 text-sm text-muted">{t("quietHoursBody")}</p>

      <NotificationSwitch
        label={t("quietHoursActive")}
        checked={values.quiet_hours_enabled}
        disabled={disabled}
        onCheckedChange={(checked) => {
          form.setFieldValue("quiet_hours_enabled", checked);
          persistPatch(
            { ...values, quiet_hours_enabled: checked },
            { quiet_hours_enabled: checked },
          );
        }}
      />

      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm font-medium">{t("from")}</span>
        <form.Field name="quiet_hours_start">
          {(field) => (
            <TimePicker
              id={field.name}
              value={getTimeFieldValue(field.state.value, "22:30")}
              onChange={(value) => {
                field.handleChange(value);
                if (!reminderTimePattern.test(value)) return;
                persistPatch(
                  { ...values, quiet_hours_start: value },
                  { quiet_hours_start: value },
                );
              }}
              disabled={disabled || !values.quiet_hours_enabled}
              ariaLabel={t("from")}
              className="h-10 rounded-lg px-2.5 py-2 text-sm"
            />
          )}
        </form.Field>
        <span className="text-sm text-muted">{t("to")}</span>
        <form.Field name="quiet_hours_end">
          {(field) => (
            <TimePicker
              id={field.name}
              value={getTimeFieldValue(field.state.value, "06:30")}
              onChange={(value) => {
                field.handleChange(value);
                if (!reminderTimePattern.test(value)) return;
                persistPatch(
                  { ...values, quiet_hours_end: value },
                  { quiet_hours_end: value },
                );
              }}
              disabled={disabled || !values.quiet_hours_enabled}
              ariaLabel={t("to")}
              className="h-10 rounded-lg px-2.5 py-2 text-sm"
            />
          )}
        </form.Field>
      </div>
      <p className="mt-2 text-sm text-muted">
        {t("quietHoursTzNote", { timeZone: user?.timeZone ?? "UTC" })}
      </p>
    </section>
  );
}
