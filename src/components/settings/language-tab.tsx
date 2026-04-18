"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useUpdatePreferredLanguage } from "@/hooks/use-auth";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import type { Locale } from "@/i18n/config";

export function LanguageTab() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const updatePreferredLanguage = useUpdatePreferredLanguage();

  const handleLocaleChange = async (nextLocale: Locale) => {
    try {
      await updatePreferredLanguage.mutateAsync({
        preferredLanguage: nextLocale,
      });
      return true;
    } catch {
      toast.error(t("language.updateFailed"));
      return false;
    }
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
    </div>
  );
}
