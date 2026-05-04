"use client";

import {
  NotificationSwitch,
  type SectionProps,
} from "@/components/settings/notification-form-controls";

export function ReactionAlertsSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-base font-semibold">{t("reactionAlertsTitle")}</p>
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
          form.setFieldValue("simplification_alerts_enabled", checked);
          persistPatch(
            {
              ...values,
              simplification_alerts_enabled: checked,
            },
            { simplification_alerts_enabled: checked },
          );
        }}
      />
      <p className="mt-1 text-sm text-muted">{t("autoSimplifyNote")}</p>
    </section>
  );
}
