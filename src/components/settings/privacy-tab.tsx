"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { AppRoute } from "@/constants/app-routes";

const LEGAL_LINKS = [
  { labelKey: "privacyPolicy", route: AppRoute.Privacy },
  { labelKey: "termsOfService", route: AppRoute.Terms },
  { labelKey: "cookieNotice", route: AppRoute.Cookies },
] as const;

export function PrivacyTab() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-8">
      <SettingsSection
        title={t("privacy.legalTitle")}
        description={t("privacy.legalDescription")}
      >
        {LEGAL_LINKS.map((link) => (
          <SettingsRow key={link.route} label={t(`privacy.${link.labelKey}`)}>
            <Link
              href={link.route}
              className="inline-flex items-center gap-1.5 text-sm text-accent-strong hover:underline"
            >
              {t("privacy.view")}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </SettingsRow>
        ))}
      </SettingsSection>

      <SettingsSection
        title={t("privacy.dataTitle")}
        description={t("privacy.dataDescription")}
      >
        <p className="py-4 text-sm text-muted">
          {t("privacy.dataExportNote")}
        </p>
      </SettingsSection>
    </div>
  );
}
