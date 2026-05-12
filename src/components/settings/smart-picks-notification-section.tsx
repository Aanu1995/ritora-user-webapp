"use client";

import {
  NotificationSwitch,
  type SectionProps,
} from "@/components/settings/notification-form-controls";

export function SmartPicksNotificationSection({
  values,
  isSaving,
  form,
  t,
  persistPatch,
}: SectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-base font-semibold">{t("smartPicksTitle")}</p>
      <p className="mt-2 text-sm text-muted">{t("smartPicksBody")}</p>
      <NotificationSwitch
        label={t("smartPickReadyTitle")}
        body={t("smartPickReadyBody")}
        checked={values.smart_pick_ready_enabled}
        disabled={isSaving}
        onCheckedChange={(checked) => {
          form.setFieldValue("smart_pick_ready_enabled", checked);
          persistPatch(
            { ...values, smart_pick_ready_enabled: checked },
            { smart_pick_ready_enabled: checked },
          );
        }}
      />
    </section>
  );
}
