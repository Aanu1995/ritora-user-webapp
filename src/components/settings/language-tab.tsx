"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useDeviceTimeZone } from "@/hooks/use-device-time-zone";
import { useUpdatePreferredLanguage, useUpdateTimeZone } from "@/hooks/use-auth";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { TimeZoneSelect } from "@/components/ui/time-zone-select";
import type { Locale } from "@/i18n/config";
import { formatTimeZoneLabel } from "@/lib/time-zone";
import { useAuthStore } from "@/stores/auth-store";

export function LanguageTab() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const updatePreferredLanguage = useUpdatePreferredLanguage();
  const updateTimeZone = useUpdateTimeZone();
  const user = useAuthStore((state) => state.user);
  const deviceTimeZone = useDeviceTimeZone();
  const savedTimeZone = user?.timeZone ?? null;
  const displayedTimeZone = savedTimeZone ?? deviceTimeZone;

  const handleLocaleChange = (nextLocale: Locale) =>
    new Promise<boolean>((resolve) => {
      updatePreferredLanguage.mutate(
        {
          preferredLanguage: nextLocale,
        },
        {
          onSuccess: () => resolve(true),
          onError: () => {
            toast.error(t("language.updateFailed"));
            resolve(false);
          },
        },
      );
    });

  const applyTimeZoneChange = (timeZone: string) => {
    if (!timeZone || timeZone === savedTimeZone) {
      return;
    }

    updateTimeZone.mutate(
      { timeZone },
      {
        onSuccess: () => {
          toast.success(
            t("timeZone.updateSuccess", {
              timeZone: formatTimeZoneLabel(timeZone),
            }),
          );
        },
        onError: () => {
          toast.error(t("timeZone.updateFailed"));
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <SettingsSection
        title={t("language.title")}
        description={t("language.description")}
      >
        <SettingsRow
          label={t("language.displayLanguage")}
          description={t("language.current", { locale: locale.toUpperCase() })}
        >
          <LanguageSwitcher
            isSaving={updatePreferredLanguage.isPending}
            persistLocallyAfterExternalChange={false}
            onLocaleChange={handleLocaleChange}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title={t("timeZone.title")}
        description={t("timeZone.description")}
      >
        <SettingsRow
          label={t("timeZone.label")}
          description={
            displayedTimeZone
              ? t("timeZone.current", {
                  timeZone: formatTimeZoneLabel(displayedTimeZone),
                })
              : t("timeZone.unavailable")
          }
        >
          <div className="flex min-w-[260px] flex-col gap-2 sm:w-[320px]">
            <TimeZoneSelect
              value={savedTimeZone}
              onChange={applyTimeZoneChange}
              ariaLabel={t("timeZone.label")}
              disabled={updateTimeZone.isPending}
            />
            {deviceTimeZone ? (
              <p className="text-xs text-muted">
                {t("timeZone.deviceCurrent", {
                  timeZone: formatTimeZoneLabel(deviceTimeZone),
                })}
              </p>
            ) : null}
            {deviceTimeZone && deviceTimeZone !== savedTimeZone ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => applyTimeZoneChange(deviceTimeZone)}
                disabled={updateTimeZone.isPending}
              >
                {t("timeZone.useDevice", {
                  timeZone: formatTimeZoneLabel(deviceTimeZone),
                })}
              </Button>
            ) : null}
          </div>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
