"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Switch } from "@/components/ui/switch";
import {
  NotificationChannelPicker,
  type SectionProps,
} from "@/components/settings/notification-form-controls";
import {
  NotificationChannelValue,
  PRODUCT_EXPIRY_NOTICE_DAYS_MAX,
  PRODUCT_EXPIRY_NOTICE_DAYS_MIN,
} from "@/types/notifications";

const PRODUCT_EXPIRY_CHANNELS = [
  NotificationChannelValue.InApp,
  NotificationChannelValue.Push,
] as const;

function parseNoticeDays(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  if (
    parsed < PRODUCT_EXPIRY_NOTICE_DAYS_MIN ||
    parsed > PRODUCT_EXPIRY_NOTICE_DAYS_MAX
  ) {
    return null;
  }
  return parsed;
}

export function ProductExpiryAlertsSection({
  values,
  isSaving,
  controlsDisabled,
  form,
  t,
  persistPatch,
}: SectionProps) {
  const disabled = isSaving || controlsDisabled;
  const savedNoticeDays = String(values.product_expiry_notice_days);
  const [draftNoticeDaysState, setDraftNoticeDaysState] = useState({
    source: savedNoticeDays,
    value: savedNoticeDays,
    isEditing: false,
  });
  const draftNoticeDays =
    draftNoticeDaysState.isEditing &&
    draftNoticeDaysState.source === savedNoticeDays
      ? draftNoticeDaysState.value
      : savedNoticeDays;
  const parsedNoticeDays = parseNoticeDays(draftNoticeDays);
  const noticeDaysInvalid =
    draftNoticeDays.trim().length > 0 && parsedNoticeDays === null;
  const setDraftNoticeDays = (value: string) => {
    setDraftNoticeDaysState({
      source: savedNoticeDays,
      value,
      isEditing: true,
    });
  };

  const commitNoticeDays = () => {
    if (parsedNoticeDays === null) {
      setDraftNoticeDaysState({
        source: savedNoticeDays,
        value: savedNoticeDays,
        isEditing: false,
      });
      return;
    }

    if (parsedNoticeDays === values.product_expiry_notice_days) {
      setDraftNoticeDaysState({
        source: savedNoticeDays,
        value: savedNoticeDays,
        isEditing: false,
      });
      return;
    }

    if (controlsDisabled) {
      return;
    }

    form.setFieldValue("product_expiry_notice_days", parsedNoticeDays);
    setDraftNoticeDaysState({
      source: String(parsedNoticeDays),
      value: String(parsedNoticeDays),
      isEditing: false,
    });
    persistPatch(
      { ...values, product_expiry_notice_days: parsedNoticeDays },
      { product_expiry_notice_days: parsedNoticeDays },
    );
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">{t("productExpiryTitle")}</p>
        {isSaving ? (
          <LoadingIndicator
            size="sm"
            label={t("saving")}
            className="inline-flex items-center gap-1.5 text-xs text-muted"
          />
        ) : null}
      </div>

      <form.Field name="product_expiry_alerts_enabled">
        {(field) => (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">{t("productExpiryAlertsBody")}</p>
            <Switch
              aria-label={t("productExpiryAlertsTitle")}
              checked={values.product_expiry_alerts_enabled}
              disabled={disabled}
              onCheckedChange={(checked) => {
                field.handleChange(checked);
                persistPatch(
                  { ...values, product_expiry_alerts_enabled: checked },
                  { product_expiry_alerts_enabled: checked },
                );
              }}
            />
          </div>
        )}
      </form.Field>

      <NotificationChannelPicker
        fieldName="product_expiry_alert_channels"
        label={t("productExpiryAlertsTitle")}
        values={values}
        isSaving={disabled}
        form={form}
        t={t}
        persistPatch={persistPatch}
        disabled={controlsDisabled || !values.product_expiry_alerts_enabled}
        allowedChannels={PRODUCT_EXPIRY_CHANNELS}
        pushDisabled={!values.channels.includes(NotificationChannelValue.Push)}
      />

      <form.Field name="product_expiry_notice_days">
        {(field) => (
          <div className="mt-3 max-w-[260px]">
            <label
              htmlFor={field.name}
              className="mb-1 block text-sm font-medium"
            >
              {t("productExpiryNoticeDaysLabel")}
            </label>
            <Input
              id={field.name}
              type="number"
              inputMode="numeric"
              min={PRODUCT_EXPIRY_NOTICE_DAYS_MIN}
              max={PRODUCT_EXPIRY_NOTICE_DAYS_MAX}
              step={1}
              value={draftNoticeDays}
              disabled={disabled || !values.product_expiry_alerts_enabled}
              aria-invalid={noticeDaysInvalid}
              aria-describedby={`${field.name}-hint`}
              onChange={(event) => {
                setDraftNoticeDays(event.target.value);
              }}
              onBlur={commitNoticeDays}
              className="h-10 rounded-lg px-2.5 py-2 text-sm"
            />
            {noticeDaysInvalid ? (
              <p className="mt-1 text-sm text-danger" role="alert">
                {t("productExpiryNoticeDaysError", {
                  min: PRODUCT_EXPIRY_NOTICE_DAYS_MIN,
                  max: PRODUCT_EXPIRY_NOTICE_DAYS_MAX,
                })}
              </p>
            ) : null}
            <p
              id={`${field.name}-hint`}
              className="mt-1.5 whitespace-nowrap text-sm text-muted"
            >
              {t("productExpiryNoticeDaysHint", {
                min: PRODUCT_EXPIRY_NOTICE_DAYS_MIN,
                max: PRODUCT_EXPIRY_NOTICE_DAYS_MAX,
              })}
            </p>
          </div>
        )}
      </form.Field>
    </section>
  );
}
