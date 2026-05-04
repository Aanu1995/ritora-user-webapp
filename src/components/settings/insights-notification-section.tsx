"use client";

import {
  NotificationSwitch,
  type SectionProps,
} from "@/components/settings/notification-form-controls";

export function InsightsNotificationSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  return (
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
        label={t("aiRefinedInsightsBody")}
        checked={values.ai_polished_insights_enabled}
        disabled={isSaving}
        onCheckedChange={(checked) => {
          form.setFieldValue("ai_polished_insights_enabled", checked);
          persistPatch(
            { ...values, ai_polished_insights_enabled: checked },
            { ai_polished_insights_enabled: checked },
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
  );
}
