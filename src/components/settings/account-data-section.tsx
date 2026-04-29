"use client";

import { useTranslations } from "next-intl";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";

export function AccountDataSection() {
  const tConsent = useTranslations("skinProfile.consentCenter");

  return (
    <SettingsSection
      title={tConsent("yourDataTitle")}
      description={tConsent("yourDataDesc")}
    >
      <SettingsRow
        label={tConsent("downloadTitle")}
        description={tConsent("downloadDesc")}
      >
        <Button type="button" variant="outline" size="sm" disabled>
          {tConsent("comingSoon")}
        </Button>
      </SettingsRow>
      <SettingsRow
        label={tConsent("deleteTitle")}
        description={tConsent("deleteDesc")}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="border-danger text-danger"
        >
          {tConsent("comingSoon")}
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}
