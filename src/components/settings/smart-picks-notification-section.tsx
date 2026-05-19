"use client";

import {
  NotificationChannelPicker,
  NotificationSwitch,
  type SectionProps,
} from "@/components/settings/notification-form-controls";
import { NotificationChannelValue } from "@/types/notifications";

const SMART_PICK_CHANNELS = [
  NotificationChannelValue.InApp,
  NotificationChannelValue.Push,
] as const;

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
      <NotificationChannelPicker
        fieldName="smart_pick_ready_channels"
        label={t("smartPickReadyTitle")}
        values={values}
        isSaving={isSaving}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={!values.smart_pick_ready_enabled}
        allowedChannels={SMART_PICK_CHANNELS}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />
    </section>
  );
}
