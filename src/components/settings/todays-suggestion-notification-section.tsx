"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationChannelPicker,
  NotificationSwitch,
  type SectionProps,
} from "@/components/settings/notification-form-controls";
import { NotificationChannelValue } from "@/types/notifications";

const LEAD_TIME_OPTIONS = [30, 60, 90, 120, 180, 240, 360, 480, 720] as const;

export function TodaysSuggestionSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  return (
    <section className="rounded-2xl border border-[color:rgba(47,122,82,0.3)] bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">{t("todaysSuggestionTitle")}</p>
      </div>
      <p className="mt-2 text-sm text-muted">{t("todaysSuggestionBody")}</p>

      <NotificationSwitch
        label={t("suggestionReadyTitle")}
        body={t("suggestionReadyBody")}
        checked={values.suggestion_ready_enabled}
        disabled={isSaving}
        onCheckedChange={(checked) => {
          form.setFieldValue("suggestion_ready_enabled", checked);
          persistPatch(
            { ...values, suggestion_ready_enabled: checked },
            { suggestion_ready_enabled: checked },
          );
        }}
      />
      <NotificationChannelPicker
        fieldName="suggestion_ready_channels"
        label={t("suggestionReadyTitle")}
        values={values}
        isSaving={isSaving}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={!values.suggestion_ready_enabled}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />
      <NotificationSwitch
        label={t("slotStartTitle")}
        body={t("slotStartBody")}
        checked={values.slot_start_enabled}
        disabled={isSaving}
        onCheckedChange={(checked) => {
          form.setFieldValue("slot_start_enabled", checked);
          persistPatch(
            { ...values, slot_start_enabled: checked },
            { slot_start_enabled: checked },
          );
        }}
      />
      <NotificationChannelPicker
        fieldName="slot_start_channels"
        label={t("slotStartTitle")}
        values={values}
        isSaving={isSaving}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={!values.slot_start_enabled}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />
      <NotificationSwitch
        label={t("recordingReminderTitle")}
        body={t("recordingReminderBody")}
        checked={values.recording_reminder_enabled}
        disabled={isSaving}
        onCheckedChange={(checked) => {
          form.setFieldValue("recording_reminder_enabled", checked);
          persistPatch(
            { ...values, recording_reminder_enabled: checked },
            { recording_reminder_enabled: checked },
          );
        }}
      />
      <NotificationChannelPicker
        fieldName="recording_reminder_channels"
        label={t("recordingReminderTitle")}
        values={values}
        isSaving={isSaving}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={!values.recording_reminder_enabled}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />

      <div className="mt-3">
        <form.Field name="suggestion_lead_time_minutes">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium"
              >
                {t("leadTimeLabel")}
              </label>
              <Select
                value={String(values.suggestion_lead_time_minutes)}
                disabled={isSaving}
                onValueChange={(raw) => {
                  const next = Number(raw);
                  field.handleChange(next);
                  persistPatch(
                    { ...values, suggestion_lead_time_minutes: next },
                    { suggestion_lead_time_minutes: next },
                  );
                }}
              >
                <SelectTrigger
                  id={field.name}
                  className="h-11 w-full max-w-[260px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_TIME_OPTIONS.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {t("leadTimeOption", { minutes: value })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted">{t("leadTimeNote")}</p>
            </div>
          )}
        </form.Field>
      </div>
    </section>
  );
}
