"use client";

import {
  NotificationChannelPicker,
  NotificationSwitch,
  type SectionProps,
} from "@/components/settings/notification-form-controls";
import { NotificationChannelValue } from "@/types/notifications";

export function ReactionAlertsSection({
  values,
  isSaving,
  controlsDisabled,
  form,
  t,
  persistPatch,
}: SectionProps) {
  const disabled = isSaving || controlsDisabled;
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-base font-semibold">{t("reactionAlertsTitle")}</p>
      <NotificationSwitch
        label={t("reactionAlertsBody")}
        checked={values.reaction_alerts_enabled}
        disabled={disabled}
        onCheckedChange={(checked) => {
          form.setFieldValue("reaction_alerts_enabled", checked);
          persistPatch(
            { ...values, reaction_alerts_enabled: checked },
            { reaction_alerts_enabled: checked },
          );
        }}
      />
      <NotificationChannelPicker
        fieldName="reaction_alert_channels"
        label={t("reactionDetectedTitle")}
        values={values}
        isSaving={disabled}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={controlsDisabled || !values.reaction_alerts_enabled}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />
      <NotificationSwitch
        label={t("autoSimplifyBody")}
        checked={values.simplification_alerts_enabled}
        disabled={disabled}
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
      <NotificationChannelPicker
        fieldName="simplification_alert_channels"
        label={t("routineSimplificationTitle")}
        values={values}
        isSaving={disabled}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={controlsDisabled || !values.simplification_alerts_enabled}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />
      <p className="mt-1 text-sm text-muted">{t("autoSimplifyNote")}</p>
    </section>
  );
}
