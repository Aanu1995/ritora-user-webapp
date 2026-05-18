"use client";

import { Input } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationSwitch,
  reminderTimePattern,
  type SectionProps,
} from "@/components/settings/notification-form-controls";
import {
  INSIGHT_CADENCE_VALUES,
  type InsightCadence,
} from "@/types/notifications";

const INSIGHT_DIGEST_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export function InsightsNotificationSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">{t("insightsTitle")}</p>
        {isSaving ? (
          <LoadingIndicator
            size="sm"
            label={t("saving")}
            className="inline-flex items-center gap-1.5 text-xs text-muted"
          />
        ) : null}
      </div>
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
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <form.Field name="insight_cadence">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium"
              >
                {t("insightCadenceLabel")}
              </label>
              <Select
                value={values.insight_cadence}
                disabled={isSaving}
                onValueChange={(raw) => {
                  const cadence = raw as InsightCadence;
                  field.handleChange(cadence);
                  persistPatch(
                    { ...values, insight_cadence: cadence },
                    { insight_cadence: cadence },
                  );
                }}
              >
                <SelectTrigger id={field.name} className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSIGHT_CADENCE_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`insightCadence.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
        <form.Field name="insight_digest_day">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium"
              >
                {t("insightDigestDayLabel")}
              </label>
              <Select
                value={String(values.insight_digest_day)}
                disabled={isSaving}
                onValueChange={(raw) => {
                  const day = Number(raw);
                  field.handleChange(day);
                  persistPatch(
                    { ...values, insight_digest_day: day },
                    { insight_digest_day: day },
                  );
                }}
              >
                <SelectTrigger id={field.name} className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSIGHT_DIGEST_DAYS.map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {t(`insightDigestDays.${day}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
        <form.Field name="insight_digest_local_time">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium"
              >
                {t("insightDigestTimeLabel")}
              </label>
              <Input
                id={field.name}
                type="time"
                value={String(values.insight_digest_local_time)}
                disabled={isSaving}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={(event) => {
                  field.handleBlur();
                  const next = event.currentTarget.value;
                  if (!reminderTimePattern.test(next)) return;
                  persistPatch(
                    { ...values, insight_digest_local_time: next },
                    { insight_digest_local_time: next },
                  );
                }}
              />
            </div>
          )}
        </form.Field>
      </div>
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
  );
}
