"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeviceTimeZone } from "@/hooks/use-device-time-zone";
import { useUpdatePreferredLanguage, useUpdateTimeZone } from "@/hooks/use-auth";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { TimeZoneSelect } from "@/components/ui/time-zone-select";
import {
  locales,
  type Locale,
  persistLocalePreference,
} from "@/i18n/config";
import { formatTimeZoneLabel } from "@/lib/time-zone";
import { useAuthStore } from "@/stores/auth-store";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  sv: "Svenska",
  es: "Español",
};

export function LanguageTab() {
  const t = useTranslations("settings");
  const tFooter = useTranslations("footer");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const updatePreferredLanguage = useUpdatePreferredLanguage();
  const updateTimeZone = useUpdateTimeZone();
  const user = useAuthStore((state) => state.user);
  const deviceTimeZone = useDeviceTimeZone();
  const savedTimeZone = user?.timeZone ?? null;
  const displayedTimeZone = savedTimeZone ?? deviceTimeZone;

  const [isRefreshing, startTransition] = useTransition();
  const [isApplying, setIsApplying] = useState(false);
  const isLanguageBusy =
    updatePreferredLanguage.isPending || isApplying || isRefreshing;

  const handleLocaleChange = async (next: string) => {
    const nextLocale = next as Locale;
    if (nextLocale === locale) return;

    setIsApplying(true);
    updatePreferredLanguage.mutate(
      { preferredLanguage: nextLocale },
      {
        onSuccess: () => {
          persistLocalePreference(nextLocale);
          startTransition(() => router.refresh());
          setIsApplying(false);
        },
        onError: () => {
          toast.error(t("language.updateFailed"));
          setIsApplying(false);
        },
      },
    );
  };

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
    <div className="space-y-5 sm:space-y-8">
      <SettingsSection
        title={t("language.title")}
        description={t("language.description")}
      >
        <SettingsRow
          label={t("language.displayLanguage")}
          description={t("language.current", {
            locale: LOCALE_LABELS[locale] ?? locale,
          })}
        >
          <div className="flex min-w-[220px] flex-col gap-2 sm:w-[260px]">
            <Select
              value={locale}
              onValueChange={(value) => {
                void handleLocaleChange(value);
              }}
              disabled={isLanguageBusy}
            >
              <SelectTrigger
                className="h-11"
                aria-label={tFooter("columns.language")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((option) => (
                  <SelectItem key={option} value={option}>
                    {LOCALE_LABELS[option] ?? option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="flex min-w-[220px] flex-col gap-2 sm:w-[260px]">
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
