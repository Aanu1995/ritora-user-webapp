"use client";

import { useTranslations } from "next-intl";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { ContactSupportButton } from "@/components/support/contact-support-button";

/**
 * Settings → Support section. Thin wrapper around the reusable
 * `ContactSupportButton` so the settings hub stays consistent with every
 * other place support is offered (dashboard header, error panels, etc.).
 */
export function SupportSection() {
  const t = useTranslations("settings.account");

  return (
    <SettingsSection
      title={t("support.title")}
      description={t("support.description")}
    >
      <SettingsRow
        label={t("support.contactTitle")}
        description={t("support.contactDescription")}
      >
        <ContactSupportButton variant="outline" size="sm" />
      </SettingsRow>
    </SettingsSection>
  );
}
