"use client";

import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";

export function LanguageTab() {
  const t = useTranslations("settings");
  const locale = useLocale();

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
          <LanguageSwitcher />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
